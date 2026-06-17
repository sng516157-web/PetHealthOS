import { streamText, type ModelMessage } from "ai";
import { getOrgPetsForAI } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import {
  hasAI,
  getModel,
  buildOrgCareContext,
  orgAiSystemPrompt,
  mockOrgChatReply,
} from "@/lib/ai";
import { getLocale } from "@/lib/i18n/server";
import { isLocale } from "@/lib/i18n/config";
import { getTimezone } from "@/lib/timezone/server";

type ClientMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.orgId) {
    return new Response("Forbidden", { status: 403 });
  }

  const { messages, locale } = (await req.json()) as {
    messages: ClientMessage[];
    locale?: string;
  };
  const resolvedLocale = isLocale(locale) ? locale : await getLocale();
  const timeZone = await getTimezone();
  const { orgName, facility, pets } = await getOrgPetsForAI();

  const context = buildOrgCareContext(orgName, facility, pets, {
    timeZone,
    locale: resolvedLocale,
  });
  const system = orgAiSystemPrompt(orgName, facility, resolvedLocale, context);

  if (!hasAI()) {
    const last = messages[messages.length - 1]?.content ?? "";
    const text = mockOrgChatReply(orgName, facility, pets, last, resolvedLocale);
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

  const chatMessages: ModelMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const result = streamText({
    model: getModel(),
    system,
    messages: chatMessages,
  });

  return result.toTextStreamResponse();
}
