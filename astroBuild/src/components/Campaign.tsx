import { useEffect, useRef, useState } from "react";
import { API_URL } from "../utils/config";

type Ad = {
  id: number;
  campaign_name: string;
  click_url: string;
  images: {
    square: string;
    horizontal?: string;
    vertical?: string;
  };
  sponsor?: {
    name: string;
    logo?: string;
  };
};

const SESSION_KEY = "ad_session";
const CACHE_KEY = "ad_cache";
const EXPIRY_KEY = "ad_expiry";

type Variant = "sidebar" | "horizontal" | "inline-list";

interface Props {
  variant?: Variant;
}

export default function FeaturedSlot({ variant = "sidebar" }: Props) {
  const [ad, setAd] = useState<Ad | null>(null);

  const isExpired = () => {
    const exp = localStorage.getItem(EXPIRY_KEY);
    return !exp || Date.now() > Number(exp);
  };

  const fetchAd = async () => {
    const session = localStorage.getItem(SESSION_KEY);
    const res = await fetch(
      `${API_URL}/featured${session ? `?session=${session}` : ""}`,
    );
    const data = await res.json();
    localStorage.setItem(SESSION_KEY, data.session);
    localStorage.setItem(EXPIRY_KEY, String(Date.now() + 30 * 60 * 1000));
    localStorage.setItem(CACHE_KEY, JSON.stringify(data.campaign));
    setAd(data.campaign);
  };

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached && !isExpired()) setAd(JSON.parse(cached));
    fetchAd();
  }, []);

  if (!ad) return null;

  // Sidebar: vertical image on md+, horizontal on mobile
  if (variant === "sidebar") {
    const desktopImg = ad.images?.vertical || ad.images?.square || "/fallback-ad.png";
    const mobileImg = ad.images?.horizontal || ad.images?.square || "/fallback-ad.png";
    return (
      <div className="w-full">
        <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest mb-2 text-center opacity-60">
          Sponsored
        </p>
        <a
          href={`/redirect?dest=${encodeURIComponent(ad.click_url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full overflow-hidden rounded-xl border border-[var(--border-subtle)] cursor-pointer hover:opacity-90 transition-opacity"
          data-umami-event="ad_click"
          data-umami-event-ad-id={ad.id}
          data-umami-event-campaign={ad.campaign_name}
          data-umami-event-sponsor={ad.sponsor?.name ?? ""}
        >
          {/* Desktop: vertical */}
          <img
            src={`${API_URL}${desktopImg}`}
            className="w-full object-cover hidden md:block"
            alt={ad.campaign_name}
          />
          {/* Mobile: horizontal */}
          <img
            src={`${API_URL}${mobileImg}`}
            className="w-full object-cover md:hidden"
            alt={ad.campaign_name}
          />
        </a>
      </div>
    );
  }

  // Horizontal banner — for mobile strip or inline between content
  if (variant === "horizontal") {
    const img = ad.images?.horizontal || ad.images?.square || "/fallback-ad.png";
    return (
      <div className="w-full">
        <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest mb-1.5 text-center opacity-60">
          Sponsored
        </p>
        <a
          href={`/redirect?dest=${encodeURIComponent(ad.click_url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full overflow-hidden rounded-xl border border-[var(--border-subtle)] cursor-pointer hover:opacity-90 transition-opacity max-w-2xl mx-auto"
          data-umami-event="ad_click"
          data-umami-event-ad-id={ad.id}
          data-umami-event-campaign={ad.campaign_name}
          data-umami-event-sponsor={ad.sponsor?.name ?? ""}
        >
          <img
            src={`${API_URL}${img}`}
            className="w-full object-cover"
            alt={ad.campaign_name}
          />
        </a>
      </div>
    );
  }

  // inline-list: compact card that fits naturally between list items
  // subtle — looks like a "featured" card, not a banner
  if (variant === "inline-list") {
    const img = ad.images?.horizontal || ad.images?.square || "/fallback-ad.png";
    return (
      <div className="px-5 md:px-20 py-4 border-b border-[var(--border-subtle)] bg-[var(--color-surface)]/40">
        <a
          href={`/redirect?dest=${encodeURIComponent(ad.click_url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 group cursor-pointer"
          data-umami-event="ad_click"
          data-umami-event-ad-id={ad.id}
          data-umami-event-campaign={ad.campaign_name}
          data-umami-event-sponsor={ad.sponsor?.name ?? ""}
        >
          <div className="shrink-0 w-20 h-14 overflow-hidden rounded-lg border border-[var(--border-subtle)]">
            <img
              src={`${API_URL}${img}`}
              className="w-full h-full object-cover"
              alt={ad.campaign_name}
            />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-widest opacity-60">
              Sponsored
            </span>
            <span className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
              {ad.campaign_name}
            </span>
            {ad.sponsor?.name && (
              <span className="text-xs text-[var(--muted)] line-clamp-1">
                {ad.sponsor.name}
              </span>
            )}
          </div>
          <span className="text-xs text-[var(--accent)] font-semibold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            Visit →
          </span>
        </a>
      </div>
    );
  }

  return null;
}
