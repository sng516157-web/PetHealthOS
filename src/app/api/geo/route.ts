import { headers } from "next/headers";
import { countryFromHeaders } from "@/lib/i18n/geo";
import { isSearchEngineBotHeaders } from "@/lib/i18n/bot";

/** Geo hint only — locale default is English; users opt into 中文 via LocaleToggle. */
export async function GET() {
  const h = await headers();
  const country = countryFromHeaders(h);
  if (isSearchEngineBotHeaders(h)) {
    return Response.json({ country, locale: "en", bot: true });
  }
  return Response.json({ country, locale: "en" });
}
