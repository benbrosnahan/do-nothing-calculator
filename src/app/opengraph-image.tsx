// Created with Claude Code for the 2026-11-15 audit.
import { ImageResponse } from "next/og";

// The share card, drawn at build time. Plain system type: no font is fetched. The two lines are illustrative.
export const alt = "The Do-Nothing Calculator by Cense: what selling and rebuying your investments costs in tax";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFFCEC", padding: 72, color: "#275B2D" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
            <span style={{ color: "#A8531F" }}>Cense</span>
            <span style={{ marginLeft: 12 }}>The Do-Nothing Calculator</span>
          </div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800, lineHeight: 1.05, marginTop: 48, maxWidth: 560 }}>
            What selling and buying back in costs you.
          </div>
          <div style={{ display: "flex", fontSize: 30, marginTop: 28, color: "#3A6B3E", maxWidth: 560 }}>
            Two lines. One is you holding. One is you fidgeting.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", width: 440 }}>
          <svg width="440" height="420" viewBox="0 0 440 420">
            <path d="M10 410 C 160 390, 290 300, 400 60 L 400 170 C 290 340, 160 395, 10 410 Z" fill="#F7E4D6" />
            <path d="M10 410 C 160 390, 290 300, 400 60" fill="none" stroke="#26602D" strokeWidth="10" strokeLinecap="round" />
            <path d="M10 410 C 160 395, 290 340, 400 170" fill="none" stroke="#C1652E" strokeWidth="8" strokeDasharray="20 14" strokeLinecap="round" />
            <path d="M420 60 L 432 60 L 432 170 L 420 170" fill="none" stroke="#275B2D" strokeWidth="5" />
          </svg>
        </div>
      </div>
    ),
    size
  );
}
