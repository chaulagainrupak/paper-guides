import PaperViewerClient from "./PaperViewerClient";

export async function generateMetadata({
  params
}) {
  const { question }  = await params;
  return {
    description: `Access ${decodeURIComponent(question)} past papers with mark schemes for A-Level exam prep. Download PDFs to study and boost your grades.`,
    icons: "/images/logo.ico",
    openGraph: {
      description: `Access ${decodeURIComponent(question)} past papers with mark schemes for A-Level exam prep. Download PDFs to study and boost your grades.`,
      url: `https://paperguides.org/pastpapers`,
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