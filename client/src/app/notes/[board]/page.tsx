import { getApiUrl, isLocalhost } from "@/app/config";
import SubjectsPage from "./boardsPage";

interface PageProps {
  params: Promise<{ board: string }>;
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
