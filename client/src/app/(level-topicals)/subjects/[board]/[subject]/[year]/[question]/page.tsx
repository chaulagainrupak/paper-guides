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
  const [questionData, setQuestionData] = useState<string | string[]>(""); // single PDF (desktop) or array of images (mobile)
  const [markSchemeData, setMarkSchemeData] = useState<string | string[]>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showSolution, setShowSolution] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const detectMobile = () => /Mobi|Android/i.test(navigator.userAgent);
    const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = () => /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isIOS() && isSafari()) {
      alert("Please use a different browser. Safari on iPhone may not display documents correctly.");
    }

    setIsMobileView(detectMobile());
  }, []);

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

        setName(response[0]["questionName"] || "Untitled Question");

        const qData = response[0]["questionData"] || "";
        const sData = response[0]["markSchemeData"] || "";

        // if mobile, assume it's an array of images
        if (typeof qData === "string" && isMobileView) {
          setQuestionData(splitBase64Pages(qData));
          setMarkSchemeData(splitBase64Pages(sData));
        } else {
          setQuestionData(qData);
          setMarkSchemeData(sData);
        }
      } catch (error) {
        console.error("Failed to fetch question data:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params, isMobileView]);

  const currentData = showSolution ? markSchemeData : questionData;

  // helper to split a single base64 into multiple page images
  const splitBase64Pages = (data: string): string[] => {
    // Placeholder: Your backend should ideally return an array directly
    // This is a fallback, assuming delimiter for demo purposes
    return data.split(";;PAGE;;"); // e.g. backend joins per-page base64s like 'page1;;PAGE;;page2'
  };

  if (isLoading) return <Loader />;

  if (hasError || !currentData) {
    return (
      <div className="text-red-600 text-center mt-10">
        <h2 className="text-2xl font-bold">Failed to load the paper.</h2>
        <p>Please check your internet connection or try again later.</p>
        <BackButton />
      </div>
    );
  }

  return (
    <div className="h-screen relative">
      <title>{name}</title>

      {/* Title */}
      <div className="flex justify-between mb-4 items-center">
        <h1 className="text-4xl font-bold mb-2">{name}</h1>
        <div className="flex gap-2">
          <BackButton />
        </div>
      </div>

      {/* Mobile Toggle Button */}
      {isMobileView && (
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[var(--blue-highlight)] text-white text-xl font-bold rounded-full shadow-lg flex items-center justify-center"
        >
          {showSolution ? "Q" : "S"}
        </button>
      )}

      {/* Render Content */}
      {!isMobileView ? (
        <object
          data={`data:application/pdf;base64,${currentData as string}`}
          type="application/pdf"
          className="w-full h-full"
        />
      ) : (
        <div className="flex flex-col items-center gap-4 pb-20">
          {(currentData as string[]).map((imgBase64, index) => (
            <img
              key={index}
              src={`data:image/jpeg;base64,${imgBase64}`}
              alt={`Page ${index + 1}`}
              className="max-w-full rounded shadow"
            />
          ))}
        </div>
      )}
    </div>
  );
}
