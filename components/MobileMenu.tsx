"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Phone, Mail, MapPin, ChevronDown, ChevronUp } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: { label: string; href: string }[];
}

export default function MobileMenu({
  isOpen,
  onClose,
  navLinks,
}: MobileMenuProps) {
  const [time, setTime] = useState("");
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "America/New_York", // Or relevant timezone
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-[101] h-[100dvh] w-full max-w-[400px] overflow-y-auto bg-[#faf9f6] p-6 shadow-2xl pointer-events-auto"
            data-lenis-prevent
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="4"
                      fill="white"
                      fillOpacity="0.8"
                    />
                    <circle
                      cx="16"
                      cy="8"
                      r="4"
                      fill="white"
                      fillOpacity="0.8"
                    />
                    <circle
                      cx="8"
                      cy="16"
                      r="4"
                      fill="white"
                      fillOpacity="0.8"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="4"
                      fill="white"
                      fillOpacity="0.8"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-black leading-tight">
                    Dumbfound
                  </h2>
                  <p className="text-sm text-black/50 font-medium">
                    Sculpture Studio
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-black/5 text-black hover:bg-black/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Links */}
            <div className="space-y-3 mb-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center justify-between w-full rounded-2xl bg-white px-5 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-black/5 text-black transition-all hover:bg-black/[0.02]"
                >
                  <span className="font-semibold text-[15px]">
                    {link.label}
                  </span>
                  {/* <div className="flex flex-col text-black/30">
                    <ChevronUp size={14} className="-mb-1" />
                    <ChevronDown size={14} />
                  </div> */}
                </a>
              ))}
            </div>

            {/* Map Contact Card */}
            <div className="relative overflow-hidden rounded-3xl bg-[#e6eedf] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-black/5">
              {/* Map Background (Generated Image) */}
              <div
                className="absolute inset-0 opacity-70 mix-blend-multiply"
                style={{
                  backgroundImage: "url('/map_bg.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              <div className="relative p-5">
                <div className="flex items-center justify-between mb-28">
                  <span className="font-semibold text-black text-lg">
                    Contact
                  </span>
                  <div className="flex flex-col text-black">
                    <ChevronUp size={16} className="-mb-1" />
                    <ChevronDown size={16} />
                  </div>
                </div>

                <div className="relative z-10 rounded-[1.25rem] bg-white p-5 shadow-lg">
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2 text-black">
                      <Phone size={18} strokeWidth={2.5} />
                      <span className="font-bold text-[15px]">
                        Discovery call
                      </span>
                    </div>
                    <button className="rounded-full border border-black/10 px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-black/5">
                      Book a call
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-1 text-black">
                      <Mail size={18} strokeWidth={2.5} />
                      <span className="font-bold text-[15px]">Email</span>
                    </div>
                    <a
                      href="mailto:studio@dumbfound.com"
                      className="font-medium text-black/80 hover:text-black"
                    >
                      studio@dumbfound.com
                    </a>
                  </div>

                  <div className="h-px w-full bg-black/5 my-4" />

                  <div className="flex items-center gap-2 text-sm font-medium text-black/50">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>New York, {time || "..."}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* <button
              onClick={() => setShowMore(!showMore)}
              className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold text-black/40 hover:text-black/60 transition-colors"
            >
              {showMore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span>Show {showMore ? "less" : "more"}</span>
            </button> */}

            {/* Footer Text */}
            <p className="mt-6 text-[13px] font-medium leading-relaxed text-black/40">
              Crafting timeless sculptures and elevating modern spaces with
              precision and material intelligence.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
