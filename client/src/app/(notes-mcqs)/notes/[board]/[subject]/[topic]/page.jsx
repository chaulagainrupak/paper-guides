import { getApiUrl, isLocalhost } from "@/app/config";
import QuestionLinks from "./QuestionLinks";

export default async function NotesPage({ params }) {
  const { subject, topic } = await params;

  try {
    console.log(`${getApiUrl(isLocalhost())}/getNote/${subject}/${topic}`)
    const res = await fetch(
      `${getApiUrl(isLocalhost())}/getNote/${subject}/${topic}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed to fetch note content");

    const noteContent = await res.json();

    return (
      <QuestionLinks
        subject={subject}
        topic={topic}
        noteContent={noteContent.content}
      />
    );
  } catch (err) {
    console.error(err);
    return <div>Failed to load notes.</div>;
  }
}
