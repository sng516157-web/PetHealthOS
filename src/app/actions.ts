"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { cookies, headers } from "next/headers";
import { randomBytes } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import {
  requireActiveOrg,
  getPetForAI,
  getOrgUsage,
  getUserUsage,
  canAccessPet,
} from "@/lib/data";
import { isAdmin, adminSignIn, adminSignOut } from "@/lib/admin";
import { notifyAdmins } from "@/lib/email";
import {
  structureLogEntry,
  generateTriage,
  heuristicStructure,
  hasAI,
} from "@/lib/ai";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";
import {
  hashPassword,
  verifyPassword,
  setSession,
  clearSession,
  clearUserSession,
  hasActiveSession,
  getCurrentUser,
} from "@/lib/auth";
import { requestOtp, verifyOtp, normalizePhone, isValidPhone } from "@/lib/sms";
import { getOrgPlan } from "@/lib/plans";
import {
  GUARANTEE_TYPES,
  GUARANTEE_PRESET_DAYS,
  type GuaranteeType,
} from "@/lib/constants";
import {
  startCheckout,
  buyOwnerPetSlot,
  type CheckoutScope,
  type Provider,
} from "@/lib/billing";
import {
  normalizeEmail,
  validateEmail,
  validatePassword,
  validateRequiredName,
  validateWeightKg,
  validatePetSex,
  validatePetPhoto,
  validatePetDates,
  parseWeightKg,
  validatePastOrToday,
  validateDate,
  validatePositiveInt,
  isValidEmail,
  VErr,
  NAME_MAX,
  ORG_NAME_MAX,
  NOTE_MAX,
  TITLE_MAX,
  GUARANTEE_DAYS_MAX,
} from "@/lib/validation";

const SPECIES = ["DOG", "CAT"];

type PetFields = {
  name: string;
  species: string;
  sex: string;
  breed: string;
  color: string;
  birthDate: Date | null;
  intakeAt: Date | null;
  weightKg: number;
  notes: string | null;
};

// Shared validation for the pet create forms (breeder + owner). Every field is
// required except sire, dam (handled in addPet), general notes, and the date
// pair — at least one of birth date or intake date must be provided. Returns a
// `{ error: CODE }` the client maps to a localized message, or the clean values.
function readPetFields(formData: FormData): { error: string } | { data: PetFields } {
  const name = String(formData.get("name") || "").trim();
  const nameErr = validateRequiredName(name);
  if (nameErr) return { error: nameErr };

  const breed = String(formData.get("breed") || "").trim();
  const breedErr = validateRequiredName(breed, VErr.BREED_REQUIRED);
  if (breedErr) return { error: breedErr };

  const color = String(formData.get("color") || "").trim();
  const colorErr = validateRequiredName(color, VErr.COLOR_REQUIRED);
  if (colorErr) return { error: colorErr };

  const notes = String(formData.get("notes") || "").trim();
  if (notes.length > NOTE_MAX) return { error: VErr.NOTE_TOO_LONG };

  const birthDateRaw = String(formData.get("birthDate") || "");
  const intakeAtRaw = String(formData.get("intakeAt") || "");
  const dateErrs = validatePetDates(birthDateRaw, intakeAtRaw);
  if (dateErrs) {
    if (dateErrs.dates) return { error: dateErrs.dates };
    if (dateErrs.birth) return { error: dateErrs.birth };
    if (dateErrs.intake) return { error: dateErrs.intake };
  }

  const weightRaw = String(formData.get("weightKg") || "");
  const weightErr = validateWeightKg(weightRaw, true);
  if (weightErr) return { error: weightErr };

  const speciesRaw = String(formData.get("species") || "");
  if (!SPECIES.includes(speciesRaw)) return { error: VErr.REQUIRED };

  const sexRaw = String(formData.get("sex") || "");
  const sexErr = validatePetSex(sexRaw);
  if (sexErr) return { error: sexErr };

  const weightKg = parseWeightKg(weightRaw);
  if (weightKg == null) return { error: VErr.WEIGHT_INVALID };

  return {
    data: {
      name,
      species: speciesRaw,
      sex: sexRaw,
      breed,
      color,
      birthDate: birthDateRaw ? new Date(birthDateRaw) : null,
      intakeAt: intakeAtRaw ? new Date(intakeAtRaw) : null,
      weightKg,
      notes: notes || null,
    },
  };
}

