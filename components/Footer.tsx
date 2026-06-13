"use client";

import React, { useEffect, useRef } from "react";
import "./Footer.css";

export default function Footer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    const fitWatermark = () => {
      const svg = svgRef.current;
      const text = textRef.current;
      if (!svg || !text) return;
      try {
        const bbox = text.getBBox();
        svg.setAttribute(
          "viewBox",
          `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`,
        );
      } catch (e) {}
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitWatermark);
    } else {
      window.addEventListener("load", fitWatermark);
    }
    window.addEventListener("resize", fitWatermark);

    // Initial call
    fitWatermark();

    return () => {
      window.removeEventListener("load", fitWatermark);
      window.removeEventListener("resize", fitWatermark);
    };
  }, []);

  return (
    <footer className="footer-section ">
      <div className="footer-wrapper">
        <div className="footer-left">
          <video
            className="footer-left-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_104800_bc43ae09-f494-43e3-97d7-2f8c1692cfd7.mp4"
              type="video/mp4"
            />
          </video>

          <div className="footer-logo">
            <div className="footer-logo-mark">D</div>
            <span className="footer-logo-name">Dumbfound</span>
          </div>

          <div className="footer-tagline-container">
            <p className="footer-tagline">
              Crafting the silent poetry of timeless form,
              <br />
              <span>through digital and physical mastery.</span>
            </p>
          </div>

          <div className="footer-social-row">
            <div className="footer-social-label">Stay in touch!</div>
            <div className="footer-social-icons">
              <a href="#" className="social-icon" aria-label="Discord">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="X">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="GitHub">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-right">
          <div className="footer-lucky-graphic">
            <div className="lucky-cube">
              <span className="lucky-cube-mark">D</span>
            </div>
            <div className="lucky-text-row">
              <svg
                className="lucky-arrow"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  stroke: "currentColor",
                  fill: "none",
                  strokeWidth: 2,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                }}
              >
                <path d="M3 20 C 6 14, 10 9, 18 5" />
                <path d="M18 5 L 12 5" />
                <path d="M18 5 L 18 11" />
              </svg>
              <span className="lucky-text">View Gallery?</span>
            </div>
          </div>

          <div className="footer-right-top">
            <div className="footer-col">
              <div className="footer-col-title">Navigation</div>
              <a href="#gallery">Gallery</a>
              <a href="#about">About</a>
              <a href="#contact">Studio</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Locations</div>
              <a href="#">London</a>
              <a href="#">Tokyo</a>
              <a href="#">New York</a>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copyright">
              © 2026 Dumbfound tech. All rights reserved.
            </div>
            <div className="footer-cta-mini">
              <h4>
                Timeless form moves fast.
                <br />
                <strong>Stay ahead with Dumbfound.</strong>
              </h4>
              <div className="footer-subscribe-row">
                <input type="email" placeholder="Enter email address" />
                <button type="button">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-watermark" aria-hidden="true">
        <svg
          ref={svgRef}
          viewBox="62 95 876 175"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text
            ref={textRef}
            x="500"
            y="240"
            textAnchor="middle"
            fontSize="320"
          >
            Dumbfound
          </text>
        </svg>
      </div>
    </footer>
  );
}
