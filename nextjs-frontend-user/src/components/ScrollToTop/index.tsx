"use client";

import React, { useState, useEffect } from "react";
import { FaChevronUp } from "react-icons/fa6";
import "../../styles/scroll-to-top.css";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScrollSmooth = () => {
    const startPosition = window.scrollY;
    const startTime = performance.now();
    const duration = 500; // Thời gian cuộn (ms)

    const easeOutQuad = (t: number) => t * (2 - t); // Hàm easing mượt

    const step = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1); // Giới hạn max = 1
      const easedProgress = easeOutQuad(progress);
      window.scrollTo(0, startPosition * (1 - easedProgress));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`scroll-to-top ${isVisible ? "visible" : ""}`}
      onClick={handleScrollSmooth}
    >
      <FaChevronUp />
    </button>
  );
};

export default ScrollToTop;
