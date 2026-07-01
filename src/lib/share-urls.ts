/** One-tap share URLs for passport / preview links (WhatsApp, WeChat copy). */
export function whatsAppShareUrl(url: string, text: string) {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
}

/** WeChat has no web share API — copy link + optional instruction. */
export function weChatShareHint(locale: "en" | "zh") {
  return locale === "zh"
    ? "链接已复制 — 在微信中粘贴发送给买家"
    : "Link copied — paste into WeChat to send to the buyer";
}
