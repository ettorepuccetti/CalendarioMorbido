import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    // Cover images come from two sources:
    // 1. Supabase Storage (uploaded covers)
    // 2. Arbitrary external event websites (covers imported from the CSV)
    // We route every cover through next/image so it is fetched server-side and
    // re-served same-origin: this avoids Chrome ORB (ERR_BLOCKED_BY_ORB) and
    // anti-hotlink blocking that occurs when hotlinking third-party images.
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
      { protocol: "https" as const, hostname: "**" },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
