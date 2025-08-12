import { getApiUrl, isLocalhost } from "@/app/config";
import PastPapersPage from "./pastPaperPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Past Papers | Paper Guides",
  description: "Free exam preparation resources, Notes, Past-Papers, Question",
  icons: "/images/logo.ico",
  openGraph: {
    title: "Paper Guides | Past Papers ",
    description: "Free exam preparation resources for students and learners.",
    url: "https://paperguides.org",
    siteName: "Paper Guides",
    images: [
      {
        url: "/images/opg_paper_guides.png",
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

    return <PastPapersPage boardsData={boardsData} />;
  } catch (err) {
    console.error("Something went wrong fetching past papers!", err);
    return <div className="p-4 text-red-600">Failed to load past papers.</div>;
  }
}
