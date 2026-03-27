import { useState, useEffect, useRef, useMemo } from "react";
import GeneratedPage from "./GeneratedPage";
import { API_URL } from "../utils/config";

interface SubjectData {
  name: string;
  topics: string[];
}
interface BoardConfig {
  subjects: SubjectData[];
  components: string[];
  levels: string[];
}
interface Config {
  [board: string]: BoardConfig;
}

declare global {
  interface Window {
    umami?: {
      track: (
        eventName: string,
        data?: Record<string, string | number | boolean>,
      ) => void;
    };
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

function toggleItem<T>(value: T, arr: T[], set: (a: T[]) => void) {
  set(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
}

const DIFF_COLORS = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444"];
const DIFF_LABELS = ["Very Easy", "Easy", "Medium", "Hard", "Very Hard"];

function Dropdown({
  label,
  icon,
  options,
  value,
  onChange,
  placeholder,
  disabled,
  count,
}: {
  label: string;
  icon: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((o) =>
      o.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (opt: string) => {
    onChange(opt);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <i
            className={`ph-fill ${icon}`}
            style={{ fontSize: "0.85rem", color: "var(--accent)" }}
          />
          <span className="text-[11px] font-bold uppercase tracking-widest opacity-60">
            {label}
          </span>
        </div>
        {count !== undefined && (
          <span className="text-[10px] opacity-40">{count} available</span>
        )}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-left focus:outline-none hover:borderover:border-[var(--accent)] shadow:lg"
        style={{
          border: `1px solid ${open ? "var(--accent)" : "var(--border-subtle)"}`,
          backgroundColor: "var(--color-nav)",
          color: "var(--font-color)",
          opacity: disabled ? 0.38 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "border-color 0.18s, box-shadow 0.18s, background 0.15s",
          boxShadow: open
            ? "0 0 0 2.5px color-mix(in srgb, var(--accent) 18%, transparent)"
            : "none",
        }}
      >
        <span
          className="truncate"
          style={{ opacity: value ? 1 : 0.38, fontWeight: value ? 500 : 400 }}
        >
          {value || placeholder || `Select ${label}`}
        </span>
        <i
          className="ph-fill ph-caret-down flex-shrink-0 ml-2"
          style={{
            fontSize: "0.75rem",
            opacity: 0.5,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        />
      </button>

      {open && !disabled && (
        <div
          className="absolute z-50 mt-1 w-full rounded-xl overflow-hidden bg-[var(--sidebar-bg)]"
          style={{
            border: "1.5px solid var(--accent)",
            top: "100%",
            boxShadow:
              "0 8px 24px color-mix(in srgb, var(--accent) 12%, transparent)",
            animation: "dropIn 0.16s ease",
          }}
        >
          {options.length > 6 && (
            <div
              className="p-2 border-b"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="relative">
                <i
                  className="ph-fill ph-magnifying-glass"
                  style={{
                    position: "absolute",
                    left: "0.6rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "0.75rem",
                    opacity: 0.4,
                    color: "var(--font-color)",
                  }}
                />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full rounded-lg text-xs border focus:outline-none focus:ring-1"
                  style={{
                    paddingLeft: "1.75rem",
                    paddingRight: "0.75rem",
                    paddingTop: "0.375rem",
                    paddingBottom: "0.375rem",
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--border-subtle)",
                    color: "var(--font-color)",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto" style={{ maxHeight: "13rem" }}>
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-xs opacity-40 italic">No results</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => select(opt)}
                  className="w-full text-left px-3.5 py-2.5 text-sm flex items-center gap-2 transition-colors hover:bg-[var(--color-surface)]"
                  style={{
                    backgroundColor:
                      value === opt
                        ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                        : "transparent",
                    color:
                      value === opt ? "var(--accent)" : "var(--font-color)",
                    fontWeight: value === opt ? 600 : 400,
                  }}
                >
                  {value === opt ? (
                    <i
                      className="ph-fill ph-check-circle flex-shrink-0"
                      style={{ fontSize: "0.85rem", color: "var(--accent)" }}
                    />
                  ) : (
                    <span style={{ width: "0.85rem", flexShrink: 0 }} />
                  )}
                  <span className="truncate">{opt}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MultiSelect({
  label,
  icon,
  options,
  selected,
  setSelected,
  placeholder,
  disabled,
  required,
  totalCount,
}: {
  label: string;
  icon: string;
  options: string[];
  selected: string[];
  setSelected: (a: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  totalCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((o) =>
      o.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isDisabled = disabled || options.length === 0;
  const hasError = required && !isDisabled && selected.length === 0;

  return (
    <div ref={ref} className="relative ">
      <div className="flex items-center justify-between mb-1.5 ">
        <div className="flex items-center gap-1.5 ">
          <i
            className={`ph-fill ${icon}`}
            style={{
              fontSize: "0.85rem",
              color: hasError ? "#ef4444" : "var(--accent)",
            }}
          />
          <span
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ opacity: 0.6, color: hasError ? "#ef4444" : "inherit" }}
          >
            {label}
            {required && <span style={{ color: "#ef4444" }}> *</span>}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => setSelected([])}
              className="text-[10px] font-semibold transition-opacity hover:opacity-100"
              style={{
                color: "#ef4444",
                opacity: 0.6,
                border: "none",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
          {totalCount !== undefined && (
            <span className="text-[10px] opacity-40">
              {selected.length > 0 ? `${selected.length}/` : ""}
              {totalCount} topics
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={isDisabled}
        onClick={() => !isDisabled && setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-left focus:outline-none"
        style={{
          border: `1px solid ${
            hasError
              ? "#ef4444"
              : open
                ? "var(--accent)"
                : "var(--border-subtle)"
          }`,
          backgroundColor: "var(--color-nav)",
          opacity: isDisabled ? 0.38 : 1,
          cursor: isDisabled ? "not-allowed" : "pointer",
          transition: "border-color 0.18s, box-shadow 0.18s, background 0.15s",
          boxShadow: open
            ? "0 0 0 2.5px color-mix(in srgb, var(--accent) 18%, transparent)"
            : hasError
              ? "0 0 0 2px rgba(239,68,68,0.15)"
              : "none",
        }}
      >
        <span className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
          {selected.length > 0 ? (
            <>
              <span
                className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {selected.length}
              </span>
              <span className="text-xs opacity-50 truncate">
                {selected.join(", ")}
              </span>
            </>
          ) : (
            <span style={{ opacity: 0.38 }}>
              {placeholder || `Select ${label}`}
            </span>
          )}
        </span>
        <i
          className="ph-fill ph-caret-down flex-shrink-0 ml-2"
          style={{
            fontSize: "0.75rem",
            opacity: 0.5,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        />
      </button>

      {hasError && !open && (
        <p
          className="text-[10px] mt-1"
          style={{ color: "#ef4444", opacity: 0.8 }}
        >
          Please select at least one topic
        </p>
      )}

      {open && !isDisabled && (
        <div
          className="absolute z-50 mt-1 w-full rounded-xl overflow-hidden bg-[var(--sidebar-bg)]"
          style={{
            border: "1.5px solid var(--accent)",
            top: "100%",
            boxShadow:
              "0 8px 24px color-mix(in srgb, var(--accent) 12%, transparent)",
            animation: "dropIn 0.16s ease",
          }}
        >
          {options.length > 6 && (
            <div
              className="p-2 border-b"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="relative">
                <i
                  className="ph-fill ph-magnifying-glass"
                  style={{
                    position: "absolute",
                    left: "0.6rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "0.75rem",
                    opacity: 0.4,
                    color: "var(--font-color)",
                  }}
                />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search topics…"
                  className="w-full rounded-lg text-xs border focus:outline-none"
                  style={{
                    paddingLeft: "1.75rem",
                    paddingRight: "0.75rem",
                    paddingTop: "0.375rem",
                    paddingBottom: "0.375rem",
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--border-subtle)",
                    color: "var(--font-color)",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>
          )}

          <div
            className="px-3 py-1.5 border-b flex items-center justify-between"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <button
              type="button"
              onClick={() => setSelected(options)}
              className="text-[11px] font-semibold transition-opacity hover:opacity-100"
              style={{
                color: "var(--accent)",
                opacity: 0.8,
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              Select all
            </button>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => setSelected([])}
                className="text-[11px] font-semibold transition-opacity hover:opacity-100"
                style={{
                  color: "#ef4444",
                  opacity: 0.7,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Clear all
              </button>
            )}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: "13rem" }}>
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-xs opacity-40 italic">No results</p>
            ) : (
              filtered.map((opt) => {
                const checked = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleItem(opt, selected, setSelected)}
                    className="w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-2.5 transition-colors"
                    style={{
                      backgroundColor: checked
                        ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                        : "transparent",
                    }}
                    
                  >
                    <span
                      className="flex-shrink-0 rounded"
                      style={{
                        width: "1rem",
                        height: "1rem",
                        border: checked
                          ? "none"
                          : "1.5px solid var(--border-subtle)",
                        backgroundColor: checked
                          ? "var(--accent)"
                          : "",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.12s",
                        flexShrink: 0,
                      }}
                    >
                      {checked && (
                        <i
                          className="ph-bold ph-check"
                          style={{  color: "white" }}
                        />
                      )}
                    </span>
                    <span
                      className="truncate"
                      style={{
                        color: checked ? "var(--accent)" : "var(--font-color)",
                        fontWeight: checked ? 600 : 400,
                      }}
                    >
                      {opt}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PillToggleGroup<T extends string | number>({
  label,
  icon,
  items,
  selected,
  setSelected,
  renderLabel,
  colorFn,
  hint,
}: {
  label: string;
  icon: string;
  items: T[];
  selected: T[];
  setSelected: (a: T[]) => void;
  renderLabel?: (item: T) => string;
  colorFn?: (item: T, checked: boolean) => React.CSSProperties;
  hint?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2 ">
        <i
          className={`ph-fill ${icon}`}
          style={{ fontSize: "0.85rem", color: "var(--accent)" }}
        />
        <span className="text-[11px] font-bold uppercase tracking-widest opacity-60">
          {label}
        </span>
        {hint && (
          <span className="text-[10px] opacity-35 normal-case">{hint}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const checked = selected.includes(item);
          const lbl = renderLabel ? renderLabel(item) : String(item);
          return (
            <button
              key={String(item)}
              type="button"
              onClick={() => toggleItem(item, selected, setSelected)}
              title={lbl}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 select-none transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] bg-[var(--color-surface)] outline outline-1 outline-[var(--border-subtle)]"
              style={{
                ...(colorFn
                  ? colorFn(item, checked)
                  : checked
                    ? {
                        backgroundColor: "var(--accent)",
                        borderColor: "var(--accent)",
                        color: "#fff",
                      }
                    : {
                        borderColor: "var(--border-subtle)",
                        color: "var(--font-color)",
                        backgroundColor: "transparent",
                      }),
              }}
            >
              {lbl}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function QuestionGeneratorForm() {
  const [generating, setGenerating] = useState(true);
  const [generatedResult, setGeneratedResult] = useState<any[]>([]);
  const [config, setConfig] = useState<Config>({});
  const [boards, setBoards] = useState<string[]>([]);
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>(
    [],
  );
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [availableComponents, setAvailableComponents] = useState<string[]>([]);
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    fetch(API_URL + "/config", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        setConfig(json);
        setBoards(Object.keys(json));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedBoard || !config[selectedBoard]) return;
    const bd = config[selectedBoard];
    setAvailableSubjects(bd.subjects.map((s) => s.name));
    setAvailableComponents(bd.components ?? []);
    setAvailableLevels(bd.levels ?? []);
    setSelectedSubject("");
    setSelectedTopics([]);
    setSelectedComponents([]);
    setSelectedLevels([]);
  }, [selectedBoard, config]);

  useEffect(() => {
    if (!selectedBoard || !selectedSubject || !config[selectedBoard]) {
      setAvailableTopics([]);
      return;
    }
    const sub = config[selectedBoard]?.subjects.find(
      (s) => s.name === selectedSubject,
    );
    setAvailableTopics(sub?.topics ?? []);
    setSelectedTopics([]);
  }, [selectedSubject, selectedBoard, config]);

  const handleBoardChange = (val: string) => {
    setSelectedBoard(val);
    setSelectedSubject("");
    setSelectedTopics([]);
    setSelectedComponents([]);
    setSelectedLevels([]);
    setSelectedDifficulties([]);
    setShowErrors(false);
  };

  const canGenerate =
    !!selectedBoard && !!selectedSubject && selectedTopics.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canGenerate) {
      setShowErrors(true);
      return;
    }

    setIsSubmitting(true);
    setShowErrors(false);

    const levelsToSend =
      selectedLevels.length > 0 ? selectedLevels : availableLevels;
    const componentsToSend =
      selectedComponents.length > 0 ? selectedComponents : availableComponents;
    const difficultiesToSend =
      selectedDifficulties.length > 0 ? selectedDifficulties : [1, 2, 3, 4, 5];

    trackEvent("Question Generation Attempted", {
      Board: selectedBoard,
      Subject: selectedSubject,
      Topics: selectedTopics.join(", "),
      "Topic Count": selectedTopics.length,
      "Component Count": componentsToSend.length,
      "Level Count": levelsToSend.length,
      "Difficulty Count": difficultiesToSend.length,
    });

    try {
      const res = await fetch(API_URL + "/question-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          board: selectedBoard,
          subject: selectedSubject,
          topics: selectedTopics,
          components: componentsToSend,
          levels: levelsToSend,
          difficulties: difficultiesToSend,
        }),
      });

      if (res.status === 200) {
        const result = await res.json();
        const questions = Array.isArray(result) ? result : [];
        trackEvent("Question Generation Succeeded", {
          Board: selectedBoard,
          Subject: selectedSubject,
          "Questions Returned": questions.length,
        });
        setGeneratedResult(questions);
        setGenerating(false);
      } else if (res.status === 404) {
        trackEvent("Question Generation No Results", {
          Board: selectedBoard,
          Subject: selectedSubject,
        });
        alert("No questions found for this selection — try different topics.");
      } else if (res.status === 429) {
        const r = await res.json().catch(() => ({}));
        trackEvent("Question Generation Rate Limited", {
          Board: selectedBoard,
          Subject: selectedSubject,
        });
        alert(`Rate limited. Please wait 5 minutes. ${r.detail ?? ""}`);
      } else {
        const errText = await res.text().catch(() => "");
        trackEvent("Question Generation Failed", {
          Board: selectedBoard,
          Subject: selectedSubject,
          "HTTP Status": res.status,
        });
        console.error("Generator error:", res.status, errText);
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      trackEvent("Question Generation Network Error", {
        Board: selectedBoard,
        Subject: selectedSubject,
      });
      console.error("Generator network error:", err);
      alert("Network error — please check your connection and try again.");
    }

    setIsSubmitting(false);
  };

  if (!generating && generatedResult.length > 0) {
    return (
      <GeneratedPage
        data={generatedResult}
        onBack={() => {
          setGenerating(true);
          setGeneratedResult([]);
        }}
      />
    );
  }

  const steps = [
    { label: "Board", done: !!selectedBoard },
    { label: "Subject", done: !!selectedSubject },
    { label: "Topics", done: selectedTopics.length > 0 },
    { label: "Generate", done: false },
  ];

  return (
    <>
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseIcon {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }
      `}</style>

      <div
        className="flex flex-col lg:flex-row"
        style={{ minHeight: "calc(100vh - 4rem)" }}
      >
        <aside
          className="w-full lg:w-80 xl:w-96 flex-shrink-0 border-b lg:border-b-0 lg:border-r"
          style={{
            borderColor: "var(--border-subtle)",
            backgroundColor: "var(--sidebar-bg)",
          }}
        >
          <div
            className="sticky top-16 flex flex-col gap-5 p-6 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 4rem)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <i
                  className="ph-fill ph-lightning"
                  style={{ fontSize: "1.1rem", color: "white" }}
                />
              </div>
              <div>
                <h1
                  className="text-base font-extrabold tracking-tight text-xl"
                  style={{
                    color: "var(--font-color)",
                  }}
                >
                  Question Generator
                </h1>
                <p
                  className="text-[11px] leading-tight"
                  style={{ opacity: 0.45 }}
                >
                  Build a custom practice set
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {steps.map((step) => (
                <span
                  key={step.label}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={
                    step.done
                      ? { backgroundColor: "var(--accent)", color: "#fff" }
                      : {
                          backgroundColor: "var(--color-nav)",
                          color: "var(--font-color)",
                          opacity: 0.45,
                          border: "1px solid var(--border-subtle)",
                        }
                  }
                >
                  <i
                    className={`ph-fill ${step.done ? "ph-check-circle" : "ph-circle"}`}
                    style={{ fontSize: "0.65rem" }}
                  />
                  {step.label}
                </span>
              ))}
            </div>

            <hr style={{ borderColor: "var(--border-subtle)" }} />

            <Dropdown
              label="Board"
              icon="ph-books"
              options={boards}
              value={selectedBoard}
              onChange={handleBoardChange}
              placeholder="Select a board"
              count={boards.length}
            />

            <Dropdown
              label="Subject"
              icon="ph-book-open"
              options={availableSubjects}
              value={selectedSubject}
              onChange={(v) => setSelectedSubject(v)}
              placeholder={
                selectedBoard ? "Select a subject" : "Select a board first"
              }
              disabled={!selectedBoard}
              count={availableSubjects.length || undefined}
            />

            <MultiSelect
              label="Topics"
              icon="ph-target"
              options={availableTopics}
              selected={selectedTopics}
              setSelected={setSelectedTopics}
              placeholder={
                selectedSubject ? "Select topics" : "Select a subject first"
              }
              disabled={!selectedSubject}
              required
              totalCount={availableTopics.length || undefined}
            />

            {availableComponents.length > 0 && (
              <MultiSelect
                label="Components"
                icon="ph-squares-four"
                options={availableComponents}
                selected={selectedComponents}
                setSelected={setSelectedComponents}
                placeholder="All components (optional)"
                totalCount={availableComponents.length}
              />
            )}

            <hr style={{ borderColor: "var(--border-subtle)" }} />

            <PillToggleGroup
              label="Level"
              icon="ph-chart-bar"
              items={availableLevels}
              selected={selectedLevels}
              setSelected={setSelectedLevels}
              hint="— empty = all"
            />

            <PillToggleGroup
              label="Difficulty"
              icon="ph-lightning"
              items={[1, 2, 3, 4, 5] as number[]}
              selected={selectedDifficulties}
              setSelected={setSelectedDifficulties}
              renderLabel={(n) => DIFF_LABELS[n - 1]}
              colorFn={(n, checked) =>
                checked
                  ? {
                      backgroundColor: DIFF_COLORS[n - 1],
                      borderColor: DIFF_COLORS[n - 1],
                      color: "#fff",
                    }
                  : {
                      borderColor: "var(--border-subtle)",
                      color: "var(--font-color)",
                      backgroundColor: "transparent",
                    }
              }
              hint="— empty = all"
            />

            <hr style={{ borderColor: "var(--border-subtle)" }} />

            <button
              type="button"
              onClick={handleSubmit as any}
              disabled={isSubmitting}
              className={`
    w-full py-3 px-6 rounded-xl text-lg font-bold
    flex items-center justify-center gap-2
    transition-all duration-300 ease-out
    hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02]
    active:scale-[0.98]
    outline outline-1 outline-[var(--border-subtle)]
  `}
              style={{
                backgroundColor: "var(--accent)",
                color: "white",
                cursor: isSubmitting ? "wait" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
                letterSpacing: "0.01em",
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="h-4 w-4 rounded-full flex-shrink-0"
                    style={{
                      border: "2px solid rgba(255,255,255,0.35)",
                      borderTopColor: "#fff",
                      animation: "spin 0.7s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  Generating…
                </>
              ) : (
                <>
                  <i
                    className="ph-fill ph-rocket"
                    style={{ fontSize: "1rem" }}
                  />
                  Generate Questions
                </>
              )}
            </button>
            {showErrors && !canGenerate && (
              <p
                className="text-center text-[11px] -mt-3"
                style={{ color: "#ef4444", opacity: 0.8 }}
              >
                {!selectedBoard
                  ? "Please select a board"
                  : !selectedSubject
                    ? "Please select a subject"
                    : "Please select at least one topic"}
              </p>
            )}
          </div>
        </aside>

        <main
          className="flex-1 p-6 lg:p-10 bg-[var(--bg-pattern)]"
        >
          {!isSubmitting && (
            <div
              className="flex flex-col items-center justify-center text-center gap-4)]"
              style={{ minHeight: "55vh" }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center outline-[var(--border-sublte)]"
                style={{ backgroundColor: "var(--sidebar-bg)" }}
              >
                <i
                  className="ph-fill ph-lightning"
                  style={{ fontSize: "2.5rem", color: "var(--accent)" }}
                />
              </div>
              <div>
                <p
                  className="font-bold text-base"
                  style={{
                    color: "var(--font-color)",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  Configure your filters
                </p>
                <p className="text-sm mt-1 max-w-xs" style={{ opacity: 0.6 }}>
                  Select a board, subject, and at least one topic in the sidebar
                  to get started.
                </p>
              </div>
            </div>
          )}

          {isSubmitting && (
            <div
              className="flex flex-col items-center justify-center text-center gap-4"
              style={{ minHeight: "55vh" }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: "var(--accent)",
                  animation: "pulseIcon 1s ease-in-out infinite",
                }}
              >
                <i
                  className="ph-fill ph-rocket"
                  style={{ fontSize: "2rem", color: "white" }}
                />
              </div>
              <div>
                <p
                  className="font-bold text-lg"
                  style={{
                    color: "var(--font-color)",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  Generating questions…
                </p>
                <p className="text-sm mt-1" style={{ opacity: 0.5 }}>
                  Fetching from the database.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
