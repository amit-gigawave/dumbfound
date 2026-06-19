"use client";

import { useState } from "react";
import {
  Mail,
  MapPin,
  Phone,
  Check,
} from "lucide-react";
import { motion } from "motion/react";
import BlurText from "./BlurText";


const EASE = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
};

const inputClass =
  "w-full rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3 text-sm text-black placeholder:text-black/30 focus:border-[#f2741f]/40 focus:bg-[#f2741f]/[0.03] focus:ring-2 focus:ring-[#f2741f]/10 focus:outline-none transition-colors";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    message: "",
  });

  const contactCards = [
    {
      icon: Mail,
      title: "Email",
      value: "hello@dumbfound.tech",
      sub: "Get fast responses, usually within 24 hours.",
    },
    {
      icon: Phone,
      title: "Sales & Partnerships",
      value: "sales@dumbfound.tech",
      sub: "Let's talk about scaling your brand with us.",
    },
    {
      icon: MapPin,
      title: "Location",
      value: "Mumbai, Maharashtra, India",
      sub: "Visit our primary studio by appointment.",
    },
  ];

  const benefits = [
    "Personalized assistance",
    "Timely response",
    "Comprehensive support",
    "Priority Support & Resources",
  ];

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <section
      id="contact"
      className="relative z-10 overflow-hidden px-6 py-24 lg:px-16 text-foreground"
    >
      {/* soft warm glow to tie into the palette */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.6, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: EASE }}
        className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,158,109,0.16) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Top Header */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col items-center text-center mb-16"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-1.5 mb-6"
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-[#f2741f]"
              animate={{ opacity: [1, 0.4, 1], scale: [1, 1.4, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/80">
              Contact
            </span>
          </motion.div>
          <h2 className="font-display text-4xl sm:text-5xl font-medium tracking-tight mb-4 text-black flex justify-center">
            <BlurText
              text="Let's Talk About Sculpture"
              animateBy="words"
              delay={110}
              stepDuration={0.4}
            />
          </h2>
          <motion.p
            variants={fadeUp}
            className="max-w-xl text-sm sm:text-[0.95rem] leading-7 text-black/50"
          >
            Have a question about Dumbfound, partnership options, or product
            integration? Our team will get back to you within 24 hours.
          </motion.p>
        </motion.div>

        {/* 3 Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-3 gap-6 mb-24"
        >
          {contactCards.map((card, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="group bg-white rounded-2xl p-6 sm:p-8 border border-black/5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col items-start text-left hover:border-[#f2741f]/20 hover:shadow-[0_12px_30px_rgba(242,116,31,0.10)]"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#ffe2cf] to-[#ffd3be] flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <card.icon className="w-4 h-4 text-[#b3551c]" />
              </div>
              <h3 className="font-display font-medium text-black mb-4">
                {card.title}
              </h3>
              <p className="font-semibold text-sm text-black mb-2">
                {card.value}
              </p>
              <p className="text-[0.8rem] text-black/40">{card.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-16 lg:gap-24 items-start relative">
          {/* Left Text with Background */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="relative flex flex-col gap-8"
          >
            <div className="relative z-10 pointer-events-none [&_button]:pointer-events-auto">
              <div>
                <motion.h3
                  variants={fadeUp}
                  className="font-display text-3xl sm:text-[2.5rem] leading-[1.1] font-medium tracking-tight mb-6 text-black"
                >
                  Reach out anytime
                  <br />
                  we're here for you
                </motion.h3>
                <motion.p
                  variants={fadeUp}
                  className="text-sm sm:text-[0.95rem] leading-6 text-black/50 max-w-md"
                >
                  Have a question or need assistance? Reach out to our dedicated
                  support team. We're here to help with any inquiries you may
                  have.
                </motion.p>
              </div>

              <ul className="mt-8 flex flex-col gap-4">
                {benefits.map((benefit, i) => (
                  <motion.li
                    key={i}
                    variants={fadeUp}
                    className="flex items-center gap-3"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ffd3be] to-[#ff9e6d]">
                      <Check className="w-3.5 h-3.5 text-[#5a2e16]" />
                    </span>
                    <span className="text-sm font-medium text-black/80">
                      {benefit}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right Form */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="bg-white rounded-[2rem] p-6 sm:p-8 border border-black/5 shadow-[0_8px_40px_rgba(21,20,21,0.06)]"
          >
            <motion.form
              onSubmit={handleSubmit}
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="flex flex-col gap-6"
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <motion.div variants={fadeUp} className="flex flex-col gap-2">
                  <label className="text-[0.8rem] font-semibold text-black/80">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    className={inputClass}
                    required
                  />
                </motion.div>
                <motion.div variants={fadeUp} className="flex flex-col gap-2">
                  <label className="text-[0.8rem] font-semibold text-black/80">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    className={inputClass}
                    required
                  />
                </motion.div>
              </div>

              <motion.div variants={fadeUp} className="flex flex-col gap-2">
                <label className="text-[0.8rem] font-semibold text-black/80">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={inputClass}
                  required
                />
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-col gap-2">
                <label className="text-[0.8rem] font-semibold text-black/80">
                  Contact Number
                </label>
                <input
                  type="tel"
                  placeholder="Contact Number"
                  value={formData.contactNumber}
                  onChange={(e) => updateField("contactNumber", e.target.value)}
                  className={inputClass}
                  required
                />
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-col gap-2">
                <label className="text-[0.8rem] font-semibold text-black/80">
                  Message
                </label>
                <textarea
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  rows={4}
                  className={`${inputClass} resize-none`}
                  required
                />
              </motion.div>

              <motion.button
                type="submit"
                variants={fadeUp}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#ffd3be] via-[#ffece1] to-[#ffd3be] py-3.5 text-[0.85rem] font-semibold text-[#8b4513] shadow-[0_2px_10px_rgba(255,211,190,0.4)]"
              >
                Submit
              </motion.button>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
