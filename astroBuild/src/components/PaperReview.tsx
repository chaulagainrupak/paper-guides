
import { useState, useEffect } from 'react';
import { API_URL } from '../utils/config';

interface Paper {
  id: number;
  uuid: string;
  subject: string;
  year: string;
  component: string;
  board: string;
  level: string;
  questionFile: string | null;
  solutionFile: string | null;
  approved: boolean;
  submittedBy: string | null;
  submittedFrom: string | null;
  submitDate: string | null;
  approvedBy: string | null;
  approvedOn: string | null;
}

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('authToken');
    if (!raw) return null;
    return JSON.parse(raw).accessToken ?? null;
  } catch { return null; }
}

export default function PaperReview({ paperUuid }: { paperUuid: string }) {
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState(false);
  const [showQuestion, setShowQuestion] = useState(true);

  useEffect(() => {
    async function fetchPaper() {
      const token = getToken();
      if (!token) { setError('Not authenticated'); setLoading(false); return; }

      try {
        const res = await fetch(`${API_URL}/admin/getPaper/${paperUuid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { setError(`HTTP ${res.status}`); setLoading(false); return; }
        const data = await res.json();

        // data is a tuple: [id, uuid, subject, year, component, board, level, questionFile, solutionFile, approved, submittedBy, submittedFrom, submitDate, approvedBy, approvedOn]
        setPaper({
          id: data[0],
          uuid: data[1],
          subject: data[2],
          year: data[3],
          component: data[4],
          board: data[5],
          level: data[6],
          questionFile: data[7],
          solutionFile: data[8],
          approved: Boolean(data[9]),
          submittedBy: data[10],
          submittedFrom: data[11],
          submitDate: data[12],
          approvedBy: data[13],
          approvedOn: data[14],
        });
      } catch (err) {
        setError('Failed to load paper.');
      }
      setLoading(false);
    }
    fetchPaper();
  }, [paperUuid]);

  const handleApprove = async () => {
    const token = getToken();
    if (!token || !paper) return;
    setApproving(true);
    try {
      const res = await fetch(`${API_URL}/admin/approve?questionType=paper&uuid=${paper.uuid}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert(`Approved: ${paper.uuid}`);
        setPaper(p => p ? { ...p, approved: true } : p);
      } else {
        alert('Approval failed: ' + await res.text());
      }
    } catch { alert('Network error.'); }
    setApproving(false);
  };

  if (loading) return (
    <div className="mt-24 flex items-center justify-center">
      <div className="text-xl opacity-60">Loading paper...</div>
    </div>
  );

  if (error || !paper) return (
    <div className="mt-24 flex flex-col items-center gap-4 text-center px-6">
      <p className="text-2xl font-bold text-[var(--pink-highlight)]">{error || 'Paper not found'}</p>
      <button onClick={() => history.back()} className="px-6 py-3 bg-[var(--blue-highlight)] text-white font-bold rounded-xl cursor-pointer hover:opacity-80">Go Back</button>
    </div>
  );

  const currentPdf = showQuestion ? paper.questionFile : paper.solutionFile;

  return (
    <div className="mt-16 px-4 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="text-[var(--blue-highlight)]">{paper.subject}</span>
          </h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm opacity-70">
            <span>Year: <strong>{paper.year}</strong></span>
            <span>Component: <strong>{paper.component}</strong></span>
            <span>Board: <strong>{paper.board}</strong></span>
            <span>Level: <strong>{paper.level}</strong></span>
          </div>
          <div className="flex flex-wrap gap-4 mt-1 text-sm opacity-60">
            <span>Submitted by: <strong>{paper.submittedBy || 'Unknown'}</strong></span>
            <span>Date: <strong>{paper.submitDate || 'Unknown'}</strong></span>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <button onClick={() => history.back()} className="px-4 py-2 rounded-lg bg-[var(--color-nav)] border border-[var(--color-border)] font-bold text-sm hover:opacity-80 cursor-pointer">
            ← Back to Admin
          </button>

          {!paper.approved ? (
            <button
              onClick={handleApprove}
              disabled={approving}
              className="px-6 py-2 rounded-lg bg-[var(--green-highlight)] text-white font-bold hover:opacity-80 transition cursor-pointer disabled:opacity-50"
            >
              {approving ? 'Approving...' : '✓ Approve Paper'}
            </button>
          ) : (
            <div className="px-4 py-2 rounded-lg bg-[var(--green-highlight)] text-white font-bold opacity-70">
              ✓ Already Approved
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="bg-[var(--baby-powder)] rounded-xl shadow-xl p-4">
        {/* Toggle buttons */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setShowQuestion(true)}
            className={`px-4 py-2 rounded-lg font-bold text-sm cursor-pointer transition ${showQuestion ? 'bg-[var(--blue-highlight)] text-white' : 'bg-[var(--color-nav)] hover:opacity-80'}`}
          >
            📄 Question Paper
          </button>
          {paper.solutionFile && (
            <button
              onClick={() => setShowQuestion(false)}
              className={`px-4 py-2 rounded-lg font-bold text-sm cursor-pointer transition ${!showQuestion ? 'bg-[var(--pink-highlight)] text-white' : 'bg-[var(--color-nav)] hover:opacity-80'}`}
            >
              ✅ Solution / Mark Scheme
            </button>
          )}
          {currentPdf && (
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${currentPdf}`;
                link.download = `${paper.subject}-${paper.year}-${paper.component}-${showQuestion ? 'question' : 'solution'}.pdf`;
                link.click();
              }}
              className="ml-auto px-4 py-2 rounded-lg bg-[var(--color-nav)] border border-[var(--color-border)] font-bold text-sm cursor-pointer hover:opacity-80"
            >
              ⬇️ Download
            </button>
          )}
        </div>

        {currentPdf ? (
          <object
            data={`data:application/pdf;base64,${currentPdf}`}
            type="application/pdf"
            width="100%"
            height="700px"
            className="rounded-lg border border-[var(--color-border)]"
          >
            <div className="text-center py-8 opacity-60">
              Your browser cannot display inline PDFs. Use the Download button above.
            </div>
          </object>
        ) : (
          <div className="text-center py-8 opacity-60">
            No {showQuestion ? 'question' : 'solution'} PDF available for this paper.
          </div>
        )}
      </div>
    </div>
  );
}