export async function setLocale(locale: string) {
  if (!isLocale(locale)) return { error: "Unsupported locale" };
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return { ok: true };
}

// Persist an uploaded file and return its public URL.
// In production (Vercel) the filesystem is read-only, so use Vercel Blob when a
// token is present; otherwise fall back to public/uploads for local dev.
async function saveUpload(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().slice(0, 8);
  const fileName = `${randomBytes(8).toString("hex")}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${fileName}`, file, { access: "public" });
    return blob.url;
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), bytes);
  return `/uploads/${fileName}`;
}

// Store a sensitive KYC document (business licence / proof of business) and
// return a prefixed reference the admin doc proxy knows how to read back:
//   "blob:<pathname>"  — private Blob (preferred; store must allow private)
//   "bloburl:<url>"    — public Blob fallback when the store isn't private-
//                        capable. The URL is unguessable and only ever served
//                        through the admin-gated proxy, never linked in the UI.
//   "local:<pathname>" — dev only, stored outside /public so it isn't served.
async function saveVerificationDoc(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().slice(0, 8);
  const pathname = `verification/${randomBytes(12).toString("hex")}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    try {
      await put(pathname, file, { access: "private", addRandomSuffix: false });
      return `blob:${pathname}`;
    } catch {
      // Store doesn't support private access — fall back to a public blob with
      // a random, unguessable path. Still gated behind the admin proxy.
      const res = await put(pathname, file, {
        access: "public",
        addRandomSuffix: true,
      });
      return `bloburl:${res.url}`;
    }
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), ".uploads", "verification");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(process.cwd(), ".uploads", pathname), bytes);
  return `local:${pathname}`;
}

export async function addPet(formData: FormData) {
  const org = await requireActiveOrg();
  const fields = readPetFields(formData);
  if ("error" in fields) return { error: fields.error };

  // Hard quota: cannot exceed the plan's effective pet limit.
  const usage = await getOrgUsage();
  if (usage.count >= usage.limit) {
    return { error: "QUOTA_REACHED", quota: true, limit: usage.limit };
  }

  const photo = formData.get("photo") as File | null;
  const photoErr = validatePetPhoto(photo);
  if (photoErr) return { error: photoErr };
  const photoUrl = await saveUpload(photo as File);

  const pet = await prisma.pet.create({
    data: {
      orgId: org.id,
      ...fields.data,
      photoUrl,
      sireId: String(formData.get("sireId") || "") || null,
      damId: String(formData.get("damId") || "") || null,
    },
  });
  revalidatePath("/app");
  revalidatePath("/app/pets");
  return { id: pet.id };
}

export async function addLogEntry(petId: string, formData: FormData) {
  const text = String(formData.get("rawText") || "").trim();
  if (text.length > NOTE_MAX) return { error: VErr.NOTE_TOO_LONG };
  const occurredAt = String(formData.get("occurredAt") || "") || undefined;
  if (occurredAt) {
    const dErr = validateDate(occurredAt, false);
    if (dErr) return { error: dErr };
  }
  const hasText = Boolean(text);

  // Optional photo/video. Images inform the AI only when there's a written note
  // to anchor them; videos are stored & shown but not analysed. Cap at 10 MB to
  // stay under the Server Action body limit.
  const media = formData.get("photo") as File | null;
  let imageUrl: string | null = null;
  let imageMime: string | null = null;
  let imageBytes: Buffer | null = null;
  if (media && media.size > 0 && media.size <= 10 * 1024 * 1024) {
    imageUrl = await saveUpload(media);
    imageMime = media.type || null;
    // Only read the bytes for AI when there's text to ground the image.
    if (hasText && media.type?.startsWith("image/")) {
      imageBytes = Buffer.from(await media.arrayBuffer());
    }
  }

  // Need either a note or a photo to log something.
  if (!hasText && !imageUrl) return { error: "Entry cannot be empty" };

  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet) return { error: "Pet not found" };

  const locale = await getLocale();

  // Photo-only entry: log it as-is with NO AI. Vision without a written note can
  // hallucinate misleading tags/observations, so we just record "Photo log".
  if (!hasText) {
    const photoTitle = locale === "zh" ? "照片记录" : "Photo log";
    await prisma.logEntry.create({
      data: {
        petId,
        rawText: locale === "zh" ? "📷 照片记录" : "📷 Photo log",
        occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
        imageUrl,
        imageMime,
        type: "OBSERVATION",
        severity: "NONE",
        title: photoTitle,
        summary: null,
        tags: "[]",
        aiProcessed: true,
      },
    });
    await prisma.pet.update({ where: { id: petId }, data: { updatedAt: new Date() } });
    revalidatePath(`/app/pets/${petId}`);
    revalidatePath(`/me/pets/${petId}`);
    revalidatePath("/app");
    return {
      ok: true,
      structured: { type: "OBSERVATION", severity: "NONE", title: photoTitle, tags: [] },
      imageUrl,
    };
  }

  // Save instantly with a fast local heuristic so the UI never waits on the
  // model. If an AI key is set, refine the structured fields in the background
  // (Vercel keeps the function warm via after()), so the entry is enriched a
  // moment later without blocking the click.
  const initial = heuristicStructure(text);
  const entry = await prisma.logEntry.create({
    data: {
      petId,
      rawText: text,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      imageUrl,
      imageMime,
      type: initial.type,
      severity: initial.severity,
      title: initial.title,
      summary: initial.summary,
      tags: JSON.stringify(initial.tags),
      aiProcessed: false,
    },
  });

  await prisma.pet.update({ where: { id: petId }, data: { updatedAt: new Date() } });

  if (hasAI()) {
    const aiImage = imageBytes
      ? { data: new Uint8Array(imageBytes), mediaType: imageMime ?? "image/jpeg" }
      : undefined;
    after(async () => {
      try {
        const structured = await structureLogEntry(text, pet, locale, aiImage);
        await prisma.logEntry.update({
          where: { id: entry.id },
          data: {
            type: structured.type,
            severity: structured.severity,
            title: structured.title,
            summary: structured.summary,
            tags: JSON.stringify(structured.tags),
            aiProcessed: true,
          },
        });
        revalidatePath(`/app/pets/${petId}`);
        revalidatePath(`/me/pets/${petId}`);
      } catch (e) {
        console.error("background log structuring failed", e);
      }
    });
  }

  revalidatePath(`/app/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  revalidatePath("/app");
  return { ok: true, structured: initial, imageUrl };
}

