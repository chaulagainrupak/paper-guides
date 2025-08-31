"use client";

import { useState } from "react";
import { BackButton } from "@/app/utils";

interface PaperViewerClientProps {
  questionName: string;
  questionPdf: string; // base64
  markSchemePdf: string; // base64
  morePapers: { name: string; url: string }[];
}

export default function PaperViewerClient({ questionName, questionPdf, markSchemePdf, morePapers }: PaperViewerClientProps) {
  const [showSolution, setShowSolution] = useState(false);

  const pdfToUrl = (base64: string | undefined) => {
    if (!base64) return undefined;
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  };

  return (
    <div className="h-screen px-4">
      <meta property="og:title" content={`Paper Guides | ${questionName}`} />
      <title>{`Paper Guides | ${questionName}`}</title>

      <div className="flex flex-col h-full">
        <div className="flex justify-between mb-4 items-center">
          <h1 className="text-4xl font-bold mb-2">{questionName}</h1>
          <BackButton />
        </div>

        <div className="mb-6">
          <object
            data={showSolution ? pdfToUrl(markSchemePdf) : pdfToUrl(questionPdf)}
            type="application/pdf"
            className="w-full h-[600px] border rounded shadow"
          >
            <div className="text-center mt-4 text-gray-700">
              Your browser does not support inline PDF viewing.
            </div>
          </object>

          <p className="mt-4 text-gray-800">
            This paper covers detailed questions and solutions for {questionName}. Download and review to practice and prepare effectively for your exams.
          </p>

          <div className="flex gap-2 mt-4">
            <button onClick={() => setShowSolution(!showSolution)} className="bg-[var(--blue-highlight)] text-white px-4 py-2 rounded">
              {showSolution ? "Show Question" : "Show Solution"}
            </button>
          </div>
        </div>

        {/* <div className="mt-8">
          <h2 className="text-2xl font-bold mb-2">Here's some more papers for you</h2>
          <ul className="space-y-2">
            {morePapers.map((p, i) => (
              <li key={i}>
                <a href={p.url} className="text-blue-600 underline hover:text-blue-800">
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </div> */}
      </div>
    </div>
  );
}
