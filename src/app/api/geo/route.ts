import { headers } from "next/headers";
import { countryFromHeaders, localeForCountry } from "@/lib/i18n/geo";
import { isSearchEngineBotHeaders } from "@/lib/i18n/bot";

export async function GET() {
  const h = await headers();
  if (isSearchEngineBotHeaders(h)) {
    return Response.json({ country: null, locale: "en", bot: true });
  }
  const country = countryFromHeaders(h);
  return Response.json({
    country,
    locale: localeForCountry(country),
  });
}
