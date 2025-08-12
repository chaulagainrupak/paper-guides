import { getApiUrl, isLocalhost } from "@/app/config";
import SingleBoardLevel from "./subjectYears";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ subject: string }>;
}


export async function generateMetadata({params}: PageProps): Promise<Metadata>{
    return {
        title: `Available years for ${decodeURIComponent((await params).subject)} | Paper Guides`
    }
}

export default async function getYearData({ params }: PageProps) {
  try {
    const { subject } = await params;

    const res = await fetch(getApiUrl(isLocalhost()) + `/getYears/${subject}`, {
      cache: "default",
    });
    const result = await res.json();
    return (<SingleBoardLevel years={result[0]["years"]}/>)
  } catch (err) {
    console.error("Failed to fetch years:", err);
  }
}
