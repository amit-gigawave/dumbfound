import type { NextConfig } from "next";

// Models, thumbnails and the Draco decoder are replaced in place under the same
// file names, so cache for a day and revalidate in the background afterwards
// (repeat visits load instantly; updated files show up within a day).
const staticAsset = [
  {
    key: "Cache-Control",
    value: "public, max-age=86400, stale-while-revalidate=2592000",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/sculptures/:path*", headers: staticAsset },
      { source: "/thumbnails/:path*", headers: staticAsset },
      { source: "/draco/:path*", headers: staticAsset },
    ];
  },
};

export default nextConfig;
