import "server-only";
import { headers } from "next/headers";
import { isSearchEngineBotHeaders } from "./bot";

export async function isSearchEngineBotRequest(): Promise<boolean> {
  const h = await headers();
  return isSearchEngineBotHeaders(h);
}
