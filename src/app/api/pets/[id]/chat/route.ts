import { streamText } from "ai";
import { getPetForAI } from "@/lib/data";
import { hasAI, buildPetContext, petSummaryLine, safeTags } from "@/lib/ai";

const MODEL = process.env.AI_MODEL ?? "openai/gpt-4o-mini";

type ClientMessage = { role: "user" | "assistant"; content: string };

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { messages } = (await req.json()) as { messages: ClientMessage[] };

  const pet = await getPetForAI(id);
  if (!pet) {
    return new Response("Pet not found", { status: 404 });
  }

  const context = buildPetContext(pet, pet.logs);
  const system = `You are the AI health assistant for ${pet.name}, a pet at a pet shop. You have access ONLY to ${pet.name}'s health log below — never reference any other animal.

Rules:
- Answer ONLY about ${pet.name}, grounded in the log. If the log lacks the info, say so plainly.
- You are NOT a veterinarian and must not give a definitive diagnosis. You may explain possibilities, suggest what to monitor, and flag urgency.
- For anything concerning, recommend contacting a veterinarian.
- Be warm, concise, and practical. Use short paragraphs or bullets.

${context}`;

  if (!hasAI()) {
    return mockStream(pet, messages);
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
) {
  const last = messages[messages.length - 1]?.content ?? "";
  const recent = pet.logs.slice(0, 3);
  const lines: string[] = [];
  lines.push(
    `Here's what I can see in ${pet.name}'s health log (demo mode — no AI key connected):\n`,
  );
  if (recent.length === 0) {
    lines.push(
      `There are no log entries yet. Add some notes on the Health Log tab and I'll be able to reason about them.`,
    );
  } else {
    lines.push(`**Recent entries:**`);
    for (const l of recent) {
      const tags = safeTags(l.tags);
      lines.push(
        `- ${l.occurredAt.toISOString().slice(0, 10)} · ${l.title || l.type} (severity ${l.severity})${tags.length ? ` — ${tags.join(", ")}` : ""}`,
      );
    }
    lines.push(
      `\nYou asked: "${last}". With an AI key connected (set AI_GATEWAY_API_KEY), I'd answer this in natural language grounded in ${petSummaryLine(pet)}'s full history above. For anything concerning, please consult a veterinarian.`,
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
