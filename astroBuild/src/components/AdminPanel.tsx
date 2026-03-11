import { useState, useEffect } from "react";
import { API_URL } from "../utils/config";
import { getRole, logOut } from "../utils/auth";
import MarkdownRenderer from "./MarkdownRenderer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Config {
  [board: string]: {
    levels: string[];
    subjects: { name: string; topics: string[] }[];
    components: string[];
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("authToken");
    if (!raw) return null;
    return JSON.parse(raw).accessToken ?? null;
  } catch {
    return null;
  }
}

function useConfig() {
  const [config, setConfig] = useState<Config>({});
  const [boards, setBoards] = useState<string[]>([]);

  useEffect(() => {
    fetch(API_URL + "/config", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        setConfig(json);
        setBoards(Object.keys(json));
      })
      .catch(console.error);
  }, []);

  return { config, boards };
}

const inputClass =
  "w-full p-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-nav)] text-[var(--font-color)] mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--blue-highlight)]";
const labelClass = "block mb-1 font-semibold text-sm";

// ─── Submit Past Paper ────────────────────────────────────────────────────────

function SubmitPaper({ config, boards }: { config: Config; boards: string[] }) {
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [paperType, setPaperType] = useState<"yearly" | "topical">("yearly");
  const [year, setYear] = useState("");
  const [customYear, setCustomYear] = useState("");
  const [level, setLevel] = useState("");
  const [component, setComponent] = useState("");
  const [session, setSession] = useState("may-june");
  const [topic, setTopic] = useState("");
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const subjectObjects = config[selectedBoard]?.subjects || [];
  const topics =
    subjectObjects.find((s) => s.name === selectedSubject)?.topics || [];
  const components = config[selectedBoard]?.components || [];
  const levels = config[selectedBoard]?.levels || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return alert("Not authenticated. Please log in.");
    setLoading(true);

    const formData = new FormData();
    formData.append("board", selectedBoard);
    formData.append("subject", selectedSubject);
    formData.append("paperType", paperType);
    formData.append("level", level);
    formData.append("component", component);
    formData.append("session", session);
    if (paperType === "yearly") {
      formData.append("year", year === "other" ? customYear : year);
    } else {
      formData.append("topic", topic);
    }
    if (paperFile) formData.append("questionFile", paperFile);
    if (solutionFile) formData.append("solutionFile", solutionFile);

    try {
      const res = await fetch(API_URL + "/admin/submitPaper", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        alert("Paper submitted!");
        window.location.reload();
      } else {
        const t = await res.text();
        alert("Error: " + t);
      }
    } catch {
      alert("Network error.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <label className={labelClass}>Board:</label>
      <select
        value={selectedBoard}
        onChange={(e) => {
          setSelectedBoard(e.target.value);
          setSelectedSubject("");
        }}
        className={inputClass}
        required
      >
        <option value="">Select board</option>
        {boards.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>

      <label className={labelClass}>Subject:</label>
      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        className={inputClass}
        required
        disabled={!selectedBoard}
      >
        <option value="">Select subject</option>
        {subjectObjects.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>

      <label className={labelClass}>Paper Type:</label>
      <select
        value={paperType}
        onChange={(e) => setPaperType(e.target.value as any)}
        className={inputClass}
      >
        <option value="yearly">Yearly</option>
        <option value="topical">Topical</option>
      </select>

      {paperType === "yearly" && (
        <>
          <label className={labelClass}>Year:</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={inputClass}
          >
            <option value="">Select year</option>
            {Array.from({ length: 15 }).map((_, i) => {
              const y = new Date().getFullYear() - i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
            <option value="other">Other</option>
          </select>
          {year === "other" && (
            <input
              type="number"
              placeholder="Enter year"
              value={customYear}
              onChange={(e) => setCustomYear(e.target.value)}
              className={inputClass}
            />
          )}
          <label className={labelClass}>Session:</label>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className={inputClass}
          >
            <option value="specimen">Specimen</option>
            <option value="feb-mar">Feb / Mar</option>
            <option value="may-june">May / June</option>
            <option value="oct-nov">Oct / Nov</option>
          </select>
        </>
      )}

      {paperType === "topical" && (
        <>
          <label className={labelClass}>Topic:</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={inputClass}
            disabled={!selectedSubject}
          >
            <option value="">Select topic</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </>
      )}

      <label className={labelClass}>Level:</label>
      <select
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        className={inputClass}
      >
        <option value="">Select level</option>
        {levels.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>

      <label className={labelClass}>Component:</label>
      <select
        value={component}
        onChange={(e) => setComponent(e.target.value)}
        className={inputClass}
      >
        <option value="">Select component</option>
        {components.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label className={labelClass}>Question PDF:</label>
      <input
        type="file"
        accept="application/pdf"
        required
        onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
        className={inputClass}
      />

      <label className={labelClass}>Solution PDF (optional):</label>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setSolutionFile(e.target.files?.[0] || null)}
        className={inputClass}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 rounded-lg bg-[var(--blue-highlight)] text-white font-bold hover:opacity-80 transition disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Submitting..." : "Submit Paper"}
      </button>
    </form>
  );
}

// ─── Submit Question ──────────────────────────────────────────────────────────

function SubmitQuestion({
  config,
  boards,
}: {
  config: Config;
  boards: string[];
}) {
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedComponent, setSelectedComponent] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [level, setLevel] = useState("");
  const [questionImages, setQuestionImages] = useState<FileList | null>(null);
  const [solutionImages, setSolutionImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const subjectObjects = config[selectedBoard]?.subjects || [];
  const topics =
    subjectObjects.find((s) => s.name === selectedSubject)?.topics || [];
  const components = config[selectedBoard]?.components || [];
  const levels = config[selectedBoard]?.levels || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return alert("Not authenticated.");
    setLoading(true);

    const formData = new FormData();
    formData.append("board", selectedBoard);
    formData.append("subject", selectedSubject);
    formData.append("topic", selectedTopic);
    formData.append("component", selectedComponent);
    formData.append("level", level);
    formData.append("difficulty", difficulty);
    if (questionImages)
      Array.from(questionImages).forEach((f) =>
        formData.append("questionImages", f),
      );
    if (solutionImages)
      Array.from(solutionImages).forEach((f) =>
        formData.append("solutionImages", f),
      );

    try {
      const res = await fetch(API_URL + "/admin/submitQuestion", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.status === 200) {
        alert("Question submitted!");
        window.location.reload();
      } else {
        const t = await res.text();
        alert("Error: " + t);
      }
    } catch {
      alert("Network error.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className={labelClass}>Board:</label>
      <select
        value={selectedBoard}
        onChange={(e) => {
          setSelectedBoard(e.target.value);
          setSelectedSubject("");
          setSelectedTopic("");
        }}
        className={inputClass}
        required
      >
        <option value="">Select board</option>
        {boards.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>

      <label className={labelClass}>Subject:</label>
      <select
        value={selectedSubject}
        onChange={(e) => {
          setSelectedSubject(e.target.value);
          setSelectedTopic("");
        }}
        className={inputClass}
        required
        disabled={!selectedBoard}
      >
        <option value="">Select subject</option>
        {subjectObjects.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>

      <label className={labelClass}>Topic:</label>
      <select
        value={selectedTopic}
        onChange={(e) => setSelectedTopic(e.target.value)}
        className={inputClass}
        required
        disabled={!selectedSubject}
      >
        <option value="">Select topic</option>
        {topics.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <label className={labelClass}>Component:</label>
      <select
        value={selectedComponent}
        onChange={(e) => setSelectedComponent(e.target.value)}
        className={inputClass}
        required
      >
        <option value="">Select component</option>
        {components.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label className={labelClass}>Level:</label>
      <select
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        className={inputClass}
        required
      >
        <option value="">Select level</option>
        {levels.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>

      <label className={labelClass}>Difficulty (1 = Easy, 5 = Hard):</label>
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className={inputClass}
        required
      >
        <option value="">Select difficulty</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <label className={labelClass}>Question Images:</label>
      <input
        type="file"
        accept="image/*"
        multiple
        required
        onChange={(e) => setQuestionImages(e.target.files)}
        className={inputClass}
      />

      <label className={labelClass}>Solution Images:</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setSolutionImages(e.target.files)}
        className={inputClass}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 rounded-lg bg-[var(--green-highlight)] text-white font-bold hover:opacity-80 transition disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Submitting..." : "Submit Question"}
      </button>
    </form>
  );
}

// ─── Note Submitter ────────────────────────────────────────────────────────────

function NoteSubmitter({
  config,
  boards,
}: {
  config: Config;
  boards: string[];
}) {
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [content, setContent] = useState("");
  const [previewMode, setPreviewMode] = useState<"edit" | "split" | "preview">(
    "split",
  );
  const [loading, setLoading] = useState(false);

  const subjectObjects = config[selectedBoard]?.subjects || [];
  const topics =
    subjectObjects.find((s) => s.name === selectedSubject)?.topics || [];
  const levels = config[selectedBoard]?.levels || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return alert("Not authenticated.");
    if (content.length < 1000)
      return alert(`Content too short (${content.length}/1000 chars minimum).`);
    setLoading(true);

    try {
      const res = await fetch(API_URL + "/admin/postNote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          board: selectedBoard,
          level: selectedLevel,
          subject: selectedSubject,
          topic: selectedTopic,
          content,
        }),
      });
      if (res.ok) {
        alert("Note submitted!");
        setContent("");
      } else {
        const t = await res.text();
        alert("Error: " + t);
      }
    } catch {
      alert("Network error.");
    }
    setLoading(false);
  };

  const minMet = content.length >= 1000;

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <div className="grid grid-cols-2 gap-3 mb-2">
        <div>
          <label className={labelClass}>Board:</label>
          <select
            value={selectedBoard}
            onChange={(e) => {
              setSelectedBoard(e.target.value);
              setSelectedSubject("");
              setSelectedTopic("");
            }}
            className={inputClass}
            required
          >
            <option value="">Select board</option>
            {boards.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Level:</label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className={inputClass}
            required
            disabled={!selectedBoard}
          >
            <option value="">Select level</option>
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedTopic("");
            }}
            className={inputClass}
            required
            disabled={!selectedBoard}
          >
            <option value="">Select subject</option>
            {subjectObjects.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Topic:</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className={inputClass}
            required
            disabled={!selectedSubject}
          >
            <option value="">Select topic</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <label className={`${labelClass} mb-0`}>
          Note Content{" "}
          <span className="font-normal opacity-50">
            (custom markdown, min 1000 chars)
          </span>
        </label>
        <div className="flex gap-1 rounded-lg overflow-hidden border border-[var(--color-border)]">
          {(["edit", "split", "preview"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPreviewMode(mode)}
              className={`px-3 py-1 text-xs font-semibold capitalize transition-colors cursor-pointer ${previewMode === mode ? "bg-[var(--blue-highlight)] text-white" : "bg-[var(--color-nav)] hover:opacity-80"}`}
            >
              {mode === "edit"
                ? "✏️ Edit"
                : mode === "split"
                  ? "⚡ Split"
                  : "👁️ Preview"}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`flex gap-3 mb-2 ${previewMode === "split" ? "flex-row" : "flex-col"}`}
        style={{ minHeight: "340px" }}
      >
        {(previewMode === "edit" || previewMode === "split") && (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            placeholder={"# Topic Title\n\nWrite your note content here…"}
            className={`p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-nav)] text-[var(--font-color)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-highlight)] font-mono text-sm resize-none ${previewMode === "split" ? "flex-1" : "w-full"}`}
            required
          />
        )}
        {(previewMode === "preview" || previewMode === "split") && (
          <div
            className={`border border-[var(--color-border)] rounded-lg bg-[var(--baby-powder)] overflow-auto p-4 ${previewMode === "split" ? "flex-1" : "w-full min-h-[200px]"}`}
          >
            {content.trim() ? (
              <MarkdownRenderer content={content} />
            ) : (
              <p className="text-sm opacity-30 italic">
                Preview will appear here…
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <p
          className={`text-xs font-semibold ${minMet ? "text-[var(--green-highlight)]" : "text-[var(--pink-highlight)]"}`}
        >
          {content.length} / 1000 chars{" "}
          {minMet ? "✓" : `(${1000 - content.length} more needed)`}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !minMet}
        className="w-full py-2 px-4 rounded-lg bg-[var(--pink-highlight)] text-white font-bold hover:opacity-80 transition disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Submitting..." : "Submit Note"}
      </button>
    </form>
  );
}

// ─── Unapproved Papers List ───────────────────────────────────────────────────

function UnapprovedPapers() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(20);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(
          `${API_URL}/admin/getUnapproved?q=papers&count=${count}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        setPapers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, [count]);

  if (loading)
    return (
      <div className="text-center py-8 opacity-60">
        Loading unapproved papers...
      </div>
    );
  if (!papers.length)
    return (
      <div className="text-center py-8 opacity-60">
        No unapproved papers found ✓
      </div>
    );

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <label className="font-semibold text-sm">Show:</label>
        <select
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value))}
          className="p-1 border border-[var(--color-border)] rounded bg-[var(--color-nav)] text-[var(--font-color)]"
        >
          {[5, 10, 20].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
          <option value={-1}>Random</option>
        </select>
        <span className="text-sm opacity-60">{papers.length} papers</span>
      </div>
      <div className="space-y-2">
        {papers.map((paper: any) => {
          const id = paper.id ?? paper[0] ?? paper.uuid;
          const subject = paper.subject ?? paper[2] ?? "?";
          const year = paper.year ?? paper[3] ?? "?";
          const component = paper.component ?? paper[4] ?? "?";
          const board = paper.board ?? paper[5] ?? "?";
          const level = paper.level ?? paper[6] ?? "?";
          return (
            <a
              key={id}
              href={`/admin/paper/${id}`}
              className="block p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-nav)] hover:scale-[1.01] transition text-sm font-medium"
            >
              <span className="text-[var(--blue-highlight)]">{subject}</span> (
              {year}) — {component} [{board} | {level}]
              <span className="ml-2 text-xs opacity-40">→</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ─── Unapproved Questions List ────────────────────────────────────────────────

function UnapprovedQuestions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(20);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(
        `${API_URL}/admin/getUnapproved?q=questions&count=${count}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [count]);

  const handleApprove = async (uuid: string) => {
    const token = getToken();
    if (!token) return;
    setApprovingId(uuid);
    try {
      const res = await fetch(
        `${API_URL}/admin/approve?questionType=question&uuid=${uuid}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setQuestions((qs) => qs.filter((q) => (q.uuid ?? q[1]) !== uuid));
      } else {
        alert("Approval failed: " + (await res.text()));
      }
    } catch {
      alert("Network error.");
    }
    setApprovingId(null);
  };

  if (loading)
    return (
      <div className="text-center py-8 opacity-60">
        Loading unapproved questions...
      </div>
    );
  if (!questions.length)
    return (
      <div className="text-center py-8 opacity-60">
        No unapproved questions found ✓
      </div>
    );

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <label className="font-semibold text-sm">Show:</label>
        <select
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value))}
          className="p-1 border border-[var(--color-border)] rounded bg-[var(--color-nav)] text-[var(--font-color)]"
        >
          {[5, 10, 20].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
          <option value={-1}>Random</option>
        </select>
        <span className="text-sm opacity-60">{questions.length} questions</span>
      </div>
      <div className="space-y-2">
        {questions.map((q: any) => {
          const uuid = q.uuid ?? q[1];
          const subject = q.subject ?? q[2] ?? "?";
          const topic = q.topic ?? q[3] ?? "?";
          const board = q.board ?? q[5] ?? "?";
          const level = q.level ?? q[6] ?? "?";
          const component = q.component ?? q[7] ?? "?";
          const difficulty = q.difficulty ?? q[4] ?? "?";
          const submittedBy = q.submittedBy ?? q[16] ?? "Unknown";
          return (
            <div
              key={uuid}
              className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-nav)] text-sm font-medium gap-3"
            >
              <div className="flex-1 min-w-0">
                <span className="text-[var(--blue-highlight)] font-bold">
                  {subject}
                </span>
                {" — "}
                <span className="opacity-80">{topic}</span>
                <div className="opacity-50 text-xs mt-0.5">
                  [{board} | {level} | {component}] · Difficulty: {difficulty} ·
                  By: {submittedBy}
                </div>
              </div>
              <button
                onClick={() => handleApprove(uuid)}
                disabled={approvingId === uuid}
                className="flex-shrink-0 px-4 py-1.5 rounded-lg bg-[var(--green-highlight)] text-white font-bold text-xs hover:opacity-80 transition cursor-pointer disabled:opacity-50"
              >
                {approvingId === uuid ? "Approving…" : "✓ Approve"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Unapproved Unified View ──────────────────────────────────────────────────

function UnapprovedAll() {
  const [subTab, setSubTab] = useState<"papers" | "questions">("papers");

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSubTab("papers")}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition cursor-pointer ${subTab === "papers" ? "bg-[var(--blue-highlight)] text-white" : "bg-[var(--color-nav)] border border-[var(--color-border)] hover:opacity-80"}`}
        >
          📄 Past Papers
        </button>
        <button
          onClick={() => setSubTab("questions")}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition cursor-pointer ${subTab === "questions" ? "bg-[var(--blue-highlight)] text-white" : "bg-[var(--color-nav)] border border-[var(--color-border)] hover:opacity-80"}`}
        >
          🖼️ Questions
        </button>
      </div>

      {subTab === "papers" && (
        <>
          <h3 className="text-lg font-bold mb-3 opacity-70">
            Unapproved Past Papers
          </h3>
          <UnapprovedPapers />
        </>
      )}
      {subTab === "questions" && (
        <>
          <h3 className="text-lg font-bold mb-3 opacity-70">
            Unapproved Questions
          </h3>
          <UnapprovedQuestions />
        </>
      )}
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────

type Tab = "paper" | "question" | "note" | "unapproved";

export default function AdminPanel() {
  const [role, setRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("unapproved");
  const { config, boards } = useConfig();

  useEffect(() => {
    async function check() {
      const r = await getRole();
      if (!r || !["admin", "moderator"].includes(r.trim())) {
        logOut();
        window.location.href = "/";
        return;
      }
      console.log(`Logged in as: ${r.toUpperCase()}`);
      setRole(r);
      setChecking(false);
    }
    check();
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl opacity-60">Checking permissions...</div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "unapproved", label: "Approve", emoji: "🔍" },
    { id: "paper", label: "Submit Paper", emoji: "📄" },
    { id: "question", label: "Submit Question", emoji: "🖼️" },
    { id: "note", label: "Submit Note", emoji: "📝" },
  ];

  return (
    <div className="mt-16 min-h-screen px-4 py-6 max-w-5xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">
            Admin <span className="text-[var(--blue-highlight)]">Panel</span>
          </h1>
          <p className="text-sm opacity-60 mt-1">
            Logged in as{" "}
            <strong className="text-[var(--pink-highlight)]">{role}</strong>
          </p>
        </div>
        <a
          href="/"
          className="px-4 py-2 rounded-lg bg-[var(--color-nav)] border border-[var(--color-border)] text-sm font-bold hover:opacity-80 transition"
        >
          ← Home
        </a>
      </div>

      <div className="flex gap-2 mb-6 border-b border-[var(--color-border)] pb-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg font-bold text-sm transition cursor-pointer ${activeTab === tab.id ? "bg-[var(--blue-highlight)] text-white" : "bg-[var(--color-nav)] hover:opacity-80"}`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-[var(--baby-powder)] rounded-xl shadow-xl p-6">
        {activeTab === "unapproved" && (
          <>
            <h2 className="text-2xl font-bold mb-4">🔍 Approve Content</h2>
            <UnapprovedAll />
          </>
        )}
        {activeTab === "paper" && (
          <>
            <h2 className="text-2xl font-bold mb-4">📄 Submit Past Paper</h2>
            <SubmitPaper config={config} boards={boards} />
          </>
        )}
        {activeTab === "question" && (
          <>
            <h2 className="text-2xl font-bold mb-4">
              🖼️ Submit Question (Image-based)
            </h2>
            <SubmitQuestion config={config} boards={boards} />
          </>
        )}
        {activeTab === "note" && (
          <>
            <h2 className="text-2xl font-bold mb-4">📝 Submit Note</h2>
            <NoteSubmitter config={config} boards={boards} />
          </>
        )}
      </div>
    </div>
  );
}
