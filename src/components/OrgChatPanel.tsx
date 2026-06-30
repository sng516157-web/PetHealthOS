"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { Markdown } from "@/components/Markdown";
import { cn } from "@/lib/cn";

type Msg = { role: "user" | "assistant"; content: string };

export function OrgChatPanel({
  aiEnabled,
  facility,
  petCount,
  preview = false,
}: {
  aiEnabled: boolean;
  facility: boolean;
  petCount: number;
  preview?: boolean;
}) {
  const { t, locale } = useI18n();
  const starters = facility ? t.orgAi.facilityStarters : t.orgAi.shopStarters;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    if (!text.trim() || busy || preview) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/org/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, locale }),
      });
      if (!res.ok) {
        const errText = (await res.text()).trim();
        throw new Error(errText || `HTTP ${res.status}`);
      }
      if (!res.body) throw new Error("No response body");

      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
      if (!acc.trim()) {
        throw new Error("empty");
      }
    } catch {
      setMessages((m) => {
        const withoutEmptyAssistant =
          m.at(-1)?.role === "assistant" && !m.at(-1)?.content ? m.slice(0, -1) : m;
        return [
          ...withoutEmptyAssistant,
          { role: "assistant", content: t.chat.error },
        ];
      });
    } finally {
      setBusy(false);
    }
  }

  function sendPreview(text: string) {
    if (preview) {
      setMessages([
        { role: "user", content: text },
        {
          role: "assistant",
          content: facility ? t.orgAi.previewReplyFacility : t.orgAi.previewReplyShop,
        },
      ]);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-surface",
        preview
          ? "h-[min(240px,100%)] min-h-[200px]"
          : "ps-h-org-chat-panel min-h-[320px] max-md:min-h-[280px]",
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Bot size={17} />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">{t.orgAi.assistantTitle}</div>
          <div className="text-[11px] text-muted">
            {t.orgAi.grounded(facility, petCount)}
          </div>
        </div>
        {!aiEnabled && (
          <span className="ml-auto rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
            {t.common.demoBadge}
          </span>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
              <Sparkles size={22} />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">{t.orgAi.askTitle}</p>
            <p className="mt-1 max-w-md text-sm text-muted">{t.orgAi.askDesc(facility)}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {starters.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => (preview ? sendPreview(s) : send(s))}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => <Bubble key={i} msg={m} />)
        )}
        {busy && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Sparkles size={15} className="animate-pulse-dot text-brand-500" /> {t.chat.thinking}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (preview) sendPreview(input);
          else send(input);
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.orgAi.messagePlaceholder}
          className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
          isUser ? "bg-slate-200 text-slate-600" : "bg-brand-50 text-brand-600"
        }`}
      >
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
          isUser
            ? "whitespace-pre-wrap bg-brand-600 text-white"
            : "bg-background text-slate-700 ring-1 ring-inset ring-border"
        }`}
      >
        {isUser ? msg.content || "…" : <Markdown>{msg.content || "…"}</Markdown>}
      </div>
    </div>
  );
}
