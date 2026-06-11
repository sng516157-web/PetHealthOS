import { headers } from "next/headers";
import { countryFromHeaders, localeForCountry } from "@/lib/i18n/geo";

export async function GET() {
  const h = await headers();
  const country = countryFromHeaders(h);
  return Response.json({
    country,
    locale: localeForCountry(country),
  });
}
