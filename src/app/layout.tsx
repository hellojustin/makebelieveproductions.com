import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import ThemeRegistry from "@/components/ThemeRegistry";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import {
  SITE_AUTHOR,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/site";
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
  // metadataBase lets relative URLs in `openGraph.images` etc. resolve to
  // absolute URLs in the rendered <meta> tags. Without it, social
  // platforms fail to fetch the OG image because they don't have the
  // host context.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_AUTHOR }],
  creator: SITE_AUTHOR,
  publisher: SITE_NAME,
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    title: SITE_NAME,
    description: SITE_TAGLINE,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_TAGLINE,
  },
  robots: {
    index: true,
    follow: true,
  },
  // Help search engines surface the right description even when they
  // ignore the meta description in favor of the page's most prominent
  // copy — providing the tagline here keeps the surface consistent.
  other: {
    "format-detection": "telephone=no, address=no, email=no",
  },
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
        <Analytics />
      </body>
    </html>
  );
}
