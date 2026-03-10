export const prerender = false;

import type { APIRoute } from "astro";
import { API_URL } from "../utils/config";

export const GET: APIRoute = async () => {
  try {
    const res = await fetch(`${API_URL}/sitemap.xml`);

    if (!res.ok) {
      return new Response("Error fetching sitemap", { status: 500 });
    }

    const xml = await res.text();

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (e) {
    console.error("Sitemap fetch failed:", e);
    return new Response("Error fetching sitemap", { status: 500 });
  }
};
