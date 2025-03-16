"use client";

import React, { useState, useEffect } from "react";
import { FaChevronUp } from "react-icons/fa6";
import "../../styles/scroll-to-top.css";
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    setIsActive(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setTimeout(() => setIsActive(false), 300);
  };

  return (
    <button
      type="button"
      className={`scroll-to-top ${isVisible ? "visible" : ""} ${
        isActive ? "active" : ""
      }`}
      onClick={scrollToTop}
    >
      <FaChevronUp />
    </button>
  );
};

export default ScrollToTop;
