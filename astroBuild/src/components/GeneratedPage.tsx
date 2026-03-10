
import { useState, useEffect } from 'react';

interface QuestionItem {
  // When the API returns an array per question:
  // [id, board, subject, topic, difficulty, level, uuid, component, questionImage, solutionImage, ...]
  // OR an object with named keys
  [key: number]: any;
  length?: number;
}

interface Props {
  data: QuestionItem[];
  onBack: () => void;
}

const difficultyToColorMap: Record<number, string> = {
  1: 'var(--diff-one)',
  2: 'var(--diff-two)',
  3: 'var(--diff-three)',
  4: 'var(--diff-four)',
  5: 'var(--diff-five)',
};

function getField(item: any, arrayIdx: number, ...keys: string[]): any {
  if (Array.isArray(item)) return item[arrayIdx];
  for (const k of keys) {
    if (item[k] !== undefined) return item[k];
  }
  return undefined;
}

export default function GeneratedPage({ data, onBack }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);
    setPaginationData(data.slice(startIndex, endIndex));
  }, [currentPage, data]);

  const q = data[currentQuestion];
  const topic = getField(q, 3, 'topic');
  const difficulty = getField(q, 4, 'difficulty');
  const component = getField(q, 7, 'component');
  const questionImage = getField(q, 8, 'questionImage', 'question_image');
  const solutionImage = getField(q, 9, 'solutionImage', 'solution_image');

  const buttonBgClass = showSolution ? 'bg-[var(--pink-highlight)]' : 'bg-[var(--blue-highlight)]';

  return (
    <div
      className="py-2 flex gap-3 bg-[var(--baby-powder)] rounded-lg shadow-lg max-md:flex-col"
      style={{
        position: 'fixed',
        top: '88px',
        bottom: '24px',
        left: '24px',
        right: '24px',
        overflowY: 'auto',
        padding: '16px',
        zIndex: 1000,
      }}
    >
      {/* Sidebar */}
      <div className="bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] md:w-1/4 max-md:h-1/4 flex flex-col overflow-hidden">
        {/* Sticky header */}
        <div className="p-4 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-surface)] z-10">
          <div className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--blue-highlight)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[var(--blue-highlight)]">{data.length}</span> Questions
          </div>
          <button
            onClick={onBack}
            className="mt-2 w-full px-3 py-1.5 rounded-lg bg-[var(--blue-highlight)] text-white text-sm font-bold hover:opacity-80 transition cursor-pointer"
          >
            ← Generate Again
          </button>
        </div>

        {/* Question list */}
        <div className="overflow-y-auto flex-1">
          <div className="p-4 space-y-3">
            {paginationData.map((item, index) => {
              const globalIndex = (currentPage - 1) * itemsPerPage + index;
              const itemTopic = getField(item, 3, 'topic') ?? 'Question';
              const itemDiff = getField(item, 4, 'difficulty') ?? 1;
              const itemComp = getField(item, 7, 'component') ?? '';
              const itemImg = getField(item, 8, 'questionImage', 'question_image');
              const diffColor = difficultyToColorMap[itemDiff] ?? 'var(--blue-highlight)';

              return (
                <div
                  key={globalIndex}
                  className={`h-20 bg-[var(--color-nav)] rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer shadow-lg border-r-4`}
                  style={{
                    borderColor: diffColor,
                    outline: currentQuestion === globalIndex ? '2px solid var(--blue-highlight)' : undefined,
                  }}
                  onClick={() => { setCurrentQuestion(globalIndex); setShowSolution(false); }}
                >
                  <div className="p-3 flex items-center gap-2 h-full">
                    {itemImg && (
                      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={`data:image/png;base64,${itemImg}`}
                          alt={`Q${globalIndex + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold truncate">{itemTopic}</span>
                      <span className="text-xs text-[var(--pink-highlight)]">Comp: {itemComp}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="border-t border-[var(--color-border)] p-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-2 rounded-lg text-sm ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed opacity-50' : 'bg-[var(--blue-highlight)] hover:opacity-80 text-white cursor-pointer'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </button>
            <span className="text-sm font-medium">
              <span className="text-[var(--blue-highlight)]">{currentPage}</span> / <span className="text-[var(--pink-highlight)]">{totalPages}</span>
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-2 rounded-lg text-sm ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed opacity-50' : 'bg-[var(--blue-highlight)] hover:opacity-80 text-white cursor-pointer'}`}
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main viewer */}
      <div className="flex-1 bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] p-3 overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className="shadow-lg bg-[var(--baby-powder)] flex justify-between p-3 text-base max-md:text-sm rounded-lg mb-4 flex-shrink-0">
          <div className="flex gap-4 flex-wrap items-center">
            <span>Topic: <strong>{topic}</strong></span>
            <span>Difficulty: <strong style={{ color: difficultyToColorMap[difficulty] ?? 'inherit' }}>{difficulty}</strong></span>
            <span>Component: <strong>{component}</strong></span>
          </div>
          <button
            className={`shadow-lg font-semibold text-white p-2 rounded-lg cursor-pointer transition ${buttonBgClass}`}
            onClick={() => setShowSolution((s) => !s)}
          >
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </button>
        </div>

        {/* Image display */}
        <div className="overflow-y-auto flex-1 px-2">
          {!showSolution ? (
            questionImage ? (
              <img
                src={`data:image/png;base64,${questionImage}`}
                alt="Question"
                className="w-full object-contain"
              />
            ) : (
              <p className="text-center opacity-50 mt-8">No question image available</p>
            )
          ) : (
            solutionImage ? (
              <img
                src={`data:image/png;base64,${solutionImage}`}
                alt="Solution"
                className="w-full object-contain"
              />
            ) : (
              <p className="text-center opacity-50 mt-8">No solution image available</p>
            )
          )}
        </div>

        {/* Navigation arrows */}
        <div className="flex justify-between mt-3 flex-shrink-0">
          <button
            onClick={() => { setCurrentQuestion((i) => Math.max(0, i - 1)); setShowSolution(false); }}
            disabled={currentQuestion === 0}
            className={`px-4 py-2 rounded-xl font-bold ${currentQuestion === 0 ? 'bg-gray-300 opacity-50 cursor-not-allowed' : 'bg-[var(--blue-highlight)] text-white cursor-pointer hover:opacity-80'}`}
          >
            ← Prev
          </button>
          <span className="self-center opacity-60 text-sm">{currentQuestion + 1} / {data.length}</span>
          <button
            onClick={() => { setCurrentQuestion((i) => Math.min(data.length - 1, i + 1)); setShowSolution(false); }}
            disabled={currentQuestion === data.length - 1}
            className={`px-4 py-2 rounded-xl font-bold ${currentQuestion === data.length - 1 ? 'bg-gray-300 opacity-50 cursor-not-allowed' : 'bg-[var(--blue-highlight)] text-white cursor-pointer hover:opacity-80'}`}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

