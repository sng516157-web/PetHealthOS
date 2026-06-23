import { streamText, type ModelMessage } from "ai";
import { getOrgPetsForAI } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import {
  hasAI,
  getModel,
  buildOrgCareContext,
  orgAiSystemPrompt,
  mockOrgChatReply,
  plainTextResponseFromStreamText,
  plainTextStreamResponse,
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
    return plainTextStreamResponse(
      mockOrgChatReply(orgName, facility, pets, last, resolvedLocale),
    );
  }

  const chatMessages: ModelMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const last = messages[messages.length - 1]?.content ?? "";
  const fallback = mockOrgChatReply(orgName, facility, pets, last, resolvedLocale);

  const result = streamText({
    model: getModel(),
    system,
    messages: chatMessages,
  });

  return plainTextResponseFromStreamText(result, fallback);
}
