import Link from "next/link";
import { site } from "@/lib/site";

/** Closing band: just the name and the copyright year. */
export default function Footer() {
  return (
    <footer className="deep">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-[clamp(16px,4vw,40px)] py-[clamp(32px,4vw,44px)]">
        <Link
          href="/"
          className="font-display text-[clamp(22px,2.4vw,28px)] leading-none tracking-[0.02em] text-[#f2f2f2]"
        >
          {site.name}
        </Link>
        <span className="text-[11px] uppercase tracking-[0.16em] text-deep-muted">
          © {new Date().getFullYear()} {site.name}
        </span>
      </div>
    </footer>
  );
}
