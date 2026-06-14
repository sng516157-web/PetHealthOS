import type { Metadata } from "next";
import { privateRobots } from "@/lib/seo";

export const metadata: Metadata = privateRobots;

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return children;
}
