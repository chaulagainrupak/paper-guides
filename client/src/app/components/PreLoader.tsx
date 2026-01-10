"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PageLoader() {
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // detect link clicks
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement)?.closest("a[href]");
      if (!link) return;

      const href = link.getAttribute("href") ?? "";
      if (!href.startsWith("/")) return;

      setNextPath(href);
      setIsLoading(true);
      setProgress(15);
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // fake progress while loading
  useEffect(() => {
    if (!isLoading) return;

    const intervalId = setInterval(() => {
      setProgress(prev =>
        prev < 90 ? prev + Math.random() * 10 : prev
      );
    }, 200);

    return () => clearInterval(intervalId);
  }, [isLoading]);

  // finish when route changes
  useEffect(() => {
    if (nextPath && pathname === nextPath) {
      setProgress(100);

      setTimeout(() => {
        setIsLoading(false);
        setNextPath(null);
        setProgress(0);
      }, 300);
    }
  }, [pathname, nextPath]);

  // safety: tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setIsLoading(false);
        setNextPath(null);
        setProgress(0);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 z-[9999] h-[3px] w-full bg-transparent">
      <div
        className="h-full bg-[var(--blue-highlight)] transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
