"use client";

import { usePathname } from "next/navigation";
import { Mail, MessageCircle } from "lucide-react";
import { site } from "@/lib/site";

const WHATSAPP_TEXT =
  "Hello, I'm interested in an artwork on Sculpted India and would like to know more.";

/**
 * Band above the footer inviting visitors to ask about a work, on WhatsApp or
 * by email. Not shown on the Enquiry page (it has the full form) or on the
 * internal thumbnail render route.
 */
export default function EnquiryBand() {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/contact") || pathname.startsWith("/artworks/thumb"))
    return null;

  const whatsapp = `https://wa.me/${site.phone.replace(/\D/g, "")}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

  return (
    <section className="border-t border-rule bg-white">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-[clamp(16px,4vw,40px)] py-[clamp(56px,7vw,88px)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-16">
        <div>
          <h2 className="font-display text-[clamp(28px,3.2vw,40px)] leading-[1.15]">
            Interested in a work?
          </h2>
          <p className="font-text mt-4 max-w-[52ch] text-[17px] leading-[1.75] text-stone">
            If an artwork catches your eye, get in touch. Message us on
            WhatsApp or send an email, and we&apos;ll tell you more about it.
          </p>
        </div>
        <div className="grid gap-3 sm:flex sm:flex-wrap">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 rounded-[3px] border border-accent bg-accent px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:border-[#2c4c37] hover:bg-[#2c4c37]"
          >
            <MessageCircle size={17} aria-hidden />
            WhatsApp us
          </a>
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center justify-center gap-2.5 rounded-[3px] border border-ink/25 px-6 py-3.5 text-[15px] font-medium text-ink transition-colors hover:border-accent hover:text-accent"
          >
            <Mail size={17} aria-hidden />
            Email us
          </a>
        </div>
      </div>
    </section>
  );
}
