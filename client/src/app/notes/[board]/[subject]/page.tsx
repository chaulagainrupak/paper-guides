import { getApiUrl, isLocalhost } from "@/app/config";
import TopicsPage from "./TopicsPage";

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
    const topics = result[0]["topics"];

    return <TopicsPage subjectName={subject} topics={topics} />;
  } catch (err) {
    console.error("Failed to fetch topics:", err);
  }
}
