export const prerender = false;

import type { APIRoute } from "astro";
import { API_URL,SITE_URL } from "../utils/config";

export const GET: APIRoute = async () => {
  const res = await fetch(`${API_URL}/sitemaps/manifest.json`);

  if (!res.ok) {
    return new Response("Not found", { status: 404 });
  }

  const data = await res.json();

  if (!data.chunks || !Array.isArray(data.chunks)) {
    console.error("Invalid manifest:", data);
    return new Response("Invalid sitemap format", { status: 500 });
  }

  const sitemaps = data.chunks.map((chunk: any) => {
    return `
      <sitemap>
        <loc>${SITE_URL}/urls-${chunk.id}.xml</loc>
        <lastmod>${data.generatedAt}</lastmod>
      </sitemap>
    `;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${sitemaps}
  </sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml"
    }
  });
};