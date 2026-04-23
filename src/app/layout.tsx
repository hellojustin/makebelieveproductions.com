import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import ThemeRegistry from "@/components/ThemeRegistry";
import Footer from "@/components/Footer";
import "./globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display-only serif used in IntroSection. Italic only — the upright Roman
// isn't currently used anywhere, so we don't pay the bytes for it.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Make Believe Productions",
  description: "Software for people who make things.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable}`}
      data-mbp-color-scheme="dark"
    >
      <body>
        <ThemeRegistry>
          {children}
          <Footer/>
        </ThemeRegistry>
      </body>
    </html>
  );
}