export async function deleteLogEntry(petId: string, id: string) {
  const entry = await prisma.logEntry.findUnique({ where: { id } });
  if (entry?.lockedAt) {
    return {
      error:
        "This entry is part of a passport that's already been issued and can't be edited.",
    };
  }
  await prisma.logEntry.delete({ where: { id } });
  revalidatePath(`/app/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  return { ok: true };
}

export async function addReminder(petId: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: VErr.TITLE_REQUIRED };
  if (title.length > TITLE_MAX) return { error: VErr.TITLE_TOO_LONG };
  const dueAt = String(formData.get("dueAt") || "");
  const dueErr = validateDate(dueAt, true);
  if (dueErr) return { error: dueErr };
  const notes = String(formData.get("notes") || "").trim();
  if (notes.length > NOTE_MAX) return { error: VErr.NOTE_TOO_LONG };

  await prisma.reminder.create({
    data: {
      petId,
      title,
      category: String(formData.get("category") || "OTHER"),
      dueAt: new Date(dueAt),
      recurrence: String(formData.get("recurrence") || "") || null,
      notes: notes || null,
    },
  });
  revalidatePath(`/app/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  revalidatePath("/app/reminders");
  return { ok: true };
}

export async function toggleReminder(id: string) {
  const r = await prisma.reminder.findUnique({ where: { id } });
  if (!r) return { error: "Not found" };
  await prisma.reminder.update({
    where: { id },
    data: { completed: !r.completed },
  });
  revalidatePath(`/app/pets/${r.petId}`);
  revalidatePath(`/me/pets/${r.petId}`);
  revalidatePath("/app/reminders");
  return { ok: true };
}

export async function generateTriageReport(petId: string) {
  if (!(await canAccessPet(petId))) return { error: "Forbidden" };
  const pet = await getPetForAI(petId);
  if (!pet) return { error: "Pet not found" };

  const locale = await getLocale();
  const result = await generateTriage(pet, pet.logs, locale);
  const report = await prisma.triageReport.create({
    data: {
      petId,
      urgency: result.urgency,
      summary: result.summary,
      content: JSON.stringify(result),
    },
  });
  revalidatePath(`/app/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  revalidatePath(`/app/pets/${petId}/triage`);
  revalidatePath(`/me/pets/${petId}/triage`);
  return { id: report.id };
}

export async function addAttachment(petId: string, formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Choose a file to upload" };
  if (file.size > 8 * 1024 * 1024) return { error: "File must be under 8 MB" };

  const url = await saveUpload(file);

  await prisma.attachment.create({
    data: {
      petId,
      kind: String(formData.get("kind") || "OTHER"),
      label: String(formData.get("label") || "") || file.name,
      url,
      mimeType: file.type || null,
    },
  });
  revalidatePath(`/app/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  return { ok: true };
}

export async function updatePetPhoto(petId: string, formData: FormData) {
  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return { error: "Choose an image" };
  if (file.size > 8 * 1024 * 1024) return { error: "Image must be under 8 MB" };

  const url = await saveUpload(file);
  await prisma.pet.update({ where: { id: petId }, data: { photoUrl: url } });
  revalidatePath(`/app/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  revalidatePath("/app/pets");
  revalidatePath("/app");
  return { ok: true, url };
}

export async function deleteAttachment(petId: string, id: string) {
  await prisma.attachment.delete({ where: { id } });
  revalidatePath(`/app/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  return { ok: true };
}

export async function createTransfer(petId: string, formData: FormData) {
  // Only organisations on a passport-capable plan can issue health passports.
  // Owner's Accounts (owner-managed pets, no org) cannot — enforced here, not
  // just hidden in the UI.
  const subject = await prisma.pet.findUnique({
    where: { id: petId },
    include: { org: true },
  });
  if (!subject) return { error: "Pet not found" };
  if (!subject.org || !getOrgPlan(subject.org.plan).canIssuePassport) {
    return { error: "PASSPORT_NOT_ALLOWED" };
  }
  // Trust gate: only shops the PawSure team has verified may issue passports.
  if (subject.org.verificationStatus !== "APPROVED") {
    return { error: "NOT_VERIFIED" };
  }
  // One passport per pet — ever. Once issued, the pet moves to the shop's
  // archived list and no second passport can be created.
  const existing = await prisma.transfer.findFirst({
    where: { petId },
    select: { id: true, claimedAt: true },
  });
  if (existing) {
    return { error: existing.claimedAt ? "ALREADY_CLAIMED" : "ALREADY_ISSUED" };
  }
  if (subject.status === "TRANSFERRED" || subject.status === "ARCHIVED") {
    return { error: "ALREADY_ISSUED" };
  }

  const token = randomBytes(8).toString("hex");
  const note = String(formData.get("note") || "").trim();
  if (note.length > NOTE_MAX) return { error: VErr.NOTE_TOO_LONG };

  const visibility =
    String(formData.get("visibility") || "READONLY_COPY") === "SHARED"
      ? "SHARED"
      : "READONLY_COPY";
  const claimable = formData.get("claimable") === "on";

  // Health guarantee — the breeder's warranty, frozen into the passport.
  const rawType = String(formData.get("guaranteeType") || "NONE");
  const guaranteeType = (GUARANTEE_TYPES as readonly string[]).includes(rawType)
    ? (rawType as GuaranteeType)
    : "NONE";
  let guaranteeDays: number | null = GUARANTEE_PRESET_DAYS[guaranteeType];
  if (guaranteeType === "CUSTOM") {
    const daysRaw = String(formData.get("guaranteeDays") || "");
    const daysErr = validatePositiveInt(daysRaw, GUARANTEE_DAYS_MAX, true);
    if (daysErr) return { error: daysErr };
    guaranteeDays = Math.round(Number(daysRaw));
  }
  const guaranteeTermsRaw = String(formData.get("guaranteeTerms") || "").trim();
  if (guaranteeTermsRaw.length > NOTE_MAX) return { error: VErr.TERMS_TOO_LONG };
  const guaranteeTerms =
    guaranteeType === "NONE" ? null : guaranteeTermsRaw || null;

  const vetCheckedRaw = String(formData.get("vetCheckedAt") || "");
  const vetErr = validatePastOrToday(vetCheckedRaw, false);
  if (vetErr) return { error: vetErr };
  const vetCheckedAt = vetCheckedRaw ? new Date(vetCheckedRaw) : null;
  const vetCheckNote = vetCheckedAt
    ? String(formData.get("vetCheckNote") || "").trim() || null
    : null;

  await prisma.transfer.create({
    data: {
      petId,
      token,
      newOwnerName: null,
      newOwnerEmail: null,
      note: note || null,
      visibility,
      claimable,
      guaranteeType,
      guaranteeDays,
      guaranteeTerms,
      vetCheckedAt,
      vetCheckNote,
    },
  });

  // Credibility: freeze the pre-transfer history at the moment of issue so it
  // can't be retroactively edited/backdated. Buyers can trust what they see.
  await prisma.logEntry.updateMany({
    where: { petId, lockedAt: null },
    data: { lockedAt: new Date() },
  });

  // Homecoming milestone — keeps one continuous lifelong timeline, and marks
  // the occasion as something special.
  await prisma.logEntry.create({
    data: {
      petId,
      occurredAt: new Date(),
      rawText: "Went to a new home. 🎉",
      type: "MILESTONE",
      severity: "NONE",
      title: "🏡 Homecoming day",
      summary: "Transferred to a new owner — a new chapter begins.",
      tags: JSON.stringify(["homecoming", "transfer"]),
      aiProcessed: true,
    },
  });

  await prisma.pet.update({
    where: { id: petId },
    data: { status: "TRANSFERRED" },
  });
  revalidatePath(`/app/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  revalidatePath(`/app/pets/${petId}/transfer`);
  revalidatePath("/app/pets");
  revalidatePath("/app");
  return { token };
}

// Buyer claims a passport: creates (or signs into) a real consumer account,
// becomes the pet's owner, and starts a session. Only allowed if the breeder
// enabled claiming; otherwise the passport stays view-only.
export async function claimPassport(token: string, formData: FormData) {
  const transfer = await prisma.transfer.findUnique({ where: { token } });
  if (!transfer) return { error: "Passport not found" };
  if (!transfer.claimable)
    return { error: "This passport hasn't been made claimable by the breeder." };
  if (transfer.claimedAt) return { error: "This passport is already claimed." };

  const nameRaw = String(formData.get("claimedByName") || "").trim();
  const nameErr = validateRequiredName(nameRaw);
  if (nameErr) return { error: nameErr };
  const name = nameRaw;

  const email = normalizeEmail(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");

  const emailErr = validateEmail(email);
  if (emailErr) return { error: emailErr };
  const pwErr = validatePassword(password);
  if (pwErr) return { error: pwErr };

  // Reuse an existing account (verify password) or create a new one.
  let user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    if (!user.passwordHash || !verifyPassword(password, user.passwordHash))
      return { error: "An account with this email exists — wrong password." };
  } else {
    user = await prisma.user.create({
      data: { email, name, passwordHash: hashPassword(password) },
    });
  }

  await prisma.transfer.update({
    where: { id: transfer.id },
    data: { claimedAt: new Date(), claimedByName: name, claimedByUserId: user.id },
  });

  // Buyer becomes the owner and continues the timeline; the pet stays in the
  // breeder's org as their read-only copy.
  const pet = await prisma.pet.update({
    where: { id: transfer.petId },
    data: { ownerUserId: user.id, status: "ARCHIVED" },
    include: { org: true },
  });

  // Let the breeder know their pet found its home.
  await prisma.notification.create({
    data: {
      petId: pet.id,
      orgId: pet.orgId,
      kind: "CLAIM",
      title: `${name} claimed ${pet.name}'s passport`,
      body: `${pet.name} now has a lifelong owner account. The handover history stays frozen.`,
    },
  });

  // Claiming is an explicit owner takeover — start a fresh single-device
  // session (kicking any other device this owner had).
  await setSession(user.id, { single: true });
  revalidatePath(`/passport/${token}`);
  revalidatePath(`/app/pets/${transfer.petId}`);
  revalidatePath(`/app/pets/${transfer.petId}/transfer`);
  revalidatePath("/app/pets");
  revalidatePath("/app");
  return { ok: true, claimedByName: name };
}

export async function signIn(formData: FormData) {
  const email = normalizeEmail(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");
  const force = String(formData.get("force") || "") === "1";
  if (!email) return { error: VErr.EMAIL_REQUIRED };
  if (!password) return { error: VErr.PASSWORD_REQUIRED };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash))
    return { error: "Incorrect email or password" };

  const isOwner = !user.orgId;
  // Owner accounts are single-device: if signed in elsewhere, ask before kicking.
  if (isOwner && !force && hasActiveSession(user)) {
    return { conflict: true as const, accountType: "owner" as const };
  }

  await setSession(user.id, { single: isOwner });
  return { ok: true, accountType: isOwner ? ("owner" as const) : ("shop" as const) };
}

