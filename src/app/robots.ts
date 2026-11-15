// Created with Claude Code for the 2026-11-15 audit.
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://do-nothing-calculator.vercel.app/sitemap.xml",
  };
}
