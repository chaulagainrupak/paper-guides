'use client';

import { useEffect } from "react";

export default function ThemeToggleButton() {
  // Run once on mount, set the theme from localStorage
  useEffect(() => {
    if (localStorage.getItem("darkmode") === "active") {
      document.body.classList.add("darkmode");
    }
  }, []);

  // Simple toggle function called on button click
  function toggleDarkMode() {
    if (document.body.classList.contains("darkmode")) {
      document.body.classList.remove("darkmode");
      localStorage.setItem("darkmode", "deactive");
    } else {
      document.body.classList.add("darkmode");
      localStorage.setItem("darkmode", "active");
    }
  }

  return (
    <button
      aria-label="theme-toggle"
      onClick={toggleDarkMode}
      style={{
        width: "60px",
        height: "60px",
        position: "fixed",
        zIndex: 999999,
        bottom: "50px",
        right: "50px",
        padding: "18px",
        border: "none",
        borderRadius: "50%",
        backgroundColor: "var(--blue-highlight)",
        cursor: "pointer",
        scale: "1.2",
      }}
    >
      {/* You can keep your SVG here; if you want to toggle icon, add a bit more logic */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="currentColor"
      >
        <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z" />
      </svg>
    </button>
  );
}
