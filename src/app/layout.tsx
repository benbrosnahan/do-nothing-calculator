import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "The Do-Nothing Calculator by Cense",
  description:
    "See what selling and rebuying your investments actually costs you in taxes, versus just leaving it alone.",
  openGraph: {
    title: "The Do-Nothing Calculator by Cense",
    description:
      "Two lines. One is you holding. One is you fidgeting. Watch the gap.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Do-Nothing Calculator by Cense",
    description:
      "Two lines. One is you holding. One is you fidgeting. Watch the gap.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <noscript>
          <div style={{ padding: "2rem", textAlign: "center" }}>
            This tool requires JavaScript to run. Please enable JavaScript in
            your browser settings.
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
