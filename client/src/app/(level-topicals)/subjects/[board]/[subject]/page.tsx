import { getApiUrl, isLocalhost } from "@/app/config";
import SingleBoardLevel from "./subjectYears";

interface PageProps {
  params: Promise<{ subject: string }>;
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
