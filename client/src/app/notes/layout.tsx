import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Paper Guides",
  description: "Free exam preparation resources, Notes, Past-Papers, Question",
  icons: "/images/logo.ico",
  openGraph: {
    title: "Paper Guides",
    description: "Access quality notes for free!.",
    url: "https://paperguides.org/notes",
    siteName: "Paper Guides",
    images: [
      {
        url: "/images/notes.png",
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
    <div className="mt-16 flex flex-col xl:flex-row gap-4 px-6 py-6 min-h-full">
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8879795771404007"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      <div className="bg-[var(--baby-powder)] xl:w-full shadow-xl rounded-md p-6 min-h-full">
        <main>{children}</main>
      </div>

      <aside className="sidebar xl:w-1/5 flex flex-col gap-4 sticky top-20">
        <div
          className="p-6 bg-[var(--baby-powder)] rounded-md hidden max-xl:block xl:block max-xl:sticky max-xl:top-20"
          id="notes-navigation"
        ></div>

        <div className="p-6 bg-[var(--baby-powder)] rounded-md h-48">
          Advert
        </div>
      </aside>
    </div>
  );
}
