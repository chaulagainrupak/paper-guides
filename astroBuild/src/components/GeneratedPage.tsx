import { useState, useEffect, useRef } from "react";

interface QuestionItem {
  [key: number]: any;
  length?: number;
}

interface Props {
  data: QuestionItem[];
  onBack: () => void;
}

declare global {
  interface Window {
    umami?: {
      track: (
        eventName: string,
        data?: Record<string, string | number | boolean>,
      ) => void;
    };
    katex?: any;
    marked?: any;
  }
}

function trackEvent(
  eventName: string,
  data?: Record<string, string | number | boolean>,
) {
  try {
    window.umami?.track(eventName, data);
  } catch {
    // Umami not loaded — silently ignore
  }
}

const difficultyToColorMap: Record<number, string> = {
  1: "var(--diff-one)",
  2: "var(--diff-two)",
  3: "var(--diff-three)",
  4: "var(--diff-four)",
  5: "var(--diff-five)",
};

const difficultyLabels: Record<number, string> = {
  1: "Very Easy",
  2: "Easy",
  3: "Medium",
  4: "Hard",
  5: "Very Hard",
};

function getField(item: any, arrayIdx: number, ...keys: string[]): any {
  if (Array.isArray(item)) return item[arrayIdx];
  for (const k of keys) {
    if (item[k] !== undefined) return item[k];
  }
  return undefined;
}

/**
 * RichContent renders a string that may contain any mix of:
 *   - Block LaTeX:  $$...$$
 *   - Inline LaTeX: $...$
 *   - Markdown:     everything else (headings, bold, code, tables, lists, etc.)
 *
 * Strategy:
 *   1. Split the raw string on LaTeX delimiters, keeping them in the array.
 *   2. Non-LaTeX chunks → run through marked.parse() → set as innerHTML.
 *   3. LaTeX chunks → render with KaTeX into a span/div.
 *   4. Append all nodes to a DocumentFragment, then mount onto the container.
 */
const RichContent = ({ content }: { content?: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!content || !ref.current) return;

    const container = ref.current;
    container.innerHTML = "";

    // Split on $$...$$ (block) and $...$ (inline), keeping delimiters.
    const parts = content.split(/((?:\$\$[\s\S]*?\$\$|\$[^\n$]*?\$))/g);

    const fragment = document.createDocumentFragment();

    for (const part of parts) {
      if (!part) continue;

      const isBlockMath =
        part.startsWith("$$") && part.endsWith("$$") && part.length > 4;
      const isInlineMath =
        !isBlockMath &&
        part.startsWith("$") &&
        part.endsWith("$") &&
        part.length > 2;

      if (isBlockMath || isInlineMath) {
        // ── LaTeX ──────────────────────────────────────────────
        const raw = isBlockMath ? part.slice(2, -2) : part.slice(1, -1);
        const mathNode = document.createElement(isBlockMath ? "div" : "span");
        mathNode.className = isBlockMath ? "math-block" : "math-inline";
        try {
          // @ts-ignore
          katex.render(raw, mathNode, {
            displayMode: isBlockMath,
            throwOnError: false,
          });
        } catch {
          mathNode.textContent = part; // fallback: show raw
        }
        fragment.appendChild(mathNode);
      } else {
        // ── Markdown ───────────────────────────────────────────
        const mdDiv = document.createElement("div");
        mdDiv.className = "md-content";
        try {
          // @ts-ignore
          mdDiv.innerHTML = marked.parse(part, { breaks: true });
        } catch {
          // marked not available — plain text fallback
          mdDiv.innerHTML = part.replace(/\n/g, "<br/>");
        }
        fragment.appendChild(mdDiv);
      }
    }

    container.appendChild(fragment);
  }, [content]);

  return <div ref={ref} className="rich-content" />;
};

