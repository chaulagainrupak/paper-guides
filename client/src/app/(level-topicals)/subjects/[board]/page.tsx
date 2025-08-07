import { getApiUrl, isLocalhost } from "@/app/config";
import SubjectsPage from "./boardsPage";

interface PageProps {
  params:
  Promise<{ "board": string }>,
}
export default async function fetchSubjects({ params }: PageProps) {
  const { board } = await params;

  try {
    const response = await fetch(
      getApiUrl(isLocalhost()) + `/subjects/${board}`,
      { cache: "no-store" }
    );
    const data = await response.json();

    return (
      <SubjectsPage board={decodeURI(board)} subjects={data} />
    )
  } catch {
    console.error("Something has happned on the server! DON'T PANIC!")
  }
};