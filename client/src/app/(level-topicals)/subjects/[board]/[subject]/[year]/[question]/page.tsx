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
  const [showSolution, setShowSolution] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [pdfImages, setPdfImages] = useState<string[]>([]);
  const [fallbackTried, setFallbackTried] = useState(false);

  // Load PDF.js from CDN
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js";
    script.onload = () => {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
    };
    document.body.appendChild(script);
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
        setQuestionData(response[0]["questionData"] || "");
        setMarkSchemeData(response[0]["markSchemeData"] || "");
      } catch (error) {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params]);

  useEffect(() => {
    const urlPath = window.location.pathname;
    if (urlPath.includes("mark-scheme")) {
      setShowSolution(true);
    }
  }, []);

  const currentPdf = showSolution ? markSchemeData : questionData;

  useEffect(() => {
    if (!currentPdf) {
      setBlobUrl(null);
      return;
    }

    try {
      const byteCharacters = atob(currentPdf);
      const byteNumbers = Array.from(byteCharacters, (char) =>
        char.charCodeAt(0)
      );
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setBlobUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch {
      setBlobUrl(null);
    }
  }, [currentPdf]);

  const renderPdfToImages = async () => {
    try {
      if (!currentPdf || fallbackTried) return;

      setFallbackTried(true);

      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) return;

      const byteArray = Uint8Array.from(atob(currentPdf), (char) =>
        char.charCodeAt(0)
      );

      const loadingTask = pdfjsLib.getDocument({ data: byteArray });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const images: string[] = [];

      for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        const imgData = canvas.toDataURL("image/png");
        images.push(imgData);
      }

      setPdfImages(images);
    } catch (err) {
      console.error("PDF fallback failed:", err);
    }
  };

  const handleDownload = () => {
    try {
      if (!blobUrl) return;

      const fileName = showSolution ? "solution.pdf" : "question.pdf";
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        window.open(blobUrl, "_blank");
        return;
      }

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {}
  };

  const handleFullscreen = () => {
    try {
      if (!currentPdf) return;

      const byteArray = Uint8Array.from(atob(currentPdf), (char) =>
        char.charCodeAt(0)
      );
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {}
  };

  if (isLoading) {
    return <Loader />;
  }

  if (hasError || (!currentPdf && pdfImages.length === 0)) {
    return (
      <div className="text-red-600 text-center mt-10">
        <h2 className="text-2xl font-bold">Failed to load the paper.</h2>
        <p>Please check your internet connection or try again later.</p>
        <BackButton />
      </div>
    );
  }

  return (
    <div className="h-screen">
      <title>{name}</title>

      <div className="flex flex-col h-full">
        <div className="flex justify-between mb-4 items-center">
          <h1 className="text-4xl font-bold mb-2">{name}</h1>
          <div className="flex gap-2">
            <BackButton />
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={handleFullscreen}
              className="bg-[var(--green-highlight)] text-white text-lg font-bold px-4 py-2 rounded rounded-lg hover:opacity-80 transition"
            >
              {showSolution
                ? "View solution in fullscreen"
                : "View question in fullscreen"}
            </button>

            <button
              onClick={handleDownload}
              className={`${
                showSolution
                  ? "bg-[var(--pink-highlight)]"
                  : "bg-[var(--blue-highlight)]"
              } text-white text-lg font-bold px-4 py-2 rounded rounded-lg hover:opacity-80 transition`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e8eaed"
              >
                <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => setShowSolution(!showSolution)}
            className={`${
              showSolution
                ? "bg-[var(--pink-highlight)]"
                : "bg-[var(--blue-highlight)]"
            } text-white text-lg font-bold px-4 py-2 rounded rounded-lg hover:opacity-80 transition`}
          >
            {showSolution ? "Show Question" : "Show Solution"}
          </button>
        </div>

        {!pdfImages.length ? (
          <object
            data={blobUrl || undefined}
            type="application/pdf"
            className="w-full h-full"
            onError={renderPdfToImages}
          >
            <div className="text-center">
              Your browser can't display PDFs. Trying image fallback...
            </div>
          </object>
        ) : (
          <div className="space-y-4">
            {pdfImages.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Page ${index + 1}`}
                className="w-full max-w-[800px] mx-auto shadow rounded"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
