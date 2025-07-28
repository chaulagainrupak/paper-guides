"use client";

import { getApiUrl, isLocalhost } from "@/app/config";
import { BackButton, Loader } from "@/app/utils";
import { useEffect, useState } from "react";

export default function PaperViewerClient({
  params,
}: {
  params: Promise<{ question: string }>;
}) {
  const [name, setName] = useState("");
  const [questionData, setQuestionData] = useState("");
  const [markSchemeData, setMarkSchemeData] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const [questionBlobUrl, setQuestionBlobUrl] = useState<string | null>(null);
  const [markSchemeBlobUrl, setMarkSchemeBlobUrl] = useState<string | null>(
    null
  );

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { question } = await params;

        const res = await fetch(
          `${getApiUrl(isLocalhost())}/getData/${question}`,
          { cache: "no-store" }
        );

        const response = await res.json();

        if (!Array.isArray(response) || response.length === 0) {
          throw new Error("Empty response");
        }

        const qp = response[0]["questionData"] || "";
        const ms = response[0]["markSchemeData"] || "";
        const title = response[0]["questionName"] || "Untitled Question";

        setQuestionData(qp);
        setMarkSchemeData(ms);
        setName(title);

        // convert to blob URLs
        const generateBlobUrl = (base64: string): string => {
          const byteArray = Uint8Array.from(atob(base64), (char) =>
            char.charCodeAt(0)
          );
          const blob = new Blob([byteArray], { type: "application/pdf" });
          return URL.createObjectURL(blob);
        };

        if (qp) setQuestionBlobUrl(generateBlobUrl(qp));
        if (ms) setMarkSchemeBlobUrl(generateBlobUrl(ms));
      } catch (err) {
        console.error("Error loading PDF:", err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params]);

  if (isLoading) return <Loader />;

  if (hasError || (!questionData && !markSchemeData)) {
    return (
      <div className="text-red-600 text-center mt-10">
        <h2 className="text-2xl font-bold">Failed to load the paper.</h2>
        <p>Please check your internet connection or try again later.</p>
        <BackButton />
      </div>
    );
  }

  return (
    <div className="h-screen px-4">
      <title>{name}</title>

      <div className="flex flex-col h-full">
        <div className="flex justify-between mb-4 items-center">
          <h1 className="text-4xl font-bold mb-2">{name}</h1>
          <BackButton />
        </div>

        {isMobile ? (
          <div>
            if (questionBlobUrl) {
              <iframe src={questionBlobUrl || "eh"}>
                <button
                  onClick={() => {
                    if (questionBlobUrl) window.open(questionBlobUrl, "_blank");
                  }}
                  className="bg-[var(--blue-highlight)] text-white text-xl font-bold py-3 rounded-lg hover:opacity-80 transition"
                >
                  📄 Open Question Paper in new tab
                </button>
              </iframe>
            }

            if (markSchemeBlobUrl) {
              <iframe src={markSchemeBlobUrl || "eh"}>
                <button
                  onClick={() => {
                    if (markSchemeBlobUrl) window.open(markSchemeBlobUrl, "_blank");
                  }}
                  className="bg-[var(--pink-highlight)] text-white text-xl font-bold py-3 rounded-lg hover:opacity-80 transition"
                >
                  ✅ Open Mark Scheme in new tab
                </button>
              </iframe>
            }
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const currentBlob = showSolution
                      ? markSchemeBlobUrl
                      : questionBlobUrl;
                    if (currentBlob) window.open(currentBlob, "_blank");
                  }}
                  className="bg-[var(--green-highlight)] text-white text-lg font-bold px-4 py-2 rounded-lg hover:opacity-80 transition"
                >
                  {showSolution
                    ? "View solution in fullscreen"
                    : "View question in fullscreen"}
                </button>

                <button
                  onClick={() => {
                    const blobUrl = showSolution
                      ? markSchemeBlobUrl
                      : questionBlobUrl;
                    if (!blobUrl) return;

                    const link = document.createElement("a");
                    link.href = blobUrl;
                    link.download = showSolution
                      ? "solution.pdf"
                      : "question.pdf";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className={`${showSolution
                    ? "bg-[var(--pink-highlight)]"
                    : "bg-[var(--blue-highlight)]"
                    } text-white text-lg font-bold px-4 py-2 rounded-lg hover:opacity-80 transition`}
                >
                  ⬇️ Download PDF
                </button>
              </div>

              <button
                onClick={() => setShowSolution(!showSolution)}
                className={`${showSolution
                  ? "bg-[var(--pink-highlight)]"
                  : "bg-[var(--blue-highlight)]"
                  } text-white text-lg font-bold px-4 py-2 rounded-lg hover:opacity-80 transition`}
              >
                {showSolution ? "Show Question" : "Show Solution"}
              </button>
            </div>

            <object
              data={
                showSolution ? markSchemeBlobUrl ?? undefined : questionBlobUrl ?? undefined
              }
              type="application/pdf"
              className="w-full h-full border rounded shadow"
            >
              <div className="text-center mt-4 text-gray-700">
                Your browser does not support inline PDF viewing. Use the buttons above.
              </div>
            </object>
          </>
        )}
      </div>
    </div>
  );
}
