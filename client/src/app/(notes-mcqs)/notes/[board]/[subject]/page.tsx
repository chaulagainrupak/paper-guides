import { getApiUrl, isLocalhost } from "@/app/config";
import TopicsPage from "./TopicsPage";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paper Guides | Topics",
  description:
    "Free exam preparation resources, Notes, Past-Papers, Question Papers, and more. Find topics for O-Level, A-Levels, NEB / TU / IOE and more.",
  icons: "/images/logo.ico",
  openGraph: {
    title: "Paper Guides | Topics",
    description:
      "Free exam preparation resources, Notes, Past-Papers, Question Papers, and more. Find topics for O-Level, A-Levels, NEB / TU / IOE and more.",
    url: "https://paperguides.org/notes",
    siteName: "Paper Guides",
    locale: "en_US",
    type: "website",
  },
};

interface PageProps {
  params: Promise<{ subject: string }>;
}

export default async function fetchTopics({ params }: PageProps) {
  const { subject } = await params;

  try {
    const response = await fetch(
      getApiUrl(isLocalhost()) + `/getTopics/${subject}`,
      { cache: "no-store" }
    );
    const result = await response.json();
    const topics = result[0]["topics"].sort((a: any, b: any) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
    return <TopicsPage subjectName={subject} topics={topics} />;
  } catch (err) {
    console.error("Failed to fetch topics:", err);
  }
}
