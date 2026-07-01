"use client";

import { useState } from "react";
import { Copy, Check, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { whatsAppShareUrl, weChatShareHint } from "@/lib/share-urls";

export function PassportShareButtons({
  url,
  petName,
  className = "",
}: {
  url: string;
  petName: string;
  className?: string;
}) {
  const { t, locale } = useI18n();
  const [copied, setCopied] = useState<"link" | "wechat" | null>(null);
  const shareText = t.share.passportMessage(petName);

  function copyLink(kind: "link" | "wechat") {
    navigator.clipboard.writeText(url);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <a
        href={whatsAppShareUrl(url, shareText)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
      >
        <MessageCircle size={14} /> WhatsApp
      </a>
      <button
        type="button"
        onClick={() => copyLink("wechat")}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:border-brand-300"
      >
        {copied === "wechat" ? <Check size={14} /> : <Copy size={14} />}
        {t.share.weChat}
      </button>
      <button
        type="button"
        onClick={() => copyLink("link")}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted hover:border-brand-300 hover:text-foreground"
      >
        {copied === "link" ? <Check size={14} /> : <Copy size={14} />}
        {copied === "link" ? t.transferForm.copied : t.transferForm.copy}
      </button>
      {copied === "wechat" && (
        <p className="w-full text-xs text-muted">{weChatShareHint(locale)}</p>
      )}
    </div>
  );
}
