// "use client";
import { Metadata } from "next";
import QuestionGeneratorForm from "./QuestionGeneratorForm.jsx";
import { getSiteUrl } from "../config";

export const metadata: Metadata = {
  title: "Paper Guides | Question Generator ",
  description:
    "Free exam preparation resources, Notes, Past-Papers, Question Papers, Question Generator, MCQs practice and more.  Find past papers for O-Level, A-Levels, NEB / TU / IOE and more.",
  icons: "/images/logo.ico",
  openGraph: {
    title: "Paper Guides | Question Generator",

    description:
      "Free exam preparation resources, Notes, Past-Papers, Question Papers, Question Generator, MCQs practice and more. Find past papers for O-Level, A-Levels, NEB / TU / IOEand more.",
    url: "https://paperguides.org/generator",
    siteName: "Paper Guides",
    images: [
      {
        url: `${getSiteUrl}/images/opg_question_generator.png`,
        width: 1200,
        height: 720,
        alt: "Paper Guides Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-6xl p-6">
        <QuestionGeneratorForm />
      </div>
    </div>
  );
}
