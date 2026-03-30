import { useState, useEffect, useRef, useCallback } from "react";

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
  } catch {}
}

const difficultyToColorMap: Record<number, string> = {
  1: "#22c55e",
  2: "#84cc16",
  3: "#eab308",
  4: "#f97316",
  5: "#ef4444",
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

function renderInlineMathInNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? "";
    if (!text.includes("$")) return;
    const parts = text.split(/(\$[^\n$]+?\$)/g);
    if (parts.length <= 1) return;
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
        const raw = part.slice(1, -1);
        const span = document.createElement("span");
        span.className = "math-inline";
        span.style.display = "inline";
        span.style.whiteSpace = "nowrap";
        try {
          // @ts-ignore
          katex.render(raw, span, { displayMode: false, throwOnError: false });
        } catch {
          span.textContent = part;
        }
        frag.appendChild(span);
      } else {
        frag.appendChild(document.createTextNode(part));
      }
    }
    node.parentNode?.replaceChild(frag, node);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      renderInlineMathInNode(child);
    }
  }
}

const RichContent = ({ content }: { content?: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!content || !ref.current) return;

    const container = ref.current;
    container.innerHTML = "";

    const parts = content.split(/((?:\$\$[\s\S]*?\$\$))/g);
    const fragment = document.createDocumentFragment();

    for (const part of parts) {
      if (!part) continue;

      const isBlockMath =
        part.startsWith("$$") && part.endsWith("$$") && part.length > 4;

      if (isBlockMath) {
        const raw = part.slice(2, -2);
        const mathNode = document.createElement("div");
        mathNode.className = "math-block";
        try {
          // @ts-ignore
          katex.render(raw, mathNode, {
            displayMode: true,
            throwOnError: false,
          });
        } catch {
          mathNode.textContent = part;
        }
        fragment.appendChild(mathNode);
      } else {
        const mdDiv = document.createElement("div");
        mdDiv.className = "md-content";
        try {
          // @ts-ignore
          mdDiv.innerHTML = marked.parse(part, { breaks: true });
        } catch {
          mdDiv.innerHTML = part.replace(/\n/g, "<br/>");
        }
        renderInlineMathInNode(mdDiv);
        fragment.appendChild(mdDiv);
      }
    }

    container.appendChild(fragment);
  }, [content]);

  return (
    <div
      ref={ref}
      className="rich-content"
      style={{ fontSize: "1.1rem", lineHeight: 1.8 }}
    />
  );
};

