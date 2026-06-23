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

function getSlot(
  width: number,
  height: number,
): "square" | "horizontal" | "vertical" {
  const ratio = width / height;
  if (ratio > 1.4) return "horizontal";
  if (ratio < 0.8) return "vertical";
  return "square";
}

export default function FeaturedSlot() {
  const [ad, setAd] = useState<Ad | null>(null);
  const [slot, setSlot] = useState<"square" | "horizontal" | "vertical">(
    "square",
  );
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setSlot(mq.matches ? "vertical" : "horizontal");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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

  const image = ad.images?.[slot] || ad.images?.square || "/fallback-ad.png";

  return (
    <div ref={wrapperRef} className="w-full h-full">
      <a
        href={`/redirect?dest=${encodeURIComponent(ad.click_url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full overflow-hidden rounded-xl border block cursor-pointer"
        data-umami-event="ad_click"
        data-umami-event-ad-id={ad.id}
        data-umami-event-campaign={ad.campaign_name}
        data-umami-event-sponsor={ad.sponsor?.name ?? ""}
      >
        <img
          src={`${API_URL}${image}`}
          className="w-full object-cover"
          alt={ad.campaign_name}
        />
      </a>
    </div>
  );
}
