"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getActiveOrg, getPetForAI } from "@/lib/data";
import { structureLogEntry, generateTriage } from "@/lib/ai";

export async function addPet(formData: FormData) {
  const org = await getActiveOrg();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name is required" };

  const birthDateRaw = String(formData.get("birthDate") || "");
  const weightRaw = String(formData.get("weightKg") || "");

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

  const structured = await structureLogEntry(text, pet);

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
  revalidatePath("/");
  return { ok: true, structured };
}

export async function deleteLogEntry(petId: string, id: string) {
  await prisma.logEntry.delete({ where: { id } });
  revalidatePath(`/pets/${petId}`);
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
  revalidatePath("/reminders");
  return { ok: true };
}

export async function generateTriageReport(petId: string) {
  const pet = await getPetForAI(petId);
  if (!pet) return { error: "Pet not found" };

  const result = await generateTriage(pet, pet.logs);
  const report = await prisma.triageReport.create({
    data: {
      petId,
      urgency: result.urgency,
      summary: result.summary,
      content: JSON.stringify(result),
    },
  });
  revalidatePath(`/pets/${petId}`);
  revalidatePath(`/pets/${petId}/triage`);
  return { id: report.id };
}

export async function addAttachment(petId: string, formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Choose a file to upload" };
  if (file.size > 8 * 1024 * 1024) return { error: "File must be under 8 MB" };

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().slice(0, 8);
  const fileName = `${randomBytes(8).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), bytes);

  await prisma.attachment.create({
    data: {
      petId,
      kind: String(formData.get("kind") || "OTHER"),
      label: String(formData.get("label") || "") || file.name,
      url: `/uploads/${fileName}`,
      mimeType: file.type || null,
    },
  });
  revalidatePath(`/pets/${petId}`);
  return { ok: true };
}

export async function deleteAttachment(petId: string, id: string) {
  await prisma.attachment.delete({ where: { id } });
  revalidatePath(`/pets/${petId}`);
  return { ok: true };
}

export async function createTransfer(petId: string, formData: FormData) {
  const token = randomBytes(8).toString("hex");
  const newOwnerName = String(formData.get("newOwnerName") || "") || null;
  const visibility =
    String(formData.get("visibility") || "READONLY_COPY") === "SHARED"
      ? "SHARED"
      : "READONLY_COPY";

  await prisma.transfer.create({
    data: {
      petId,
      token,
      newOwnerName,
      newOwnerEmail: String(formData.get("newOwnerEmail") || "") || null,
      note: String(formData.get("note") || "") || null,
      visibility,
    },
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
  revalidatePath(`/pets/${petId}/transfer`);
  return { token };
}
