import PaperViewerClient from "./PaperViewerClient";

export async function generateMetadata({ params }) {
  const { question } = params;
  const decodedQuestion = decodeURIComponent(question);

  const description = `
    View and download the ${decodedQuestion} question paper along with its mark scheme.
    Prepare for exams with our detailed past papers, answers, and helpful resources.
    Access all your A Level, O Level, and other board-specific papers in one place.
    Perfect for students and teachers looking for reliable study materials.
  `.trim().replace(/\s+/g, ' ');

  return {
    description,
    icons: "/images/logo.ico",
    openGraph: {
      description,
      url: `https://paperguides.org/paper/${encodeURIComponent(decodedQuestion)}`,
      siteName: "Paper Guides",
      locale: "en_US",
      type: "website",
    },
  };
}

export default async function PaperViewerPage({ params }) {
  return <PaperViewerClient question={params.question} />;
}
