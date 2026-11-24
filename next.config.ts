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

// Old artwork addresses (renamed 2026-11-16 to match the works' titles) → new ones,
// so earlier links and QR codes keep working.
const renamedArtworks: [string, string][] = [
  ["telangana-woman", "thota-lady"],
  ["sacred-gaze", "thota-pandit"],
  ["khanna-untitled-seated-man", "khanna-seated-bandsman-with-horn"],
  ["sugandh-elephant-kite", "sugandh-meri-patang"],
  ["head-a", "shah-head-with-bared-teeth"],
  ["head-c", "shah-head-with-pinpoint-eyes"],
  ["head-e", "ghosh-head-in-fragments"],
  ["head-g", "thota-dark-green-saree-lady"],
  ["female-with-blue-saree", "thota-blue-saree"],
  ["female-head", "thota-yellow-saree-lady"],
  ["meditating", "sansanwal-levitation"],
  ["female-with-green-saree", "thota-female-in-dotted-saree"],
  ["khanna-untitled-horn-player", "khanna-trumpeter"],
  ["yusuf-untitled-sewing-machine", "yusuf-the-tailor"],
  ["yusuf-untitled-cat", "yusuf-polka-dot-cat"],
  ["khanna-untitled-bandsman", "khanna-patinder-rawat-trumpet-walae"],
  ["khanna-untitled-trumpeter", "khanna-patinder-ji-haran-walla"],
  ["untitled-figure-with-spear", "shah-man-from-moon"],
  ["thota-female-head-05", "thota-female-head-with-side-braid"],
  ["untitled-bandsman-in-red", "khanna-bandwalla"],
  ["thota-untitled-head-polka-dot", "thota-female-head-with-polka-dot-collar"],
  ["thota-female-head-10", "thota-ruby-saree-lady"],
  ["thota-untitled-head-with-turban", "thota-male-head-with-blue-turban"],
  ["thota-untitled-head-with-nose-ring", "thota-bronze-female-head-with-long-hair"],
  ["thota-female-head-07", "thota-female-head-with-nose-ring"],
];

const nextConfig: NextConfig = {
  // Local images may carry ?v=N, so a changed thumbnail gets a new address
  // and browsers and the image optimiser don't keep showing the old one.
  images: { localPatterns: [{ pathname: "/**" }] },
  // The collection used to live at /gallery.
  async redirects() {
    return [
      { source: "/gallery", destination: "/artworks", permanent: true },
      { source: "/gallery/:path*", destination: "/artworks/:path*", permanent: true },
      ...renamedArtworks.map(([from, to]) => ({
        source: `/artworks/${from}`,
        destination: `/artworks/${to}`,
        permanent: true,
      })),
    ];
  },
  async headers() {
    return [
      { source: "/sculptures/:path*", headers: staticAsset },
      { source: "/thumbnails/:path*", headers: staticAsset },
      { source: "/draco/:path*", headers: staticAsset },
      // The scan page's targets (4 MB) and pictures.
      { source: "/scan/:path*", headers: staticAsset },
    ];
  },
};

export default nextConfig;
