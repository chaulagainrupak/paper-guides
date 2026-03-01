import { getApiUrl, isLocalhost } from "@/app/config";
import { Metadata } from "next";
import { BackButton } from "@/app/components/BackButton";
import SubjectSearch from "./SubjectSearch";

interface PageProps {
  params: Promise<{ board: string }>;
}

interface Subject {
  name: string;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const board = decodeURIComponent((await params).board);
  return {
    title: `Available subjects for ${board} | Paper Guides`,
    description: `Explore the subjects available for ${board}. Find past papers, notes, and resources to help you prepare for your exams.`,
    icons: "/images/logo.ico",
    openGraph: {
      title: `Available subjects for ${board} | Paper Guides`,
      description: `Explore the subjects available for ${board}. Find past papers, notes, and resources to help you prepare for your exams.`,
      url: `https://paperguides.org/subjects/${board}`,
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

export default async function Page({ params }: PageProps) {
  const board = (await params).board;
  try {
    const response = await fetch(getApiUrl(isLocalhost()) + `/subjects/${board}`);
    const subjects: Subject[] = await response.json();
    const sortedSubjects = subjects.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );

    return (
      <div>
        <div className="flex justify-between align-center mb-6">
          <h1 className="text-4xl font-semibold">
            Available{" "}
            <span className="text-[var(--blue-highlight)]">Subjects</span> for:{" "}
            {board.replaceAll("%20", " ")}
          </h1>
          <BackButton />
        </div>

        <SubjectSearch subjects={sortedSubjects} board={board} />
      </div>
    );
  } catch (err) {
    console.error("Error fetching subjects:", err);
    return <div>Error loading subjects</div>;
  }
}