import { useState, useEffect, useRef } from "react";
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

  const scrollEvents = useRef({
    25: false,
    50: false,
    75: false,
    90: false,
  });

  function sendEvent(eventName: string) {
    try {
      //@ts-ignore
      if (window.umami) {
        //@ts-ignore
        window.umami.track(eventName, {
          paper: name,
          subject: subject,
          board: board,
          year: year,
          source: "paper viewer",
        });
      }
    } catch {}
  }

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      if (!height) return;

      const percent = (scrollTop / height) * 100;

      if (percent > 25 && !scrollEvents.current[25]) {
        scrollEvents.current[25] = true;
        sendEvent("Scrolled 25%");
      }

      if (percent > 50 && !scrollEvents.current[50]) {
        scrollEvents.current[50] = true;
        sendEvent("Scrolled 50%");
      }

      if (percent > 75 && !scrollEvents.current[75]) {
        scrollEvents.current[75] = true;
        sendEvent("Scrolled 75%");
      }

      if (percent > 90 && !scrollEvents.current[90]) {
        scrollEvents.current[90] = true;
        sendEvent("Scrolled 90%");
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

        sendEvent("Viewed Paper");
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
    <div>
      {!isMobile && (
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div className="flex gap-2">
            {currentUrl && (
              <>
                <button
                  onClick={() => {
                    sendEvent("Opened Fullscreen");
                    window.open(currentUrl, "_blank");
                  }}
                  className="bg-[var(--green-highlight)] text-white text-lg font-bold px-4 py-2 rounded-lg shadow hover:opacity-80 transition flex items-center gap-2"
                >
                  <i className="ph ph-arrow-square-out"></i> Open Fullscreen
                </button>

                <button
                  onClick={() => {
                    sendEvent("Downloaded Paper");

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
                  } text-white text-lg font-bold px-4 py-2 rounded-lg shadow hover:opacity-80 transition flex items-center gap-2`}
                >
                  <i className="ph ph-download"></i> Download PDF
                </button>
              </>
            )}
          </div>

          {hasQuestion && hasMarkScheme && (
            <button
              onClick={() => {
                sendEvent("Toggled Mark Scheme");
                setShowSolution(!showSolution);
              }}
              className={`${
                showSolution
                  ? "bg-[var(--pink-highlight)]"
                  : "bg-[var(--blue-highlight)]"
              } text-white text-lg font-bold px-4 py-2 rounded-lg shadow hover:opacity-80 transition flex items-center gap-2`}
            >
              {showSolution ? (
                <>
                  <i className="ph ph-file-text"></i> Show Question
                </>
              ) : (
                <>
                  <i className="ph ph-check-circle"></i> Show Mark Scheme
                </>
              )}
            </button>
          )}
        </div>
      )}

      <div
        className="h-screen px-4"
        data-paper={name}
        data-subject={subject}
        data-board={board}
        data-year={year}
        data-source="paper viewer"
      >
        <div className="flex flex-col h-full">
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
                  onClick={() => sendEvent("Downloaded Paper")}
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
    </div>
  );
}