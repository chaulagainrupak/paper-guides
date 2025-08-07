import { getApiUrl, isLocalhost } from "@/app/config";
import QuestionLinks from "./questionLinksPage";

interface PageProps {
  params: Promise<{
    subject: string;
    year: string;
  }>;
}
export default async function getQuestionLinks({ params }: PageProps) {
  try {
    const { subject, year } = await params;

    const res = await fetch(
      getApiUrl(isLocalhost()) + `/getPapers/${subject}/${year}`,
      { cache: "default" }
    );
    const result = await res.json();
    const papers: [string, string][] = result[0]["components"];

    const grouped: Record<string, [string, string][]> = {
      "Feb / Mar": [],
      "May / June": [],
      "Oct / Nov": [],
      Other: [],
    };

    for (const item of papers) {
      const rawSession = item[0];
      const session = rawSession.toLowerCase();

      if (session.includes("feb") || session.includes("mar")) {
        grouped["Feb / Mar"].push(item);
      } else if (session.includes("may") || session.includes("jun")) {
        grouped["May / June"].push(item);
      } else if (session.includes("oct") || session.includes("nov")) {
        grouped["Oct / Nov"].push(item);
      } else {
        grouped["Other"].push(item);
      }
    }

    for (const sessionKey in grouped) {
      grouped[sessionKey].sort((a, b) => {
        const codeA = parseInt(a[1]);
        const codeB = parseInt(b[1]);
        return codeA - codeB;
      });
    }

    return (<QuestionLinks subject={subject} groupedPapers={grouped}/>)
  } catch (err) {
    console.error("Failed to fetch or group papers:", err);
  } 
}
