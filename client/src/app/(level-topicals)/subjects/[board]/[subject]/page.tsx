import { getApiUrl, isLocalhost } from "@/app/config";
// import SingleBoardLevel from "./subjectYears";
import { Metadata } from "next";
import { BackButton } from "@/app/components/BackButton";
import Link from "next/link";
// import { usePathname } from "next/navigation";

interface PageProps {
  params: Promise<{ board: string; subject: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return {
    title: `Available years for ${decodeURIComponent(
      (await params).subject
    )} | Paper Guides`,
    description: `Explore the years available for ${decodeURIComponent(
      (await params).subject
    )}. Find past papers, notes, and resources to help you prepare for your exams.`,
    icons: "/images/logo.ico",
    openGraph: {
      title: `Available years for ${decodeURIComponent(
        (await params).subject
      )} | Paper Guides`,
      description: `Explore the years available for ${decodeURIComponent(
        (await params).subject
      )}. Find past papers, notes, and resources to help you prepare for your exams.`,
      url: `https://paperguides.org/subjects/${decodeURIComponent(
        (await params).subject
      )}`,
      siteName: "Paper Guides",
      locale: "en_US",
      type: "website",
    },
  };
}

export default async function getYearData({ params }: PageProps) {
  try {
    const { subject } = await params;

    const res = await fetch(getApiUrl(isLocalhost()) + `/getYears/${subject}`, {
      cache: "default",
    });
    const result = await res.json();

    // Made this server side rendering
    return SingleBoardLevel({
      years: result[0].years,
      params: await params,
    });
  } catch (err) {
    console.error("Failed to fetch years:", err);
  }
}

async function SingleBoardLevel({
  years,
  params,
}: {
  years: number[];
  params: { board: string; subject: string };
}) {
  // const pathname = usePathname();

  return (
    <div>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>

      <div className="flex justify-between align-center mb-6">
        <h1 className="text-4xl font-semibold">
          Available <span className="text-[var(--blue-highlight)]">Years</span>
        </h1>
        <BackButton></BackButton>
      </div>

      <div className="animate-fade-in space-y-4">
        {years.map((year) => (
          <Link
            key={year}
            href={`/subjects/${params.board}/${params.subject}/${year}`}
            className="border border-[var(--blue-highlight)] block p-4 rounded-xl w-full text-xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl hover:scale-[1.01] hover:shadow-2xl transition-all duration-200"
            prefetch={true}
          >
            {year}
          </Link>
        ))}
      </div>
    </div>
  );
}
