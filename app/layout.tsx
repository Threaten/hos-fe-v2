import type { Metadata } from "next";
import { Inconsolata } from "next/font/google";
import "./globals.css";
import ScrollReveal from "./components/ScrollReveal";

// One typeface everywhere: headlines, reading text and the small uppercase
// labels. Covers Vietnamese.
const inconsolata = Inconsolata({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-inconsolata",
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
    <html lang="en" className={inconsolata.variable}>
      <body>
        {children}
        <ScrollReveal />
      </body>
    </html>
  );
}
