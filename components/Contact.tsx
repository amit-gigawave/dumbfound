"use client";

import { useState } from "react";
import {
  Mail,
  MapPin,
  Phone,
  Check,
} from "lucide-react";


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
      className="relative z-10 overflow-hidden px-6 py-20 lg:px-16 text-foreground"
    >
      <div className="mx-auto max-w-7xl">
        {/* Top Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex rounded-full border border-black/10 bg-black/5 px-4 py-1.5 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/80">
              Contact
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-medium tracking-tight mb-4 text-black">
            Let's Talk About Sculpture
          </h2>
          <p className="max-w-xl text-sm sm:text-[0.95rem] leading-7 text-black/50">
            Have a question about Dumbfound, partnership options, or product
            integration? Our team will get back to you within 24 hours.
          </p>
        </div>

        {/* 3 Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {contactCards.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col items-start text-left"
            >
              <div className="w-10 h-10 rounded-full border border-black/5 bg-black/5 flex items-center justify-center mb-6">
                <card.icon className="w-4 h-4 text-black/60" />
              </div>
              <h3 className="font-medium text-black mb-4">{card.title}</h3>
              <p className="font-semibold text-sm text-black mb-2">
                {card.value}
              </p>
              <p className="text-[0.8rem] text-black/40">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-16 lg:gap-24 items-start relative">
          {/* Left Text with Background */}
          <div className="relative flex flex-col gap-8">

            <div className="relative z-10 pointer-events-none [&_button]:pointer-events-auto">
              <div>
                <h3 className="font-display text-3xl sm:text-[2.5rem] leading-[1.1] font-medium tracking-tight mb-6 text-black">
                  Reach out anytime
                  <br />
                  we're here for you
                </h3>
                <p className="text-sm sm:text-[0.95rem] leading-6 text-black/50 max-w-md">
                  Have a question or need assistance? Reach out to our dedicated
                  support team. We're here to help with any inquiries you may
                  have.
                </p>
              </div>

              <ul className="flex flex-col gap-4">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-black/60" />
                    <span className="text-sm font-medium text-black/80">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>


            </div>
          </div>

          {/* Right Form */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[0.8rem] font-semibold text-black/80">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    className="w-full rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3 text-sm text-black placeholder:text-black/30 focus:border-black/20 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[0.8rem] font-semibold text-black/80">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    className="w-full rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3 text-sm text-black placeholder:text-black/30 focus:border-black/20 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[0.8rem] font-semibold text-black/80">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3 text-sm text-black placeholder:text-black/30 focus:border-black/20 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[0.8rem] font-semibold text-black/80">
                  Contact Number
                </label>
                <input
                  type="tel"
                  placeholder="Contact Number"
                  value={formData.contactNumber}
                  onChange={(e) => updateField("contactNumber", e.target.value)}
                  className="w-full rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3 text-sm text-black placeholder:text-black/30 focus:border-black/20 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[0.8rem] font-semibold text-black/80">
                  Message
                </label>
                <textarea
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3 text-sm text-black placeholder:text-black/30 focus:border-black/20 focus:outline-none transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#ffd3be] via-[#ffece1] to-[#ffd3be] py-3.5 text-[0.85rem] font-semibold text-[#8b4513] transition-opacity hover:opacity-90 shadow-[0_2px_10px_rgba(255,211,190,0.4)]"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
