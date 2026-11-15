import type { Metadata } from "next";
import { Instrument_Serif, Inter_Tight, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import ScrollReveal from "./components/ScrollReveal";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

// Branch sites: a tight grotesk for headlines and reading, and a mono for
// the small uppercase labels. Both cover Vietnamese.
const grotesk = Inter_Tight({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-grotesk",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://houseofsenses.vn"),
  title: { default: "House of Senses", template: "%s | House of Senses" },
  description: "House of Senses restaurants, menus, reservations, and branch information.",
  applicationName: "House of Senses",
  // Only needed for a URL-prefix Search Console property; a Domain property is verified by DNS
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${grotesk.variable} ${mono.variable}`}>
      <body>
        {children}
        <ScrollReveal />
      </body>
    </html>
  );
}
