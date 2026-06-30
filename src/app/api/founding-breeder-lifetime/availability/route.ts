import { NextResponse } from "next/server";
import { getFoundingBreederOffersAvailability } from "@/lib/founding-breeder-lifetime";

export async function GET() {
  const offers = await getFoundingBreederOffersAvailability();
  return NextResponse.json(offers, {
    headers: { "Cache-Control": "no-store" },
  });
}
