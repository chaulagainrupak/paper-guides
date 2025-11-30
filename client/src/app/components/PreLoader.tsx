"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);

  // Detect when user clicks a Link
  useEffect(() => {
    const handleClick = (e: any) => {
      const link = e.target.closest("a[href]");
      if (!link) return;

      const href = link.getAttribute("href") || "";
      if (!href.startsWith("/")) return;

      setNextPath(href);

      setLoading(true);
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (nextPath && pathname === nextPath) {
      setLoading(false);
      setNextPath(null);
    }
  }, [pathname, nextPath]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setLoading(false);
        setNextPath(null);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-600/40 backdrop-blur-sm flex items-center justify-center">
      <div className="h-10 w-10 border-4 border-[var(--blue-highlight)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
