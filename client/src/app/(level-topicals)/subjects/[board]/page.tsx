import { getApiUrl, isLocalhost } from "@/app/config";
import SubjectsPage from "./boardsPage";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ board: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return {
    title: `Available subjects for ${decodeURIComponent(
      (await params).board
    )} | Paper Guidess`,
    description: `Explore the subjects available for ${decodeURIComponent(
      (await params).board
    )}. Find past papers, notes, and resources to help you prepare for your exams.`,
    icons: "/images/logo.ico",
    openGraph: {
      title: `Available subjects for ${decodeURIComponent(
        (await params).board
      )} | Paper Guides`,
      description: `Explore the subjects available for ${decodeURIComponent(
        (await params).board
      )}. Find past papers, notes, and resources to help you prepare for your exams.`,
      url: `https://paperguides.org/subjects/${decodeURIComponent(
        (await params).board
      )}`,
      siteName: "Paper Guides",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/images/past_papers.png",
          width: 1200,
          height: 720,
          alt: "Paper Guides Open Graph Image",
        },
      ],
    },
  };
}

export default async function fetchSubjects({ params }: PageProps) {
  const { board } = await params;

  try {
    const response = await fetch(
      getApiUrl(isLocalhost()) + `/subjects/${board}`,
      { cache: "default" }
    );
    const data = await response.json();

    const sortedSubjects = data.sort((a: any, b: any) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
    return <SubjectsPage board={decodeURI(board)} subjects={sortedSubjects} />;
  } catch {
    console.error("Something has happned on the server! DON'T PANIC!");
  }
}
