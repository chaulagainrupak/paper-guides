import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Paper Guides | Past Papers ",
  description:
    "Free exam preparation resources, Notes, Past-Papers, Question Papers, and more.  Find past papers for O-Level, A-Levels, NEB / TU / IOE and more.",
  icons: "/images/logo.ico",
  openGraph: {
    title: "Paper Guides | Past Papers",
    description:
      "Free exam preparation resources, Notes, Past-Papers, Question Papers, and more. Find past papers for O-Level, A-Levels, NEB / TU / IOEand more.",
    url: "https://paperguides.org",
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
      <div className="bg-[var(--baby-powder)] h-full xl:w-4/3 shadow-xl rounded-md p-6">
        <main>{children}</main>
      </div>

      <div className="promo-space bg-[var(--baby-powder)] xl:h-auto h-1/4 xl:w-1/4 shadow-xl rounded-md p-6">
        ADVERT
      </div>
    </div>
  );
}
