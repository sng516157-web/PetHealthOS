import { streamText } from "ai";
import { getPetForAI } from "@/lib/data";
import { hasAI, buildPetContext, petSummaryLine, safeTags, languageInstruction } from "@/lib/ai";
import { getLocale } from "@/lib/i18n/server";

const MODEL = process.env.AI_MODEL ?? "openai/gpt-4o-mini";

type ClientMessage = { role: "user" | "assistant"; content: string };

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { messages } = (await req.json()) as { messages: ClientMessage[] };
  const locale = await getLocale();

  const pet = await getPetForAI(id);
  if (!pet) {
    return new Response("Pet not found", { status: 404 });
  }

  const context = buildPetContext(pet, pet.logs);
  const system = `You are the AI health & breeding assistant for ${pet.name}. You support a breeder/cattery/kennel.

Two kinds of knowledge, and the distinction is strict:
1. PET-SPECIFIC data: you may use ONLY ${pet.name}'s health log below — never any other animal's records. If ${pet.name}'s log lacks the info, say so plainly rather than guessing.
2. GENERAL knowledge: you may freely share general veterinary & breeding guidance (breed-typical care, neonate/litter care, weaning, nutrition, vaccination & deworming norms, what to watch for) — this general knowledge is not tied to any specific animal's private record.

Rules:
- Keep per-pet data isolated: never reveal or infer one animal's private records when discussing another.
- You are NOT a veterinarian and must not give a definitive diagnosis. Explain possibilities, suggest what to monitor, flag urgency.
- For anything concerning, recommend contacting a veterinarian.
- Be warm, concise, and practical. Use short paragraphs or bullets.
- ${languageInstruction(locale)}

${context}`;

  if (!hasAI()) {
    return mockStream(pet, messages, locale);
  }

  const result = streamText({
    model: MODEL,
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  return result.toTextStreamResponse();
}

function mockStream(
  pet: NonNullable<Awaited<ReturnType<typeof getPetForAI>>>,
  messages: ClientMessage[],
  locale: "en" | "zh" = "en",
) {
  const last = messages[messages.length - 1]?.content ?? "";
  const recent = pet.logs.slice(0, 3);
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
    lines.push(
      zh
        ? `\n你问的是：“${last}”。连接 AI 密钥后（设置 AI_GATEWAY_API_KEY），我就能基于上面 ${petSummaryLine(pet)} 的完整历史，用自然语言回答这个问题。如有任何令人担心的情况，请咨询兽医。`
        : `\nYou asked: "${last}". With an AI key connected (set AI_GATEWAY_API_KEY), I'd answer this in natural language grounded in ${petSummaryLine(pet)}'s full history above. For anything concerning, please consult a veterinarian.`,
    );
  }
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
