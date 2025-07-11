import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Paper Guides",
  description: "Free exam preparation resources, Notes, Past-Papers, Question",
  icons: "/images/logo.ico",
  openGraph: {
    title: "Paper Guides",
    description: "Access Past-Papers for free!.",
    url: "https://paperguides.org/notes",
    siteName: "Paper Guides",
    images: [
      {
        url: "/images/past_papers.png",
        width: 1200,
        height: 720,
        alt: "Paper Guides Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function LevelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-[64] h-auto px-6 py-6 flex xl:flex-row flex-col gap-6">
      <script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8879795771404007"
        crossOrigin="anonymous"
      />

      <div className="bg-[var(--baby-powder)] h-full xl:w-4/3 shadow-xl rounded-md p-6">
        <main>{children}</main>
      </div>

      <div className="promo-space bg-[var(--baby-powder)] xl:h-auto h-1/4 xl:w-1/4 shadow-xl rounded-md p-6">
        ADVERT
      </div>
    </div>
  );
}
