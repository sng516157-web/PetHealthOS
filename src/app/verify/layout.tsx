import type { Metadata } from "next";
import { privateRobots } from "@/lib/seo";

export const metadata: Metadata = privateRobots;

export default function ShopVerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
