"use client";

import { useEffect } from "react";

export default function AdminMenuToggle() {
  // Close nav when clicking outside (overlay click).
  useEffect(() => {
    const overlay = document.querySelector(".admin-overlay") as HTMLDivElement;
    if (!overlay) return;
    const close = () => document.body.classList.remove("nav-open");
    overlay.addEventListener("click", close);
    return () => overlay.removeEventListener("click", close);
  }, []);

  function toggle() {
    document.body.classList.toggle("nav-open");
  }

  return (
    <button
      className="admin-menu-toggle"
      onClick={toggle}
      aria-label="Open navigation menu"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6"  x2="21" y2="6"  />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  );
}
