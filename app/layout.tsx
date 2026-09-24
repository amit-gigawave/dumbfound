import type { Metadata } from "next";
import { Inter, Marcellus, Lora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";
import { site } from "@/lib/site";

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
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
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
      <body className="bg-paper text-ink antialiased">
        <Navbar />
        {children}
        <Footer />
        <RevealObserver />
      </body>
    </html>
  );
}
