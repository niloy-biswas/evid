import type { Metadata } from "next";
import { BookDemoView } from "@/components/marketing/book-demo-view";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Book a demo",
  description: `Schedule a walkthrough of ${BRAND.name}, or email ${BRAND.supportEmail}.`,
};

export default function BookDemoPage() {
  return <BookDemoView />;
}
