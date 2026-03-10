import { useState, useEffect } from "react";
import { API_URL } from "../utils/config";

interface Props {
  name: string;
  board: string;
  subject: string;
  year: string;
  component: string;
  session: string;
  type: string;
  insert: boolean;
  semester: string;
}

export default function PaperViewerClient({
  name,
  board,
  subject,
  year,
  component,
  session,
  type,
  insert,
  semester,
}: Props) {
  const [questionData, setQuestionData] = useState<string | null>(null);
  const [markSchemeData, setMarkSchemeData] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    async function fetchPaper() {
      try {
        let url = "";

        if (board === "ku") {
          url =
            `${API_URL}/getData?board=ku` +
            `&subject=${encodeURIComponent(subject)}` +
            `&year=${encodeURIComponent(year)}` +
            `&semester=${encodeURIComponent(semester)}`;
        } else {
          url =
            `${API_URL}/getData?board=a-levels` +
            `&subject=${encodeURIComponent(subject)}` +
            `&year=${year}` +
            `&component=${component}` +
            `&session=${session}` +
            `&type=${type}` +
            `&insert=${insert}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        setQuestionData(data.questionData ?? null);
        setMarkSchemeData(data.markSchemeData ?? null);
      } catch (e) {
        console.error(e);
      }

      setLoading(false);
    }

    fetchPaper();
  }, []);

  const hasQuestion = !!questionData && questionData.length > 10;
  const hasMarkScheme = !!markSchemeData && markSchemeData.length > 10;

  const questionUrl = hasQuestion
    ? `data:application/pdf;base64,${questionData}`
    : null;

  const markSchemeUrl = hasMarkScheme
    ? `data:application/pdf;base64,${markSchemeData}`
    : null;

  const currentUrl = showSolution ? markSchemeUrl : questionUrl;

  if (loading) {
    return <div className="py-24 text-center opacity-60">Loading paper...</div>;
  }

  return (
    <div className="h-screen px-4">
      <div className="flex flex-col h-full">

        {/* Desktop buttons */}
        {!isMobile && (
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <div className="flex gap-2">
              {currentUrl && (
                <>
                  <button
                    onClick={() => window.open(currentUrl, "_blank")}
                    className="bg-[var(--green-highlight)] text-white text-lg font-bold px-4 py-2 rounded-lg shadow hover:opacity-80 transition"
                  >
                    ↗ Open Fullscreen
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = currentUrl;
                      link.download = `${name}.pdf`;
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
                    ⬇ Download PDF
                  </button>
                </>
              )}
            </div>

            {hasQuestion && hasMarkScheme && (
              <button
                onClick={() => setShowSolution(!showSolution)}
                className={`${
                  showSolution
                    ? "bg-[var(--pink-highlight)]"
                    : "bg-[var(--blue-highlight)]"
                } text-white text-lg font-bold px-4 py-2 rounded-lg shadow hover:opacity-80 transition`}
              >
                {showSolution ? "📄 Show Question" : "✅ Show Mark Scheme"}
              </button>
            )}
          </div>
        )}

        {/* Mobile buttons */}
        {isMobile && (
          <div className="flex flex-col gap-3 mb-4">
            {currentUrl && (
              <>
                <a
                  href={currentUrl}
                  download={`${name}.pdf`}
                  className="bg-[var(--blue-highlight)] text-white text-lg font-bold px-6 py-3 rounded-lg shadow text-center hover:opacity-90 transition"
                >
                  ⬇ Download {showSolution ? "Mark Scheme" : "Question"} PDF
                </a>
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[var(--green-highlight)] text-white text-lg font-bold px-6 py-3 rounded-lg shadow text-center hover:opacity-90 transition"
                >
                  ↗ Open PDF in browser
                </a>
              </>
            )}
            {hasQuestion && hasMarkScheme && (
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="bg-[var(--pink-highlight)] text-white text-lg font-bold px-6 py-3 rounded-lg shadow hover:opacity-90 transition"
              >
                {showSolution ? "📄 Show Question" : "✅ Show Mark Scheme"}
              </button>
            )}
          </div>
        )}

        {/* PDF embed */}
        {currentUrl ? (
          <object
            key={currentUrl}
            data={currentUrl}
            type="application/pdf"
            className="w-full flex-1 border rounded shadow min-h-0"
          >
            <div className="text-center mt-8 opacity-60">
              <p className="mb-4">Your browser can't display PDFs inline.</p>
              <a
                href={currentUrl}
                download
                className="px-6 py-3 bg-[var(--blue-highlight)] text-white font-bold rounded-lg hover:opacity-80 transition"
              >
                Download PDF
              </a>
            </div>
          </object>
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-50">
            Paper not available
          </div>
        )}
      </div>
    </div>
  );
}