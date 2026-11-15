"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [footerPushUp, setFooterPushUp] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = window.requestAnimationFrame(() => {
        rafId = null;

        // Show button when user scrolls down 400px
        setIsVisible(window.scrollY > 400);

        // Detect footer collision to push button up via zero-lag GPU transform
        const footer = document.querySelector("footer");
        if (footer) {
          const footerRect = footer.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // If the top of the footer is visible in the viewport
          if (footerRect.top < windowHeight) {
            setFooterPushUp(Math.max(0, Math.round(windowHeight - footerRect.top)));
          } else {
            setFooterPushUp(0);
          }
        } else {
          setFooterPushUp(0);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check on mount
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={scrollToTop}
          style={{
            bottom: "24px",
            transform: footerPushUp > 0 ? `translate3d(0, -${footerPushUp}px, 0)` : undefined,
            willChange: footerPushUp > 0 ? "transform" : "auto",
          }}
          className="fixed end-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-background/60 backdrop-blur-xl border border-border/50 text-foreground shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-[0_0_20px_rgba(var(--primary),0.5)] transition-[color,background-color,border-color,box-shadow,opacity] duration-150 group"
          aria-label="Scroll to top"
        >
          <ChevronUp className="size-6 stroke-[1.5]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
