import { redirect } from "next/navigation";

/** Owners list pets on `/me` — keep this path from 404ing bookmarks. */
export default function MePetsRedirect() {
  redirect("/me");
}