export default function GeneratedPage({ data, onBack }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const sessionStartTime = useRef(Date.now());
  const questionStartTime = useRef(Date.now());
  const solutionViewedCount = useRef(0);
  const questionsViewed = useRef<Set<number>>(new Set([0]));

  const itemsPerPage = 6;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);
    setPaginationData(data.slice(startIndex, endIndex));
  }, [currentPage, data]);

  useEffect(() => {
    trackEvent("Question Viewer Opened", { "Total Questions": data.length });

    return () => {
      const sessionDuration = Math.round(
        (Date.now() - sessionStartTime.current) / 1000,
      );
      trackEvent("Question Viewer Closed", {
        "Total Questions": data.length,
        "Questions Viewed": questionsViewed.current.size,
        "Solutions Revealed": solutionViewedCount.current,
        "Session Duration Seconds": sessionDuration,
      });
    };
  }, []);

  const q = data[currentQuestion];
  const topic = getField(q, 3, "topic");
  const difficulty = getField(q, 4, "difficulty");
  const component = getField(q, 7, "component");
  const questionConent = getField(q, 8, "questionConent", "question_image");
  const solutionContent = getField(q, 9, "solutionContent", "solution_image");

  const navigateToQuestion = (
    index: number,
    source: "Sidebar Click" | "Prev Button" | "Next Button",
  ) => {
    const timeSpent = Math.round(
      (Date.now() - questionStartTime.current) / 1000,
    );
    trackEvent("Question Navigated", {
      "From Question": currentQuestion + 1,
      "To Question": index + 1,
      "Navigation Source": source,
      "Time Spent On Question Seconds": timeSpent,
      "Solution Was Shown": showSolution,
      Topic: topic ?? "Unknown",
      Difficulty: difficulty ?? 0,
      "Difficulty Label": difficultyLabels[difficulty] ?? "Unknown",
      Component: component ?? "Unknown",
    });

    questionsViewed.current.add(index);
    questionStartTime.current = Date.now();
    setCurrentQuestion(index);
    setShowSolution(false);
  };

  const toggleSolution = () => {
    const next = !showSolution;
    if (next) {
      solutionViewedCount.current += 1;
      trackEvent("Solution Revealed", {
        "Question Number": currentQuestion + 1,
        Topic: topic ?? "Unknown",
        Difficulty: difficulty ?? 0,
        "Difficulty Label": difficultyLabels[difficulty] ?? "Unknown",
        Component: component ?? "Unknown",
        "Total Reveals This Session": solutionViewedCount.current,
      });
    } else {
      trackEvent("Solution Hidden", {
        "Question Number": currentQuestion + 1,
        Topic: topic ?? "Unknown",
      });
    }
    setShowSolution(next);
  };

  const handlePageChange = (newPage: number) => {
    trackEvent("Sidebar Page Changed", {
      "From Page": currentPage,
      "To Page": newPage,
      "Total Pages": totalPages,
    });
    setCurrentPage(newPage);
  };

  const handleBack = () => {
    const sessionDuration = Math.round(
      (Date.now() - sessionStartTime.current) / 1000,
    );
    trackEvent("Generate Again Clicked", {
      "Total Questions": data.length,
      "Questions Viewed": questionsViewed.current.size,
      "Solutions Revealed": solutionViewedCount.current,
      "Session Duration Seconds": sessionDuration,
      "Last Question Number": currentQuestion + 1,
      "Last Topic": topic ?? "Unknown",
    });
    onBack();
  };

  const buttonBgClass = showSolution
    ? "bg-[var(--pink-highlight)]"
    : "bg-[var(--blue-highlight)]";

  return (
    <>
      <style>{`
        .rich-content {
          line-height: 1.7;
          font-size: 1rem;
        }

        .md-content code {
          font-family: 'Fira Code', 'Cascadia Code', monospace;
          font-size: 0.875em;
          background: var(--color-nav, #f0f0f0);
          border: 1px solid var(--color-border, #ddd);
          border-radius: 4px;
          padding: 0.1em 0.35em;
        }

        .md-content pre {
          background: var(--color-nav, #f0f0f0);
          border: 1px solid var(--color-border, #ddd);
          border-radius: 8px;
          padding: 1em;
          overflow-x: auto;
          margin: 0.75em 0;
        }
        .md-content pre code {
          background: none;
          border: none;
          padding: 0;
          font-size: 0.85em;
        }

        .md-content blockquote {
          border-left: 3px solid var(--blue-highlight, #4a90d9);
          margin: 0.75em 0;
          padding: 0.25em 0 0.25em 1em;
          opacity: 0.85;
        }

        .md-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 0.75em 0;
          font-size: 0.9em;
        }
        .md-content th, .md-content td {
          border: 1px solid var(--color-border, #ddd);
          padding: 0.4em 0.75em;
          text-align: left;
        }
        .md-content th {
          background: var(--color-nav, #f0f0f0);
          font-weight: 700;
        }

        .md-content hr {
          border: none;
          border-top: 1px solid var(--color-border, #ddd);
          margin: 1em 0;
        }

        .md-content a {
          color: var(--blue-highlight, #4a90d9);
          text-decoration: underline;
        }

        /* KaTeX display block */
        .math-block {
          display: block;
          overflow-x: auto;
          margin: 0.75em 0;
          text-align: center;
        }

        /* KaTeX inline */
        .math-inline {
          display: inline;
        }
      `}</style>

      <div
        className="py-2 flex gap-3 bg-[var(--baby-powder)] rounded-lg shadow-lg max-md:flex-col"
        style={{
          position: "fixed",
          top: "88px",
          bottom: "24px",
          left: "24px",
          right: "24px",
          overflowY: "auto",
          padding: "16px",
          zIndex: 1000,
        }}
      >
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <div className="bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] md:w-1/4 max-md:h-1/4 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-surface)] z-10">
            <div className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[var(--blue-highlight)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-[var(--blue-highlight)]">{data.length}</span>{" "}
              Questions
            </div>
            <button
              onClick={handleBack}
              className="mt-2 w-full px-3 py-1.5 rounded-lg bg-[var(--blue-highlight)] text-white text-sm font-bold hover:opacity-80 transition cursor-pointer"
            >
              ← Generate Again
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            <div className="p-4 space-y-3">
              {paginationData.map((item, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index;
                const itemTopic = getField(item, 3, "topic") ?? "Question";
                const itemDiff = getField(item, 4, "difficulty") ?? 1;
                const itemComp = getField(item, 7, "component") ?? "";
                const diffColor =
                  difficultyToColorMap[itemDiff] ?? "var(--blue-highlight)";

                return (
                  <div
                    key={globalIndex}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                    style={{
                      borderRight: `4px solid ${diffColor}`,
                      outline:
                        currentQuestion === globalIndex
                          ? "2px solid var(--blue-highlight)"
                          : undefined,
                      backgroundColor: "var(--color-nav)",
                    }}
                    onClick={() => navigateToQuestion(globalIndex, "Sidebar Click")}
                  >
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--blue-highlight)] text-white font-bold flex-shrink-0"
                      style={{ border: `2px solid ${diffColor}` }}
                    >
                      {globalIndex + 1}
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <span className="text-sm font-semibold truncate">{itemTopic}</span>
                      <span className="text-xs text-[var(--pink-highlight)] truncate">
                        Comp: {itemComp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[var(--color-border)] p-4 flex items-center justify-between">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                  currentPage === 1
                    ? "bg-gray-300 cursor-not-allowed opacity-50"
                    : "bg-[var(--blue-highlight)] hover:opacity-80 text-white cursor-pointer"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Prev
              </button>
              <span className="text-sm font-medium">
                <span className="text-[var(--blue-highlight)]">{currentPage}</span>
                {" / "}
                <span className="text-[var(--pink-highlight)]">{totalPages}</span>
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                  currentPage === totalPages
                    ? "bg-gray-300 cursor-not-allowed opacity-50"
                    : "bg-[var(--blue-highlight)] hover:opacity-80 text-white cursor-pointer"
                }`}
              >
                Next
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Main viewer ──────────────────────────────────────── */}
        <div className="flex-1 bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] p-3 overflow-hidden flex flex-col">
          <div className="shadow-lg bg-[var(--baby-powder)] flex justify-between p-3 text-base max-md:text-sm rounded-lg mb-4 flex-shrink-0">
            <div className="flex gap-4 flex-wrap items-center">
              <span>
                Topic: <strong>{topic}</strong>
              </span>
              <span>
                Difficulty:{" "}
                <strong
                  style={{ color: difficultyToColorMap[difficulty] ?? "inherit" }}
                >
                  {difficulty}
                </strong>
              </span>
              <span>
                Component: <strong>{component}</strong>
              </span>
            </div>
            <button
              className={`shadow-lg font-semibold text-white p-2 rounded-lg cursor-pointer transition ${buttonBgClass}`}
              onClick={toggleSolution}
            >
              {showSolution ? "Hide Solution" : "Show Solution"}
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-2">
            {!showSolution ? (
              questionConent ? (
                <div>
                  <h4>Question:</h4>
                  <br />
                  <RichContent content={questionConent} />
                </div>
              ) : (
                <p className="text-center opacity-50 mt-8">No question available</p>
              )
            ) : solutionContent ? (
              <div>
                <h4>Solution:</h4>
                <br />
                <RichContent content={solutionContent} />
              </div>
            ) : (
              <p className="text-center opacity-50 mt-8">No solution available</p>
            )}
          </div>

          <div className="flex justify-between mt-3 flex-shrink-0">
            <button
              onClick={() =>
                navigateToQuestion(Math.max(0, currentQuestion - 1), "Prev Button")
              }
              disabled={currentQuestion === 0}
              className={`px-4 py-2 rounded-xl font-bold ${
                currentQuestion === 0
                  ? "bg-gray-300 opacity-50 cursor-not-allowed"
                  : "bg-[var(--blue-highlight)] text-white cursor-pointer hover:opacity-80"
              }`}
            >
              ← Prev
            </button>
            <span className="self-center opacity-60 text-sm">
              {currentQuestion + 1} / {data.length}
            </span>
            <button
              onClick={() =>
                navigateToQuestion(
                  Math.min(data.length - 1, currentQuestion + 1),
                  "Next Button",
                )
              }
              disabled={currentQuestion === data.length - 1}
              className={`px-4 py-2 rounded-xl font-bold ${
                currentQuestion === data.length - 1
                  ? "bg-gray-300 opacity-50 cursor-not-allowed"
                  : "bg-[var(--blue-highlight)] text-white cursor-pointer hover:opacity-80"
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}