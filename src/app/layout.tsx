import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";

// Two faces, shared with Loan Desk and Decode so the Cense tools read as one family. Bricolage carries headlines and
// headline figures; Instrument Sans carries everything that is read or compared, and has true tabular figures.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
});
const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const SITE = "https://do-nothing-calculator.vercel.app";
const DESCRIPTION =
  "See what selling and rebuying your investments costs in tax, against leaving them alone. Uses 2026 federal tax rates, shows the result in today's dollars, and saves nothing you type.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "The Do-Nothing Calculator by Cense",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "The Do-Nothing Calculator by Cense",
    description: "Two lines. One is you holding. One is you fidgeting. Watch the gap.",
    url: SITE,
    siteName: "Cense",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Do-Nothing Calculator by Cense",
    description: "Two lines. One is you holding. One is you fidgeting. Watch the gap.",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFCEC",
  width: "device-width",
  initialScale: 1,
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "The Do-Nothing Calculator by Cense",
  url: SITE,
  description: DESCRIPTION,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  audience: { "@type": "Audience", audienceType: "College students" },
  publisher: { "@type": "Organization", name: "Cense", url: "https://cense.beehiiv.com" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} font-sans`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        <noscript>
          <div style={{ padding: "1rem", textAlign: "center" }}>
            The calculator needs JavaScript to change the numbers. Please turn it on in your browser settings.
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