export default function GeneratedPage({ data, onBack }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [pageTransition, setPageTransition] = useState(false);
  const [contentFade, setContentFade] = useState(false);

  const sessionStartTime = useRef(Date.now());
  const questionStartTime = useRef(Date.now());
  const solutionViewedCount = useRef(0);
  const questionsViewed = useRef<Set<number>>(new Set([0]));

  const itemsPerPage = 8;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginationData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
  }, [data.length]);

  const navigateToQuestion = useCallback(
    (
      index: number,
      source: "Sidebar Click" | "Prev Button" | "Next Button",
    ) => {
      const timeSpent = Math.round(
        (Date.now() - questionStartTime.current) / 1000,
      );

      const q = data[currentQuestion];
      const topic = getField(q, 3, "topic");
      const difficulty = getField(q, 4, "difficulty");
      const component = getField(q, 7, "component");

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
      setContentFade(true);

      setTimeout(() => {
        setCurrentQuestion(index);
        setShowSolution(false);
        setContentFade(false);
      }, 150);
    },
    [currentQuestion, showSolution, data],
  );

  const toggleSolution = () => {
    const next = !showSolution;
    if (next) {
      solutionViewedCount.current += 1;
      const q = data[currentQuestion];
      const topic = getField(q, 3, "topic");
      const difficulty = getField(q, 4, "difficulty");
      const component = getField(q, 7, "component");

      trackEvent("Solution Revealed", {
        "Question Number": currentQuestion + 1,
        Topic: topic ?? "Unknown",
        Difficulty: difficulty ?? 0,
        "Difficulty Label": difficultyLabels[difficulty] ?? "Unknown",
        Component: component ?? "Unknown",
        "Total Reveals This Session": solutionViewedCount.current,
      });
    }
    setShowSolution(next);
  };

  const handlePageChange = (newPage: number) => {
    setPageTransition(true);
    trackEvent("Sidebar Page Changed", {
      "From Page": currentPage,
      "To Page": newPage,
      "Total Pages": totalPages,
    });

    setTimeout(() => {
      setCurrentPage(newPage);
      setPageTransition(false);
    }, 200);
  };

  const handleBack = () => {
    const sessionDuration = Math.round(
      (Date.now() - sessionStartTime.current) / 1000,
    );
    const q = data[currentQuestion];
    const topic = getField(q, 3, "topic");

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

  const q = data[currentQuestion];
  const topic = getField(q, 3, "topic") ?? "Unknown";
  const difficulty = getField(q, 4, "difficulty") ?? 1;
  const component = getField(q, 7, "component") ?? "N/A";
  const questionContent = getField(q, 8, "questionConent", "question_image");
  const solutionContent = getField(q, 9, "solutionContent", "solution_image");

  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          .sidebar-inner {
            height: calc(100vh - 4rem) !important;
          }
        }
      `}</style>

      <div
        className="flex flex-col lg:flex-row"
        style={{
          minHeight: "calc(100vh - 4rem)",
          backgroundColor: "var(--wheat)",
        }}
      >
        <aside
          className="w-full lg:w-80 xl:w-96 flex-shrink-0 border-b lg:border-b-0 lg:border-r"
          style={{
            borderColor: "var(--border-subtle)",
            backgroundColor: "var(--sidebar-bg)",
          }}
        >
          <div
            className="sidebar-inner sticky top-16 flex flex-col"
            style={{ height: "50dvh" }}
          >
            <div
              className="p-5 flex flex-col gap-6 border-b flex-shrink-0"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div
                className="flex items-center gap-3 pb-2 border-b"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  <i
                    className="ph-fill ph-file-text"
                    style={{
                      fontSize: "1.1rem",
                      color: "white",
                    }}
                  />
                </div>
                <div>
                  <h1
                    className="text-lg font-bold tracking-tight"
                    style={{ color: "var(--font-color)" }}
                  >
                    Practice Set
                  </h1>
                  <p className="text-xs opacity-50 tracking-wider uppercase">
                    {data.length} Questions
                  </p>
                </div>
              </div>

              <button
                onClick={handleBack}
                className="text-[var(--ghost-white)] w-full py-3 px-4 rounded-xl text-md font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] outline outline-[var(--border-subtle)]"
                style={{
                  backgroundColor: "var(--accent)",
                }}
              >
                <i
                  className="ph-fill ph-arrow-counterclockwise"
                  style={{ fontSize: "1rem" }}
                />
                <i className="ph-fill ph-arrow-left"></i> Generate Again
              </button>

              {totalPages > 1 && (
                <div className="rounded-xl">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold opacity-70 uppercase tracking-wider">
                      Page
                    </span>
                    <span className="font-mono text-[var(--accent)]">
                      {currentPage} / {totalPages}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150
                        disabled:opacity-40 disabled:cursor-not-allowed
                        active:scale-95 active:translate-y-[1px]
                        hover:scale-[1.03] hover:-translate-y-[1px]
                        relative overflow-hidden"
                      style={{
                        backgroundColor:
                          currentPage === 1 ? "transparent" : "var(--accent)",
                        color:
                          currentPage === 1 ? "var(--font-color)" : "white",
                        border: `1px solid ${currentPage === 1 ? "var(--border-subtle)" : "var(--accent)"}`,
                        boxShadow:
                          currentPage === 1
                            ? "none"
                            : "0 4px 14px rgba(0,0,0,0.15)",
                      }}
                    >
                      <span className="relative z-10">
                        <i className="ph-fill ph-arrow-left"></i> Prev
                      </span>
                      <span className="absolute inset-0 opacity-0 hover:opacity-10 transition bg-white"></span>
                    </button>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150
                        disabled:opacity-40 disabled:cursor-not-allowed
                        active:scale-95 active:translate-y-[1px]
                        hover:scale-[1.03] hover:-translate-y-[1px]
                        relative overflow-hidden"
                      style={{
                        backgroundColor:
                          currentPage === totalPages
                            ? "transparent"
                            : "var(--accent)",
                        color:
                          currentPage === totalPages
                            ? "var(--font-color)"
                            : "white",
                        border: `1px solid ${currentPage === totalPages ? "var(--border-subtle)" : "var(--accent)"}`,
                        boxShadow:
                          currentPage === totalPages
                            ? "none"
                            : "0 4px 14px rgba(0,0,0,0.15)",
                      }}
                    >
                      <span className="relative z-10">
                        Next <i className="ph-fill ph-arrow-right"></i>
                      </span>
                      <span className="absolute inset-0 opacity-0 hover:opacity-10 transition bg-white"></span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {paginationData.map((item, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index;
                const itemTopic = getField(item, 3, "topic") ?? "Question";
                const itemDiff = getField(item, 4, "difficulty") ?? 1;
                const itemComp = getField(item, 7, "component") ?? "";
                const isActive = currentQuestion === globalIndex;
                const diffColor = difficultyToColorMap[itemDiff];

                return (
                  <div
                    key={globalIndex}
                    onClick={() =>
                      navigateToQuestion(globalIndex, "Sidebar Click")
                    }
                    className="group border-b border-[var(--border-subtle)] px-5 py-4 flex items-center gap-3 cursor-pointer transition-all duration-200
                      hover:bg-[var(--baby-powder)] hover:translate-x-[2px]"
                    style={{
                      backgroundColor: isActive
                        ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                        : "transparent",
                    }}
                  >
                    <div
                      className="font-serif w-9 h-9 flex items-center justify-center rounded-md text-lg font-semibold flex-shrink-0 transition-all duration-200"
                      style={{
                        backgroundColor: isActive
                          ? "var(--accent)"
                          : "color-mix(in srgb, var(--accent) 20%, transparent)",
                        color: isActive ? "white" : "var(--accent)",
                      }}
                    >
                      {globalIndex + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className="truncate leading-tight text-lg font-bold"
                        style={{
                          color: isActive
                            ? "var(--accent)"
                            : "var(--font-color)",
                        }}
                      >
                        {itemTopic}
                      </div>

                      {itemComp && (
                        <div className="text-[var(--blue-highlight)] font-bold text-[0.7rem] opacity-60 truncate mt-0.5">
                          {itemComp}
                        </div>
                      )}
                    </div>

                    <div
                      className="font-serif text-md px-2 py-1 rounded-md font-bold flex-shrink-0"
                      style={{
                        backgroundColor: diffColor,
                        color: "var(--ghost-white)",
                      }}
                    >
                      {itemDiff}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-h-0">
          <div
            className="flex flex-col"
            style={{ height: "calc(100vh - 4rem)" }}
          >
            <div className="bg-[var(--sidebar-bg)] p-6 border-b border-[var(--border-subtle)] flex justify-between items-center flex-wrap gap-6 flex-shrink-0">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <div className="text-xs uppercase opacity-60">Topic</div>
                  <div className="font-bold text-lg">{topic}</div>
                </div>

                <div>
                  <div className="text-xs uppercase opacity-60">Difficulty</div>
                  <div
                    className="font-bold"
                    style={{ color: difficultyToColorMap[difficulty] }}
                  >
                    {difficultyLabels[difficulty]}
                  </div>
                </div>

                {component !== "N/A" && (
                  <div>
                    <div className="text-xs uppercase opacity-60">
                      Component
                    </div>
                    <div className="font-bold">{component}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    navigateToQuestion(currentQuestion - 1, "Prev Button")
                  }
                  disabled={currentQuestion === 0}
                  className="bg-[var(--accent)] disabled:opacity-40 text-[var(--ghost-white)] py-3 px-4 rounded-xl text-md font-bold transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] outline outline-[var(--border-subtle)] active:scale-95 active:translate-y-[1px]"
                >
                  <i className="ph-fill ph-arrow-left"></i> Previous Question
                </button>

                <button
                  onClick={() =>
                    navigateToQuestion(currentQuestion + 1, "Next Button")
                  }
                  disabled={currentQuestion === data.length - 1}
                  className="bg-[var(--accent)] disabled:opacity-40 text-[var(--ghost-white)] py-3 px-4 rounded-xl text-md font-bold transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] outline outline-[var(--border-subtle)] active:scale-95 active:translate-y-[1px]"
                >
                  Next Question <i className="ph-fill ph-arrow-right"></i>
                </button>
              </div>
            </div>

            <div className="flex-1 p-8 bg-[var(--sidebar-bg)] overflow-y-auto min-h-0">
              {!showSolution ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      <i className="ph-fill ph-question text-[var(--accent)]" />
                      Question
                    </h3>

                    <button
                      onClick={toggleSolution}
                      className="px-5 py-2 rounded-lg font-bold transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] outline outline-[var(--border-subtle)] active:scale-95 active:translate-y-[1px]"
                      style={{
                        backgroundColor: "var(--accent)",
                        color: "white",
                      }}
                    >
                      <i className="ph-fill ph-eye"></i> Show Solution
                    </button>
                  </div>

                  <RichContent content={questionContent} />
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      <i className="ph-fill ph-lightbulb text-[var(--pink-highlight)]" />
                      Solution
                    </h3>

                    <button
                      onClick={toggleSolution}
                      className="px-5 py-2 rounded-lg font-bold transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] outline outline-[var(--border-subtle)] active:scale-95 active:translate-y-[1px]"
                      style={{
                        backgroundColor: "var(--pink-highlight)",
                        color: "white",
                      }}
                    >
                      <i className="ph-fill ph-eye-slash"></i> Hide Solution
                    </button>
                  </div>

                  <RichContent content={solutionContent} />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
