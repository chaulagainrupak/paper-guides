import { Metadata } from "next";
import QuestionGeneratorForm from "./QuestionGeneratorForm.jsx";

export const metadata: Metadata = {
  title: "Paper Guides | Past Papers ",
  description:
    "Free exam preparation resources, Notes, Past-Papers, Question Papers, Question Generator, MCQs practice and more.  Find past papers for O-Level, A-Levels, NEB / TU / IOE and more.",
  icons: "/images/logo.ico",
  openGraph: {
    title: "Paper Guides | Past Papers",
    description:
      "Free exam preparation resources, Notes, Past-Papers, Question Papers, Question Generator, MCQs practice and more. Find past papers for O-Level, A-Levels, NEB / TU / IOEand more.",
    url: "https://paperguides.org",
    siteName: "Paper Guides",
    images: [
      {
        url: "/images/opg_mcqs_question_generator.png",
        width: 1200,
        height: 720,
        alt: "Paper Guides Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default async function mcqsPage() {
  return (
    <div >
      <QuestionGeneratorForm />
    </div>
  );
}
