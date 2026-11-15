// Created with Claude Code for the 2026-11-15 audit.
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://do-nothing-calculator.vercel.app/", changeFrequency: "yearly", priority: 1 }];
}
