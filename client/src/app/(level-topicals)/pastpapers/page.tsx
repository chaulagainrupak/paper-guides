import { getApiUrl, isLocalhost } from "@/app/config";
import PastPapersPage from "./pastPaperPage";

export default async function FetchPastPapers() {
  try {
    const apiUrl = getApiUrl(isLocalhost());
    const response = await fetch(apiUrl + "/pastpapers", { cache: "no-store" });

    const boardsData = await response.json();

    return <PastPapersPage boardsData={boardsData} />;
  } catch (err) {
    console.error("Something went wrong fetching past papers!", err);
    return <div className="p-4 text-red-600">Failed to load past papers.</div>;
  }
}
