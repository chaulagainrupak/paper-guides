
import { useState, useEffect } from 'react';

interface Props {
  name: string;
  apiUrl: string;
  board: string;
  subject: string;  // real subject name (not slug)
  year: string;
  question: string; // the slug / details param
}

export default function PaperViewerFetcher({ name: initialName, apiUrl, board, subject, year, question }: Props) {
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [paperName, setPaperName]     = useState(initialName);
  const [questionData, setQd]         = useState<string | null>(null);
  const [markSchemeData, setMd]       = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    const url = new URL(`${apiUrl}/getData/${question}`);
    url.searchParams.set('board', board);
    url.searchParams.set('subject', subject);
    url.searchParams.set('year', year);

    fetch(url.toString())
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          let detail = `HTTP ${res.status}`;
          try { detail = JSON.parse(text).detail ?? detail; } catch {}
          throw new Error(detail);
        }
        return res.json();
      })
      .then((raw) => {
        const data = Array.isArray(raw) ? raw[0] : raw;
        const qd = data?.questionData   ?? data?.question_data   ?? null;
        const md = data?.markSchemeData ?? data?.mark_scheme_data ?? null;
        setQd(qd && qd !== 'null' && qd.length > 10 ? qd : null);
        setMd(md && md !== 'null' && md.length > 10 ? md : null);
        if (data?.questionName) setPaperName(data.questionName);
      })
      .catch((err) => setError(err.message ?? 'Failed to load paper.'))
      .finally(() => setLoading(false));
  }, [apiUrl, board, subject, year, question]);

  const hasQuestion   = !!questionData;
  const hasMarkScheme = !!markSchemeData;
  const questionUrl   = hasQuestion   ? `data:application/pdf;base64,${questionData}`   : null;
  const markSchemeUrl = hasMarkScheme ? `data:application/pdf;base64,${markSchemeData}` : null;
  const currentUrl    = showSolution ? markSchemeUrl : questionUrl;
  const isMobile      = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (loading) {
    return (
      <div className="mt-24 flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="w-12 h-12 border-4 border-[var(--blue-highlight)] border-t-transparent rounded-full animate-spin" />
        <p className="text-xl font-bold opacity-60">Loading paper…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-24 flex flex-col items-center justify-center gap-6 text-center px-6">
        <p className="text-5xl">😕</p>
        <h2 className="text-2xl font-bold text-[var(--pink-highlight)]">{error}</h2>
        <button
          onClick={() => history.back()}
          className="px-6 py-3 bg-[var(--blue-highlight)] text-white font-bold rounded-xl cursor-pointer hover:opacity-80 transition"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  if (!hasQuestion && !hasMarkScheme) {
    return (
      <div className="mt-24 flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-5xl mb-2">📄</p>
        <h2 className="text-2xl font-bold text-[var(--pink-highlight)]">Paper not found</h2>
        <p className="opacity-60 max-w-md">
          This paper doesn't appear to be in the database yet, or it may not have been approved.
        </p>
        <button
          onClick={() => history.back()}
          className="px-6 py-3 bg-[var(--blue-highlight)] text-white font-bold rounded-xl cursor-pointer hover:opacity-80 transition"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen px-4">
      <div className="flex flex-col h-full">

        {/* Title + back */}
        <div className="flex justify-between mb-4 items-center flex-shrink-0">
          <h1 className="text-2xl md:text-4xl font-bold truncate pr-4">{paperName}</h1>
          <button
            onClick={() => history.back()}
            className="cursor-pointer flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--blue-highlight)] text-white text-lg font-bold hover:opacity-80 transition-colors"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
        </div>

        {/* Controls */}
        {!isMobile ? (
          <div className="flex justify-between items-center mb-4 flex-shrink-0 flex-wrap gap-2">
            <div className="flex gap-2 flex-wrap">
              {currentUrl && (
                <>
                  <button
                    onClick={() => window.open(currentUrl, '_blank')}
                    className="bg-[var(--green-highlight)] text-white font-bold px-4 py-2 rounded-lg shadow hover:opacity-80 transition"
                  >
                    ⛶ Fullscreen
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = currentUrl;
                      link.download = showSolution ? `${paperName}-mark-scheme.pdf` : `${paperName}-question.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="bg-[var(--blue-highlight)] text-white font-bold px-4 py-2 rounded-lg shadow hover:opacity-80 transition"
                  >
                    ⬇️ Download PDF
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {hasQuestion && hasMarkScheme && (
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className={`${showSolution ? 'bg-[var(--pink-highlight)]' : 'bg-[var(--blue-highlight)]'} text-white font-bold px-4 py-2 rounded-lg shadow hover:opacity-80 transition`}
                >
                  {showSolution ? '📄 Show Question' : '✅ Show Mark Scheme'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mb-4 flex-shrink-0">
            {currentUrl && (
              <>
                <a href={currentUrl} download={showSolution ? `${paperName}-mark-scheme.pdf` : `${paperName}-question.pdf`}
                  className="bg-[var(--blue-highlight)] text-white font-bold px-6 py-3 rounded-lg shadow text-center hover:opacity-90 transition">
                  ⬇️ Download {showSolution ? 'Mark Scheme' : 'Question'} PDF
                </a>
                <a href={currentUrl} target="_blank" rel="noopener noreferrer"
                  className="bg-[var(--green-highlight)] text-white font-bold px-6 py-3 rounded-lg shadow text-center hover:opacity-90 transition">
                  Open PDF in browser
                </a>
              </>
            )}
            {hasQuestion && hasMarkScheme && (
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="bg-[var(--pink-highlight)] text-white font-bold px-6 py-3 rounded-lg shadow hover:opacity-90 transition"
              >
                {showSolution ? '📄 Show Question' : '✅ Show Mark Scheme'}
              </button>
            )}
          </div>
        )}

        {/* PDF viewer */}
        {currentUrl ? (
          <object
            key={currentUrl}
            data={currentUrl}
            type="application/pdf"
            className="w-full flex-1 border rounded shadow min-h-0"
            style={{ height: isMobile ? '500px' : undefined }}
          >
            <div className="text-center mt-8 opacity-60">
              <p className="mb-4">Your browser can't display PDFs inline.</p>
              <a href={currentUrl} download
                className="px-6 py-3 bg-[var(--blue-highlight)] text-white font-bold rounded-xl hover:opacity-80 transition">
                ⬇️ Download PDF instead
              </a>
            </div>
          </object>
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-50">
            <p>{showSolution ? 'No mark scheme available.' : 'No question paper available.'}</p>
          </div>
        )}

      </div>
    </div>
  );
}

