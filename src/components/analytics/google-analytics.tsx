import Script from "next/script";
import { GA_ID } from "@/lib/analytics";

/**
 * Loads GA4 only when NEXT_PUBLIC_GA_ID is configured.
 *
 * The gtag/config snippet is a plain inline script in the server-rendered root layout, so it runs
 * while the HTML is parsed, before React hydrates. Conversion events fired on mount (e.g. on
 * confirmation pages) therefore always find `gtag` defined and queue behind `config`.
 */
export function GoogleAnalytics() {
  if (!GA_ID) return null;
  const init = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(GA_ID)});`;
  return (
    <>
      <script id="ga4-init" dangerouslySetInnerHTML={{ __html: init }} />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
