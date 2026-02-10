import { getApiUrl, isLocalhost } from "@/app/config";
import ViewerClient from "./paperViewerClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    board: string;
    subject: string;
    year: string;
    question: string;
  }>;
}) {
  const res = await fetch(
    `${getApiUrl(isLocalhost())}/getData/${(await params).question}`,
    { cache: "default" },
  );
  const data = await res.json();

  const title =
    (Array.isArray(data) && data[0]?.questionName) || "Untitled Question";

  return {
    title: `Paper Guides | ${title}`,
    description: `Download and view the question and solution PDFs for ${title}.`,
    openGraph: {
      title: `Paper Guides | ${title}`,
      description: `Detailed questions and solutions for ${title}`,
    },
  };
}

export default async function PaperViewerPage({
  params,
}: {
  params: Promise<{
    board: string;
    subject: string;
    year: string;
    question: string;
  }>;
}) {
  const { question, board, subject, year } = await params;

  //  another beautiful half assed solution for a really simple solution
  //  forgive me for the sins i've comiited, Terry
  var urlEndpoint;
  if (board.toLowerCase() == "kathmandu%20university") {
    urlEndpoint = `/getData/${question}?board=ku&subject=${subject}&year=${year}`;
  } else {
    urlEndpoint = `/getData/${question}?board=a%20levels&subject=${subject}&year=${year}`;
  }
  const res = await fetch(getApiUrl(isLocalhost()) + urlEndpoint, {
    cache: "default",
  });
  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-red-600 text-center mt-10">
        <h2 className="text-2xl font-bold">Failed to load the paper.</h2>
      </div>
    );
  }

  const qp = data[0]["questionData"] || "";
  const ms = data[0]["markSchemeData"] || "";
  const title = data[0]["questionName"] || "Untitled Question";

  return <ViewerClient name={title} questionData={qp} markSchemeData={ms} />;
}
