import { API_URL } from "./config";

let cache: any = null;
let lastFetch = 0;

// 7 days in milliseconds
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

export async function getPaperIndex() {
  const now = Date.now();

  // Return cache if still valid
  if (cache && now - lastFetch < CACHE_TTL) {
    return cache;
  }

  try {
    const res = await fetch(`${API_URL}/paper-paths`);
    if (!res.ok) throw new Error("API failed");

    cache = await res.json();
    lastFetch = now;
  } catch (err) {
    console.warn("API failed, using local paperPaths.json");
  }

  return cache;
}
