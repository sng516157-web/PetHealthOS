import { NextResponse } from "next/server";
import { getFoundingBreederLifetimeAvailability } from "@/lib/founding-breeder-lifetime";

export async function GET() {
  const availability = await getFoundingBreederLifetimeAvailability();
  return NextResponse.json(availability, {
    headers: { "Cache-Control": "no-store" },
  });
}
