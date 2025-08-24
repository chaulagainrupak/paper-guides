import PaperViewerClient from "./PaperViewerClient";

export async function generateMetadata({
  params
}) {
  const { question }  = await params;
  return {
    title: `Paper Viewer | ${decodeURIComponent(question)}`,
    description: `View and download the question paper and its mark scheme for ${decodeURIComponent(question)}.`,
    icons: "/images/logo.ico",
    openGraph: {
      title: `Paper Viewer | ${decodeURIComponent(question)}`,
      description: `View and download the question paper and its mark scheme for ${decodeURIComponent(question)}.`,
      url: `https://paperguides.org/paper/${encodeURIComponent(question)}`,
      siteName: "Paper Guides",
      locale: "en_US",
      type: "website",
    },
  };
}

export default async function PaperViewerPage({
  params,
}) {
  const {question} = await params; 
  return <PaperViewerClient question={question} />;
}
