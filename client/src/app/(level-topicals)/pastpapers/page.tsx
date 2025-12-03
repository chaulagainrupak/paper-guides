import { getApiUrl, getSiteUrl, isLocalhost } from "@/app/config";
// import PastPapersPage from "./pastPaperPage";
import { Metadata } from "next";
import Link from "next/link";
import { BackButton } from "@/app/components/BackButton";

export const metadata: Metadata = {
  title: "Paper Guides | Past Papers ",
  description:
    "Free exam preparation resources, Notes, Past-Papers, Question Papers, and more.  Find past papers for O-Level, A-Levels, NEB / TU / IOE and more.",
  icons: "/images/logo.ico",
  openGraph: {
    title: "Paper Guides | Past Papers",
    description:
      "Free exam preparation resources, Notes, Past-Papers, Question Papers, and more. Find past papers for O-Level, A-Levels, NEB / TU / IOEand more.",
    url: "https://paperguides.org/pastpapers",
    siteName: "Paper Guides",
    images: [
      {
        url: `${getSiteUrl}/images/past_papers.png`,
        width: 1200,
        height: 720,
        alt: "Paper Guides Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default async function FetchPastPapers() {
  try {
    const apiUrl = getApiUrl(isLocalhost());
    const response = await fetch(apiUrl + "/pastpapers", { cache: "default" });

    const boardsData = await response.json();

    // return <PastPapersPage boardsData={boardsData} />;

    return (
      <div>
        <div className="flex justify-between align-center mb-6">
          <h1 className="text-4xl font-semibold">
            Available{" "}
            <span className="text-[var(--blue-highlight)]">Boards</span> and{" "}
            <span className="text-[var(--blue-highlight)]">Levels</span>
          </h1>
          <BackButton />
        </div>

        <div className="animate-fade-in space-y-6">
          {Object.entries(boardsData).map(([boardName, boardData]) => (
            <div key={boardName} className="board-section">
              <h2 className="text-4xl font-bold mb-2">{boardName}</h2>

              {boardName.toLowerCase() === "a levels" && (
                <div className="level-section mb-4">
                  <Link
                    href={`/subjects/${encodeURIComponent("A levels")}`}
                    prefetch={true}
                    className="border-1 border-[var(--blue-highlight)] block p-4 rounded-xl w-full text-xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl hover:scale-[1.01] hover:shadow-xl transition-all duration-200"
                  >
                    CAIE: A Levels
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  } catch (err) {
    console.error("Something went wrong fetching past papers!", err);
    return <div className="p-4 text-red-600">Failed to load past papers.</div>;
  }
}
