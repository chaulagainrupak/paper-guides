import { getApiUrl, isLocalhost } from "@/app/config";
import { Metadata } from "next";
import Link from "next/link";
import { BackButton } from "@/app/components/BackButton";

interface PageProps {
  params: Promise<{ board: string }>;
}

interface Subject {
  name: string;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
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
    const response = await fetch(
      getApiUrl(isLocalhost()) + `/subjects/${board}`
    );
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

        <div className="animate-fade-in space-y-6">
          {sortedSubjects.map((subject) => (
            <div key={subject.name} className="mb-4">
              <Link
                href={`/subjects/${board}/${subject.name}`}
                className="border-1 border-[var(--blue-highlight)] block p-4 rounded-xl w-full text-xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl hover:scale-[1.01] hover:shadow-xl transition-all duration-200"
              prefetch = {true}
              >
                {subject.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (err) {
    console.error("Error fetching subjects:", err);
    return <div>Error loading subjects</div>;
  }
}
