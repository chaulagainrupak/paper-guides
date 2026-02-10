"use client";

import { useState } from "react";
import { BackButton } from "@/app/components/BackButton";
import Link from "next/link";

export default function ViewerClient({
  name,
  questionData,
  markSchemeData,
}: {
  name: string;
  questionData: string;
  markSchemeData: string;
}) {
  const [showSolution, setShowSolution] = useState(false);

  const questionUrl = `data:application/pdf;base64,${questionData}`;
  const markSchemeUrl = `data:application/pdf;base64,${markSchemeData}`;

  const currentUrl = showSolution ? markSchemeUrl : questionUrl;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className="h-screen px-4">
      <title>{`Paper Guides | ${name}`}</title>
      <meta property="og:title" content={`Paper Guides | ${name}`} />
      <meta
        property="og:description"
        content={`Download and view the question and solution PDFs for ${name}.`}
      />

      <div className="flex flex-col h-full">
        <div className="flex justify-between mb-4 items-center">
          <h1 className="text-4xl font-bold mb-2">{name}</h1>
          <BackButton />
        </div>

        {!isMobile ? (
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => window.open(currentUrl, "_blank")}
                className="bg-[var(--green-highlight)] text-white text-lg font-bold px-4 py-2 rounded-lg shadow hover:opacity-80 transition"
              >
                {showSolution
                  ? "View solution in fullscreen"
                  : "View question in fullscreen"}
              </button>

              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = currentUrl;
                  link.download = showSolution
                    ? "solution.pdf"
                    : "question.pdf";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className={`${
                  showSolution
                    ? "bg-[var(--pink-highlight)]"
                    : "bg-[var(--blue-highlight)]"
                } text-white text-lg font-bold px-4 py-2 rounded-lg shadow hover:opacity-80 transition`}
              >
                ⬇️ Download PDF
              </button>
            </div>

            <button
              onClick={() => setShowSolution(!showSolution)}
              className={`${
                showSolution
                  ? "bg-[var(--pink-highlight)]"
                  : "bg-[var(--blue-highlight)]"
              } text-white text-lg font-bold px-4 py-2 rounded-lg shadow hover:opacity-80 transition`}
            >
              {showSolution ? "Show Question" : "Show Solution"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mb-4">
            <Link
              href={currentUrl}
              download={showSolution ? "solution.pdf" : "question.pdf"}
              className="bg-[var(--blue-highlight)] text-white text-lg font-bold px-6 py-3 rounded-lg shadow text-center hover:opacity-90 transition"
            >
              ⬇️ Download {showSolution ? "Solution" : "Question"} PDF
            </Link>

            <Link
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[var(--green-highlight)] text-white text-lg font-bold px-6 py-3 rounded-lg shadow text-center hover:opacity-90 transition"
            >
              Open PDF in your browser
            </Link>

            <button
              onClick={() => setShowSolution(!showSolution)}
              className="bg-[var(--pink-highlight)] text-white text-lg font-bold px-6 py-3 rounded-lg shadow hover:opacity-90 transition"
            >
              {showSolution ? "Show Question" : "Show Solution"}
            </button>
          </div>
        )}

        <object
          width="100%"
          height="600px"
          data={currentUrl}
          type="application/pdf"
          className="w-full h-full border rounded shadow"
        >
          <div className="text-center mt-4 text-gray-700">
            Your browser does not support inline PDF viewing. Use the buttons
            above to download.
          </div>
        </object>

        {/* Hidden links for SEO crawlers */}
        <div className="hidden">
          <Link href={questionUrl}>Question PDF</Link>
          <Link href={markSchemeUrl}>Solution PDF</Link>
        </div>
      </div>
    </div>
  );
}
