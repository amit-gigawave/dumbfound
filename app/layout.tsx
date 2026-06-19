import type { Metadata } from "next";
import {
  Inter,
  Playfair_Display,
  Geist,
  DM_Sans,
  Caveat,
  Lora,
} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import GradualBlurMemo from "@/components/GradualBlur";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dimensional Sculptures | Next-Gen 3D Web",
  description:
    "Explore the intersection of high-performance 3D graphics and modern web optimization. Built with React Three Fiber and Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body
        className={`${lora.variable} ${inter.variable} ${playfair.variable} antialiased`}
      >
        <SmoothScroll>
          <ScrollProgress />
          <Navbar />
          {children}
          <Footer />
          <GradualBlurMemo
            target="page"
            position="bottom"
            height="7rem"
            strength={2}
            divCount={5}
            curve="bezier"
            exponential
            opacity={1}
            zIndex={40}
            className="pointer-events-none"
          />
        </SmoothScroll>
      </body>
    </html>
  );
}
