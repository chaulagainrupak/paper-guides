export const prerender = false;

import type { APIRoute } from "astro";
import { API_URL } from "../utils/config";

export const GET: APIRoute = async ({ params }) => {
  const id = params.id;

  const res = await fetch(`${API_URL}/sitemaps/${id}.json`);

  if (!res.ok) {
    console.error("Fetch failed:", res.status);
    return new Response("Not found", { status: 404 });
  }

  let data;

  try {
    data = await res.json();
  } catch (e) {
    console.error("Invalid JSON response");
    return new Response("Invalid JSON", { status: 500 });
  }

  if (!Array.isArray(data)) {
    console.error("Expected array but got:", data);
    return new Response("Invalid sitemap format", { status: 500 });
  }

  const urls = data.map((u: any) => {
    return `
      <url>
        <loc>${u.loc}</loc>
        <lastmod>${u.lastmod}</lastmod>
        ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ""}
        ${u.priority ? `<priority>${u.priority}</priority>` : ""}
      </url>
    `;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=86400"
    }
  });
};