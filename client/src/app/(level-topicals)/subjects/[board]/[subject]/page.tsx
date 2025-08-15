import { getApiUrl, isLocalhost } from "@/app/config";
import SingleBoardLevel from "./subjectYears";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ subject: string }>;
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
    return <SingleBoardLevel years={result[0]["years"]} />;
  } catch (err) {
    console.error("Failed to fetch years:", err);
  }
}
