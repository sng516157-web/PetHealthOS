import {
  streamText,
  type FilePart,
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
  petSummaryLine,
  safeTags,
  languageInstruction,
  loadVisionAttachments,
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
  });
  const system = `You are the AI health assistant for ${pet.name}. ${audience}

Two kinds of knowledge, and the distinction is strict:
1. PET-SPECIFIC data: you may use ONLY ${pet.name}'s health log and reference documents below — never any other animal's records. If ${pet.name}'s records lack the info, say so plainly rather than guessing.
2. GENERAL knowledge: you may freely share general veterinary & breeding guidance (breed-typical care, neonate/litter care, weaning, nutrition, vaccination & deworming norms, what to watch for) — this general knowledge is not tied to any specific animal's private record.

Rules:
- Keep per-pet data isolated: never reveal or infer one animal's private records when discussing another.
- Reference documents (vaccine certificates, lab results, pedigree, etc.) are part of ${pet.name}'s record — use their labels and any attached images/PDFs you can see.
- You are NOT a veterinarian and must not give a definitive diagnosis. Explain possibilities, suggest what to monitor, flag urgency.
- For anything concerning, recommend contacting a veterinarian.
- Be warm, concise, and practical. Use short paragraphs or bullets.
- ${languageInstruction(resolvedLocale)}

${context}`;

  if (!hasAI()) {
    return mockStream(pet, messages, resolvedLocale, timeZone);
  }

  const vision = await loadVisionAttachments(pet.attachments);
  const chatMessages: ModelMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  if (vision.length > 0 && chatMessages.length > 0) {
    type DocPart = TextPart | ImagePart | FilePart;
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
          return [
            { type: "text", text: `[PDF: ${v.label}]` },
            { type: "file", data: v.data, mediaType: v.mediaType },
          ];
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

  const result = streamText({
    model: getModel(),
    system,
    messages: chatMessages,
  });

  return result.toTextStreamResponse();
}

function mockStream(
  pet: NonNullable<Awaited<ReturnType<typeof getPetForAI>>>,
  messages: ClientMessage[],
  locale: "en" | "zh" = "en",
  timeZone = "UTC",
) {
  const last = messages[messages.length - 1]?.content ?? "";
  const recent = pet.logs.slice(0, 3);
  const docs = pet.attachments.slice(0, 3);
  const lines: string[] = [];
  const zh = locale === "zh";
  lines.push(
    zh
      ? `以下是我在 ${pet.name} 的健康记录中看到的内容（演示模式 —— 未连接 AI 密钥）：\n`
      : `Here's what I can see in ${pet.name}'s health log (demo mode — no AI key connected):\n`,
  );
  if (recent.length === 0) {
    lines.push(
      zh
        ? `目前还没有记录。在『健康记录』标签页添加一些内容，我就能据此为你分析。`
        : `There are no log entries yet. Add some notes on the Health Log tab and I'll be able to reason about them.`,
    );
  } else {
    lines.push(zh ? `**最近的记录：**` : `**Recent entries:**`);
    for (const l of recent) {
      const tags = safeTags(l.tags);
      lines.push(
        `- ${l.occurredAt.toISOString().slice(0, 10)} · ${l.title || l.type} (severity ${l.severity})${tags.length ? ` — ${tags.join(", ")}` : ""}`,
      );
    }
  }
  if (docs.length > 0) {
    lines.push(zh ? `\n**参考文件：**` : `\n**Reference documents:**`);
    for (const d of docs) {
      lines.push(`- ${d.kind}: ${d.label}`);
    }
  }
  lines.push(
    zh
      ? `\n你问的是：“${last}”。连接 AI 密钥后（设置 GOOGLE_GENERATIVE_AI_API_KEY），我就能基于上面 ${petSummaryLine(pet)} 的完整历史与文件，用自然语言回答这个问题。如有任何令人担心的情况，请咨询兽医。`
      : `\nYou asked: "${last}". With an AI key connected (set GOOGLE_GENERATIVE_AI_API_KEY), I'd answer this in natural language grounded in ${petSummaryLine(pet)}'s full history and documents above. For anything concerning, please consult a veterinarian.`,
  );
  const text = lines.join("\n");

  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      const words = text.split(" ");
      let i = 0;
      const timer = setInterval(() => {
        if (i >= words.length) {
          clearInterval(timer);
          controller.close();
          return;
        }
        controller.enqueue(enc.encode(words[i] + " "));
        i++;
      }, 12);
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
