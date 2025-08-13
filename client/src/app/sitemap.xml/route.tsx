import { NextResponse } from 'next/server';
import { getApiUrl, isLocalhost } from '../config';

export async function GET() {
  const apiSitemapUrl = `${getApiUrl(isLocalhost())}/sitemap.xml`;

  const res = await fetch(apiSitemapUrl, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return new NextResponse('Error fetching API sitemap', { status: 500 });
  }

  const xml = await res.text();

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
