import {
  streamText,
  type ImagePart,
  type ModelMessage,
  type TextPart,
} from "ai";
import { getPetForAI, canAccessPet, getPetEntitlements } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import {
  hasAI,
  getModel,
  buildPetContext,
  languageInstruction,
  loadVisionAttachments,
  imageVisionAttachments,
  plainTextResponseFromStreamText,
  plainTextStreamResponse,
  mockPetChatReply,
} from "@/lib/ai";
import { getLocale } from "@/lib/i18n/server";
import { isLocale } from "@/lib/i18n/config";
import { getTimezone } from "@/lib/timezone/server";

type ClientMessage = { role: "user" | "assistant"; content: string };

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!(await canAccessPet(id))) {
    return new Response("Forbidden", { status: 403 });
  }
  const ent = await getPetEntitlements(id);
  if (ent && !ent.canUseAI) {
    return new Response("Subscription required for this pet", { status: 403 });
  }

  const { messages, locale } = (await req.json()) as {
    messages: ClientMessage[];
    locale?: string;
  };
  const resolvedLocale = isLocale(locale) ? locale : await getLocale();
  const timeZone = await getTimezone();

  const pet = await getPetForAI(id);
  if (!pet) {
    return new Response("Pet not found", { status: 404 });
  }

  const user = await getCurrentUser();
  const isOwner = !user?.orgId;
  const audience = isOwner
    ? "You support this pet's owner — a regular pet parent, not a professional."
    : "You support a breeder/cattery/kennel.";
  const context = buildPetContext(pet, pet.logs, pet.attachments, {
    timeZone,
    locale: resolvedLocale,
    foodLogs: pet.foodLogs,
    activityLogs: pet.activityLogs,
  });
  const system = `You are the AI health assistant for ${pet.name}. ${audience}

Two kinds of knowledge, and the distinction is strict:
1. PET-SPECIFIC data: you may use ONLY ${pet.name}'s health log, food/nutrition log, activity/walks log, and reference documents below — never any other animal's records. If ${pet.name}'s records lack the info, say so plainly rather than guessing.
2. GENERAL knowledge: you may freely share general veterinary & breeding guidance (breed-typical care, neonate/litter care, weaning, nutrition, vaccination & deworming norms, what to watch for) — this general knowledge is not tied to any specific animal's private record.

Rules:
- Cross-reference health symptoms with recent appetite/meals and activity levels when answering — note simple connections (e.g. skipped meals + lethargy).
- Keep per-pet data isolated: never reveal or infer one animal's private records when discussing another.
- Reference documents (vaccine certificates, lab results, pedigree, etc.) are part of ${pet.name}'s record — use their labels and any attached images/PDFs you can see.
- You are NOT a veterinarian and must not give a definitive diagnosis. Explain possibilities, suggest what to monitor, flag urgency.
- For anything concerning, recommend contacting a veterinarian.
- Be warm, concise, and practical. Use short paragraphs or bullets.
- ${languageInstruction(resolvedLocale)}

${context}`;

  if (!hasAI()) {
    const last = messages[messages.length - 1]?.content ?? "";
    return plainTextStreamResponse(
      mockPetChatReply(pet, pet.logs, pet.attachments, last, resolvedLocale),
    );
  }

  const vision = await loadVisionAttachments(pet.attachments);
  const images = imageVisionAttachments(vision);
  const chatMessages: ModelMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  if (vision.length > 0 && chatMessages.length > 0) {
    type DocPart = TextPart | ImagePart;
    const docParts: DocPart[] = [
      {
        type: "text",
        text:
          resolvedLocale === "zh"
            ? "以下是该宠物的参考文件（疫苗证明、化验单等），请结合健康记录作答："
            : "Reference documents on file for this pet (vaccine certs, lab results, etc.). Use alongside the health log:",
      },
      ...vision.flatMap((v): DocPart[] => {
        if (v.mediaType === "application/pdf") {
          return [{ type: "text", text: `[PDF on file: ${v.label}]` }];
        }
        return [
          { type: "text", text: `[${v.label}]` },
          { type: "image", image: v.data, mediaType: v.mediaType },
        ];
      }),
    ];
    chatMessages.unshift(
      { role: "user", content: docParts },
      {
        role: "assistant",
        content:
          resolvedLocale === "zh"
            ? "已查阅档案中的参考文件与健康记录。"
            : "I've reviewed the reference documents and health log on file.",
      },
    );
  }

  const last = messages[messages.length - 1]?.content ?? "";
  const fallback = mockPetChatReply(
    pet,
    pet.logs,
    pet.attachments,
    last,
    resolvedLocale,
  );

  const result = streamText({
    model: images.length > 0 ? getModel({ vision: true }) : getModel(),
    system,
    messages: chatMessages,
  });

  return plainTextResponseFromStreamText(result, fallback);
}
