"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { randomBytes } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getActiveOrg, getPetForAI, getOrgUsage, getUserUsage } from "@/lib/data";
import { structureLogEntry, generateTriage } from "@/lib/ai";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";
import {
  hashPassword,
  verifyPassword,
  setSession,
  clearSession,
  getCurrentUser,
} from "@/lib/auth";
import { requestOtp, verifyOtp, normalizePhone, isValidPhone } from "@/lib/sms";
import {
  startCheckout,
  type CheckoutScope,
  type Provider,
} from "@/lib/billing";

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

export async function addPet(formData: FormData) {
  const org = await getActiveOrg();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name is required" };

  // Hard quota: cannot exceed the plan's effective pet limit.
  const usage = await getOrgUsage();
  if (usage.count >= usage.limit) {
    return { error: "QUOTA_REACHED", quota: true, limit: usage.limit };
  }

  const birthDateRaw = String(formData.get("birthDate") || "");
  const weightRaw = String(formData.get("weightKg") || "");

  const photo = formData.get("photo") as File | null;
  let photoUrl: string | null = null;
  if (photo && photo.size > 0 && photo.size <= 8 * 1024 * 1024) {
    photoUrl = await saveUpload(photo);
  }

  const pet = await prisma.pet.create({
    data: {
      orgId: org.id,
      name,
      species: String(formData.get("species") || "DOG"),
      breed: String(formData.get("breed") || "") || null,
      sex: String(formData.get("sex") || "UNKNOWN"),
      color: String(formData.get("color") || "") || null,
      birthDate: birthDateRaw ? new Date(birthDateRaw) : null,
      weightKg: weightRaw ? Number(weightRaw) : null,
      photoUrl,
      notes: String(formData.get("notes") || "") || null,
      sireId: String(formData.get("sireId") || "") || null,
      damId: String(formData.get("damId") || "") || null,
    },
  });
  revalidatePath("/");
  revalidatePath("/pets");
  return { id: pet.id };
}

export async function addLogEntry(petId: string, rawText: string, occurredAt?: string) {
  const text = rawText.trim();
  if (!text) return { error: "Entry cannot be empty" };

  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet) return { error: "Pet not found" };

  const locale = await getLocale();
  const structured = await structureLogEntry(text, pet, locale);

  await prisma.logEntry.create({
    data: {
      petId,
      rawText: text,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      type: structured.type,
      severity: structured.severity,
      title: structured.title,
      summary: structured.summary,
      tags: JSON.stringify(structured.tags),
      aiProcessed: true,
    },
  });

  await prisma.pet.update({ where: { id: petId }, data: { updatedAt: new Date() } });
  revalidatePath(`/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  revalidatePath("/");
  return { ok: true, structured };
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
  revalidatePath(`/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  return { ok: true };
}

