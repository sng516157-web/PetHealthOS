import type { Metadata } from "next";
import { privateRobots } from "@/lib/seo";
import "./demo.css";

export const metadata: Metadata = {
  ...privateRobots,
  title: "Motion demos · PawSure",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
