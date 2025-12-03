import { getApiUrl, getSiteUrl, isLocalhost } from "@/app/config";
import PastPapersPage from "./pastPaperPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paper Guides | Notes ",
  description: "Free exam preparation resources, Notes, Past-Papers, Question Papers, and more. Find notes for O-Level, A-Levels, NEB / TU / IOE and more.",
  icons: "/images/logo.ico",
  openGraph: {
        images: [
      {
        url: `${getSiteUrl}/images/notes.png`,
        width: 1200,
        height: 720,
        alt: "Paper Guides Open Graph Image",
      },
    ],
    title: "Paper Guides | Notes",
    description: "Free exam preparation resources, Notes, Past-Papers, Question Papers, and more. Find notes for O-Level, A-Levels, NEB / TU / IOEand more.",
    url: "https://paperguides.org/notes",
    siteName: "Paper Guides",
    locale: "en_US",
    type: "website",
  },
};

export default async function FetchPastPapers() {
  try {
    const apiUrl = getApiUrl(isLocalhost());
    const response = await fetch(apiUrl + "/pastpapers", { cache: "default" });

    const boardsData = await response.json();

    return <PastPapersPage boardsData={boardsData} />;
  } catch (err) {
    console.error("Something went wrong fetching notes!", err);
    return <div className="p-4 text-red-600">Failed to load notes.</div>;
  }
}