export async function signOut() {
  const user = await getCurrentUser();
  if (user && !user.orgId) await clearUserSession(user.id);
  await clearSession();
  redirect("/");
}

export async function markNotificationRead(id: string) {
  await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });
  revalidatePath("/app/notifications");
  revalidatePath("/me");
  return { ok: true };
}

export async function markAllNotificationsRead() {
  const user = await getCurrentUser();
  if (!user) return { ok: true };
  if (user.orgId) {
    // Shop account — clear org-scoped notifications.
    await prisma.notification.updateMany({
      where: { orgId: user.orgId, readAt: null },
      data: { readAt: new Date() },
    });
    revalidatePath("/app/notifications");
  } else {
    // Owner account — clear user-scoped notifications.
    await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    revalidatePath("/me");
  }
  return { ok: true };
}

export async function addWeight(petId: string, formData: FormData) {
  const weightRaw = String(formData.get("weightKg") || "").trim();
  const weightErr = validateWeightKg(weightRaw, true);
  if (weightErr) return { error: weightErr };
  const weightKg = parseWeightKg(weightRaw) as number;

  const measuredRaw = String(formData.get("measuredAt") || "");
  const measuredErr = validatePastOrToday(measuredRaw, false);
  if (measuredErr) return { error: measuredErr };
  const note = String(formData.get("note") || "").trim();
  if (note.length > NOTE_MAX) return { error: VErr.NOTE_TOO_LONG };

  await prisma.weightEntry.create({
    data: {
      petId,
      weightKg,
      measuredAt: measuredRaw ? new Date(measuredRaw) : new Date(),
      note: note || null,
    },
  });

  // Keep the profile's headline weight in sync with the latest measurement.
  await prisma.pet.update({ where: { id: petId }, data: { weightKg } });
  revalidatePath(`/app/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  return { ok: true };
}

export async function deleteWeight(petId: string, id: string) {
  await prisma.weightEntry.delete({ where: { id } });
  revalidatePath(`/app/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  return { ok: true };
}

// ---- Owner self-registration (no transfer required) ----

export async function register(formData: FormData) {
  const accountType =
    String(formData.get("accountType") || "owner") === "shop" ? "shop" : "owner";
  const nameRaw = String(formData.get("name") || "").trim();
  if (nameRaw.length > NAME_MAX) return { error: VErr.NAME_TOO_LONG };
  const name =
    nameRaw || (accountType === "shop" ? "Shop owner" : "Pet owner");
  const email = normalizeEmail(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");

  const emailErr = validateEmail(email);
  if (emailErr) return { error: emailErr };
  const pwErr = validatePassword(password);
  if (pwErr) return { error: pwErr };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: VErr.EMAIL_TAKEN };

  // Shop account: also create the organization the user will manage at /app.
  if (accountType === "shop") {
    const orgName = String(formData.get("orgName") || "").trim();
    if (!orgName) return { error: VErr.ORG_NAME_REQUIRED };
    if (orgName.length > ORG_NAME_MAX) return { error: VErr.ORG_NAME_TOO_LONG };
    const orgKindRaw = String(formData.get("orgKind") || "BREEDER");
    const orgKind = ["BREEDER", "SHOP", "SHELTER"].includes(orgKindRaw)
      ? orgKindRaw
      : "BREEDER";
    const org = await prisma.organization.create({
      data: { name: orgName, kind: orgKind },
    });
    const user = await prisma.user.create({
      data: { email, name, passwordHash: hashPassword(password), orgId: org.id },
    });
    await setSession(user.id, { single: false });
    return { ok: true, accountType: "shop" as const };
  }

  const user = await prisma.user.create({
    data: { email, name, passwordHash: hashPassword(password) },
  });
  await setSession(user.id, { single: true });
  return { ok: true, accountType: "owner" as const };
}

export async function requestPhoneOtp(formData: FormData) {
  const phone = normalizePhone(String(formData.get("phone") || ""));
  if (!isValidPhone(phone)) return { error: "INVALID_PHONE" };
  return requestOtp(phone);
}

export async function verifyPhoneOtp(formData: FormData) {
  const phone = normalizePhone(String(formData.get("phone") || ""));
  const code = String(formData.get("code") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const force = String(formData.get("force") || "") === "1";

  const accountType =
    String(formData.get("accountType") || "owner") === "shop" ? "shop" : "owner";

  let user = await prisma.user.findUnique({ where: { phone } });

  // Existing owner already signed in elsewhere: authenticate the code without
  // consuming it, then offer the kick/cancel choice (force retry reuses it).
  if (user && !user.orgId && !force && hasActiveSession(user)) {
    const check = await verifyOtp(phone, code, { consume: false });
    if ("error" in check) return check;
    return { conflict: true as const, accountType: "owner" as const };
  }

  const res = await verifyOtp(phone, code);
  if ("error" in res) return res;

  if (!user) {
    if (accountType === "shop") {
      const orgName =
        String(formData.get("orgName") || "").trim() || `${name || "My"} shop`;
      const org = await prisma.organization.create({
        data: { name: orgName, kind: "BREEDER" },
      });
      user = await prisma.user.create({
        data: { phone, name: name || "Shop owner", orgId: org.id },
      });
    } else {
      user = await prisma.user.create({
        data: { phone, name: name || "Pet owner" },
      });
    }
  } else if (name && user.name === "Pet owner") {
    user = await prisma.user.update({ where: { id: user.id }, data: { name } });
  }
  const isOwner = !user.orgId;
  await setSession(user.id, { single: isOwner });
  return { ok: true, accountType: isOwner ? ("owner" as const) : ("shop" as const) };
}

export async function addOwnedPet(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in first" };

  const fields = readPetFields(formData);
  if ("error" in fields) return { error: fields.error };

  const usage = await getUserUsage(user.id);
  if (usage && usage.count >= usage.limit) {
    return { error: "QUOTA_REACHED", quota: true, limit: usage.limit };
  }

  const photo = formData.get("photo") as File | null;
  const photoErr = validatePetPhoto(photo);
  if (photoErr) return { error: photoErr };
  const photoUrl = await saveUpload(photo as File);

  const pet = await prisma.pet.create({
    data: {
      ownerUserId: user.id,
      ...fields.data,
      photoUrl,
    },
  });
  revalidatePath("/me");
  return { id: pet.id };
}

// ---- Billing ----

async function baseUrlFromHeaders(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`;
}

export async function startPlanCheckout(formData: FormData) {
  const scopeKind = String(formData.get("scope") || "");
  const planKey = String(formData.get("plan") || "");
  const provider = String(formData.get("provider") || "stripe") as Provider;

  let scope: CheckoutScope;
  if (scopeKind === "org") {
    const org = await requireActiveOrg();
    scope = { kind: "org", id: org.id };
  } else if (scopeKind === "user") {
    const user = await getCurrentUser();
    if (!user) return { error: "Please sign in first" };
    scope = { kind: "user", id: user.id };
  } else {
    return { error: "UNKNOWN_SCOPE" };
  }

  const baseUrl = await baseUrlFromHeaders();
  const result = await startCheckout({ scope, planKey, provider, baseUrl });

  if ("error" in result) return { error: result.error };
  if ("url" in result) return { url: result.url };

  // Activated immediately (free or demo mode).
  revalidatePath("/app/billing");
  revalidatePath("/me/billing");
  revalidatePath("/pricing");
  return { ok: true, demo: result.demo ?? false };
}

// Owner buys one extra pet slot (¥25/mo). Demo-grants when no provider is set.
export async function addOwnerPetSlot(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in first" };
  const provider = String(formData.get("provider") || "stripe") as Provider;
  const baseUrl = await baseUrlFromHeaders();
  const result = await buyOwnerPetSlot({ userId: user.id, baseUrl, provider });

  if ("error" in result) return { error: result.error };
  if ("url" in result) return { url: result.url };

  revalidatePath("/me/billing");
  revalidatePath("/me");
  return { ok: true, demo: result.demo ?? false };
}

// ---- Shop verification (KYC) ----

// A shop submits its business licence (营业执照) or alternative proof. Stored
// privately; moves the org to PENDING for the PawSure team to review. Until
// approved the shop can use the workspace but cannot issue passports.
export async function submitVerification(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in first" };
  if (!user.orgId) return { error: "NOT_SHOP" };

  const file = formData.get("doc");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "NO_FILE" };
  }
  if (file.size > 10 * 1024 * 1024) return { error: "FILE_TOO_LARGE" };

  const docType =
    String(formData.get("docType") || "LICENSE") === "ALT" ? "ALT" : "LICENSE";
  const note = String(formData.get("note") || "").trim() || null;

  let ref: string;
  try {
    ref = await saveVerificationDoc(file);
  } catch {
    return { error: "UPLOAD_FAILED" };
  }

  const org = await prisma.organization.update({
    where: { id: user.orgId },
    data: {
      verificationDocUrl: ref,
      verificationDocType: docType,
      verificationNote: note,
      verificationStatus: "PENDING",
      verificationSubmittedAt: new Date(),
      verificationReviewedAt: null,
      reviewNote: null,
    },
  });

  await notifyAdmins(
    `New shop verification: ${org.name}`,
    `${org.name} (${org.kind}) submitted ${docType === "LICENSE" ? "a business licence" : "alternative proof"} for review.\nReview at /admin.`,
  );

  revalidatePath("/verify");
  revalidatePath("/app");
  return { ok: true };
}

// ---- Admin review ----

export async function adminLogin(formData: FormData) {
  const password = String(formData.get("password") || "");
  const ok = await adminSignIn(password);
  if (!ok) return { error: "BAD_PASSWORD" };
  redirect("/admin");
}

export async function adminLogout() {
  await adminSignOut();
  redirect("/admin");
}

export async function reviewOrg(formData: FormData) {
  if (!(await isAdmin())) return { error: "FORBIDDEN" };
  const orgId = String(formData.get("orgId") || "");
  const decision = String(formData.get("decision") || "");
  const note = String(formData.get("note") || "").trim() || null;
  if (!orgId || (decision !== "APPROVED" && decision !== "REJECTED")) {
    return { error: "BAD_REQUEST" };
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      verificationStatus: decision,
      verificationReviewedAt: new Date(),
      reviewNote: note,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/verify");
  revalidatePath("/app");
  return { ok: true };
}
