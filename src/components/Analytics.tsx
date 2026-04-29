import { GoogleAnalytics } from "@next/third-parties/google";

/**
 * Site-wide analytics. Renders Google Analytics 4 via Next.js's official
 * third-party wrapper, which lazy-loads gtag after hydration and handles
 * App Router client navigations so SPA route changes are tracked as
 * pageviews automatically.
 *
 * The measurement ID is read from `NEXT_PUBLIC_GA_MEASUREMENT_ID` (set in
 * Vercel for production, optionally in `.env.local` for local debugging).
 * If the variable is unset we render nothing — that way local dev and
 * preview deploys without a configured ID don't pollute the production
 * GA property with junk traffic.
 */
export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!gaId) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
