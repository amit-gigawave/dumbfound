import type { Metadata } from "next";
import { Inter, Marcellus, Lora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnquiryBand from "@/components/EnquiryBand";
import RevealObserver from "@/components/RevealObserver";
import { openGraphDefaults, site, siteUrl } from "@/lib/site";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: "400",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: openGraphDefaults,
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${marcellus.variable} ${lora.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Mark JS as available before first paint, so scroll-reveal content is
            only hidden when the script that reveals it will run. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      {/* Browser extensions (e.g. Grammarly) add attributes to <body> before
          React loads; don't treat those as hydration errors. */}
      <body className="bg-paper text-ink antialiased" suppressHydrationWarning>
        <Navbar />
        {children}
        <EnquiryBand />
        <Footer />
        <RevealObserver />
      </body>
    </html>
  );
}