export async function addReminder(petId: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const dueAt = String(formData.get("dueAt") || "");
  if (!title || !dueAt) return { error: "Title and date required" };

  await prisma.reminder.create({
    data: {
      petId,
      title,
      category: String(formData.get("category") || "OTHER"),
      dueAt: new Date(dueAt),
      recurrence: String(formData.get("recurrence") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    },
  });
  revalidatePath(`/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  revalidatePath("/reminders");
  return { ok: true };
}

export async function toggleReminder(id: string) {
  const r = await prisma.reminder.findUnique({ where: { id } });
  if (!r) return { error: "Not found" };
  await prisma.reminder.update({
    where: { id },
    data: { completed: !r.completed },
  });
  revalidatePath(`/pets/${r.petId}`);
  revalidatePath(`/me/pets/${r.petId}`);
  revalidatePath("/reminders");
  return { ok: true };
}

export async function generateTriageReport(petId: string) {
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
  revalidatePath(`/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  revalidatePath(`/pets/${petId}/triage`);
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
  revalidatePath(`/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  return { ok: true };
}

export async function updatePetPhoto(petId: string, formData: FormData) {
  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return { error: "Choose an image" };
  if (file.size > 8 * 1024 * 1024) return { error: "Image must be under 8 MB" };

  const url = await saveUpload(file);
  await prisma.pet.update({ where: { id: petId }, data: { photoUrl: url } });
  revalidatePath(`/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  revalidatePath("/pets");
  revalidatePath("/");
  return { ok: true, url };
}

export async function deleteAttachment(petId: string, id: string) {
  await prisma.attachment.delete({ where: { id } });
  revalidatePath(`/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  return { ok: true };
}

export async function createTransfer(petId: string, formData: FormData) {
  const token = randomBytes(8).toString("hex");
  const newOwnerName = String(formData.get("newOwnerName") || "") || null;
  const visibility =
    String(formData.get("visibility") || "READONLY_COPY") === "SHARED"
      ? "SHARED"
      : "READONLY_COPY";
  const claimable = formData.get("claimable") === "on";

  await prisma.transfer.create({
    data: {
      petId,
      token,
      newOwnerName,
      newOwnerEmail: String(formData.get("newOwnerEmail") || "") || null,
      note: String(formData.get("note") || "") || null,
      visibility,
      claimable,
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
      rawText: newOwnerName
        ? `Went to a new home with ${newOwnerName}. 🎉`
        : `Went to a new home. 🎉`,
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
  revalidatePath(`/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  revalidatePath(`/pets/${petId}/transfer`);
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

  const name =
    String(formData.get("claimedByName") || "").trim() ||
    transfer.newOwnerName ||
    "New owner";
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !/.+@.+\..+/.test(email))
    return { error: "Enter a valid email" };
  if (password.length < 6)
    return { error: "Password must be at least 6 characters" };

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
    data: { ownerUserId: user.id },
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

  await setSession(user.id);
  revalidatePath(`/passport/${token}`);
  return { ok: true, claimedByName: name };
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Email and password required" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash))
    return { error: "Incorrect email or password" };

  await setSession(user.id);
  return { ok: true };
}

export async function signOut() {
  await clearSession();
  redirect("/login");
}

export async function markNotificationRead(id: string) {
  await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifications");
  revalidatePath("/me");
  return { ok: true };
}

export async function markAllNotificationsRead() {
  const user = await getCurrentUser();
  if (user) {
    await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    revalidatePath("/me");
  } else {
    const org = await getActiveOrg();
    await prisma.notification.updateMany({
      where: { orgId: org.id, readAt: null },
      data: { readAt: new Date() },
    });
    revalidatePath("/notifications");
  }
  return { ok: true };
}

export async function addWeight(petId: string, formData: FormData) {
  const weightRaw = String(formData.get("weightKg") || "").trim();
  const weightKg = Number(weightRaw);
  if (!weightRaw || Number.isNaN(weightKg) || weightKg <= 0) {
    return { error: "Enter a valid weight" };
  }
  const measuredRaw = String(formData.get("measuredAt") || "");

  await prisma.weightEntry.create({
    data: {
      petId,
      weightKg,
      measuredAt: measuredRaw ? new Date(measuredRaw) : new Date(),
      note: String(formData.get("note") || "") || null,
    },
  });

  // Keep the profile's headline weight in sync with the latest measurement.
  await prisma.pet.update({ where: { id: petId }, data: { weightKg } });
  revalidatePath(`/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  return { ok: true };
}

export async function deleteWeight(petId: string, id: string) {
  await prisma.weightEntry.delete({ where: { id } });
  revalidatePath(`/pets/${petId}`);
  revalidatePath(`/me/pets/${petId}`);
  return { ok: true };
}

// ---- Owner self-registration (no transfer required) ----

export async function register(formData: FormData) {
  const name = String(formData.get("name") || "").trim() || "Pet owner";
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !/.+@.+\..+/.test(email)) return { error: "Enter a valid email" };
  if (password.length < 6)
    return { error: "Password must be at least 6 characters" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  const user = await prisma.user.create({
    data: { email, name, passwordHash: hashPassword(password) },
  });
  await setSession(user.id);
  return { ok: true };
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

  const res = await verifyOtp(phone, code);
  if ("error" in res) return res;

  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({
      data: { phone, name: name || "Pet owner" },
    });
  } else if (name && user.name === "Pet owner") {
    user = await prisma.user.update({ where: { id: user.id }, data: { name } });
  }
  await setSession(user.id);
  return { ok: true };
}

export async function addOwnedPet(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in first" };

  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name is required" };

  const usage = await getUserUsage(user.id);
  if (usage && usage.count >= usage.limit) {
    return { error: "QUOTA_REACHED", quota: true, limit: usage.limit };
  }

  const birthDateRaw = String(formData.get("birthDate") || "");
  const weightRaw = String(formData.get("weightKg") || "");

  const photo = formData.get("photo") as File | null;
  let photoUrl: string | null = null;
  if (photo && photo.size > 0 && photo.size <= 8 * 1024 * 1024) {
    photoUrl = await saveUpload(photo);
  }

  const pet = await prisma.pet.create({
    data: {
      ownerUserId: user.id,
      name,
      species: String(formData.get("species") || "DOG"),
      breed: String(formData.get("breed") || "") || null,
      sex: String(formData.get("sex") || "UNKNOWN"),
      color: String(formData.get("color") || "") || null,
      birthDate: birthDateRaw ? new Date(birthDateRaw) : null,
      weightKg: weightRaw ? Number(weightRaw) : null,
      photoUrl,
      notes: String(formData.get("notes") || "") || null,
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
    const org = await getActiveOrg();
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
  revalidatePath("/billing");
  revalidatePath("/me/billing");
  revalidatePath("/pricing");
  return { ok: true, demo: result.demo ?? false };
}
