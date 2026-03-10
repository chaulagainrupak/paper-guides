
import { useState, useEffect, useRef, useMemo } from 'react';
import GeneratedPage from './GeneratedPage';
import { API_URL } from '../utils/config';
import { isLoggedIn } from '../utils/auth';

interface SubjectData { name: string; topics: string[] }
interface BoardConfig { subjects: SubjectData[]; components: string[]; levels: string[] }
interface Config { [board: string]: BoardConfig }

function toggleItem<T>(value: T, arr: T[], set: (a: T[]) => void) {
  set(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
}

// ── Multi-select dropdown with search and auto-close ─────────────────────────
function MultiSelectDropdown({
  label,
  emoji,
  options,
  selected,
  setSelected,
  placeholder,
  searchable = false,
}: {
  label: string;
  emoji: string;
  options: string[];
  selected: string[];
  setSelected: (a: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (opt: string) => {
    toggleItem(opt, selected, setSelected);
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-bold mb-1 uppercase tracking-wide opacity-60">
        {emoji} {label}
      </label>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        className="w-full flex items-center justify-between p-3 text-base border-2 border-[var(--blue-highlight)] rounded-xl bg-[var(--baby-powder)] text-[var(--font-color)] text-left transition-all hover:border-opacity-80 focus:outline-none overflow-hidden"
      >
        <span className="flex-1 min-w-0 overflow-hidden">
          {selected.length > 0 ? (
            <span className="flex items-center gap-1.5 overflow-hidden">
              <span className="bg-[var(--blue-highlight)] text-white text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap flex-shrink-0">
                {selected.length} selected
              </span>
              <span className="text-sm opacity-60 truncate">{selected.join(', ')}</span>
            </span>
          ) : (
            <span className="opacity-40">{placeholder ?? `Select ${label}`}</span>
          )}
        </span>
        <span className={`ml-2 text-sm transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[var(--baby-powder)] border-2 border-[var(--blue-highlight)] rounded-xl shadow-2xl overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-[var(--color-border)]">
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-nav)] text-[var(--font-color)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-highlight)]"
              />
            </div>
          )}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm opacity-40">No results</div>
            ) : (
              filtered.map((opt) => {
                const checked = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggle(opt)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors hover:bg-[var(--color-nav)] ${checked ? 'font-bold text-[var(--blue-highlight)]' : ''}`}
                  >
                    <span className={`w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${checked ? 'bg-[var(--blue-highlight)] border-[var(--blue-highlight)]' : 'border-gray-400'}`}>
                      {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </span>
                    <span className="truncate">{opt}</span>
                  </button>
                );
              })
            )}
          </div>
          {selected.length > 0 && (
            <div className="border-t border-[var(--color-border)] p-2">
              <button
                type="button"
                onClick={() => setSelected([])}
                className="w-full text-xs text-[var(--pink-highlight)] font-semibold py-1 hover:opacity-80 transition"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Single-select dropdown with search ──────────────────────────────────────
function SingleSelectDropdown({
  label,
  emoji,
  options,
  value,
  onChange,
  placeholder,
  disabled,
  searchable = false,
}: {
  label: string;
  emoji: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (opt: string) => {
    onChange(opt);
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-bold mb-1 uppercase tracking-wide opacity-60">
        {emoji} {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) { setOpen(!open); setSearch(''); } }}
        className={`w-full flex items-center justify-between p-3 text-base border-2 rounded-xl text-left transition-all focus:outline-none ${disabled ? 'opacity-40 cursor-not-allowed border-gray-400 bg-[var(--baby-powder)]' : 'border-[var(--blue-highlight)] bg-[var(--baby-powder)] hover:border-opacity-80 cursor-pointer'}`}
      >
        <span className={`truncate ${value ? 'font-semibold text-[var(--font-color)]' : 'opacity-40'}`}>
          {value || (placeholder ?? `Select ${label}`)}
        </span>
        <span className={`ml-2 text-sm transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-[var(--baby-powder)] border-2 border-[var(--blue-highlight)] rounded-xl shadow-2xl overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-[var(--color-border)]">
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-nav)] text-[var(--font-color)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-highlight)]"
              />
            </div>
          )}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm opacity-40">No results</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => select(opt)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors hover:bg-[var(--color-nav)] ${value === opt ? 'font-bold text-[var(--blue-highlight)]' : ''}`}
                >
                  {value === opt && (
                    <span className="w-4 h-4 flex-shrink-0 rounded-full bg-[var(--blue-highlight)] flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                  )}
                  {value !== opt && <span className="w-4 h-4 flex-shrink-0" />}
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

// ── Level section (always visible, pill toggles) ─────────────────────────────
function LevelSection({
  levels,
  selected,
  setSelected,
}: {
  levels: string[];
  selected: string[];
  setSelected: (a: string[]) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-bold mb-2 uppercase tracking-wide opacity-60">
        📊 Level <span className="text-[10px] normal-case font-normal">(leave empty for all)</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {levels.length === 0 ? (
          <span className="text-sm opacity-40 italic">Select a board first</span>
        ) : (
          levels.map((lvl) => {
            const checked = selected.includes(lvl);
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => toggleItem(lvl, selected, setSelected)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200 hover:scale-105 select-none ${checked
                  ? 'bg-[var(--blue-highlight)] border-[var(--blue-highlight)] text-white shadow-md'
                  : 'border-[var(--color-border)] text-[var(--font-color)] hover:border-[var(--blue-highlight)]'
                }`}
              >
                {lvl}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Difficulty pills ─────────────────────────────────────────────────────────
const DIFF_COLORS = [
  'var(--diff-one)',
  'var(--diff-two)',
  'var(--diff-three)',
  'var(--diff-four)',
  'var(--diff-five)',
];
const DIFF_LABELS = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];

function DifficultySection({
  selected,
  setSelected,
}: {
  selected: number[];
  setSelected: (a: number[]) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-bold mb-2 uppercase tracking-wide opacity-60">
        ⚡ Difficulty <span className="text-[10px] normal-case font-normal">(leave empty for all)</span>
      </label>
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5].map((num) => {
          const checked = selected.includes(num);
          return (
            <button
              key={num}
              type="button"
              title={DIFF_LABELS[num - 1]}
              onClick={() => toggleItem(num, selected, setSelected)}
              className={`w-11 h-11 rounded-xl font-bold text-sm border-2 transition-all duration-200 hover:scale-110 select-none ${
                checked ? 'text-white border-transparent shadow-md' : 'border-[var(--color-border)] text-[var(--font-color)] hover:border-opacity-60'
              }`}
              style={checked ? { backgroundColor: DIFF_COLORS[num - 1] } : {}}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main form ────────────────────────────────────────────────────────────────
export default function QuestionGeneratorForm() {
  const [generating, setGenerating] = useState(true);
  const [generatedResult, setGeneratedResult] = useState<any[]>([]);
  const [config, setConfig] = useState<Config>({});
  const [boards, setBoards] = useState<string[]>([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [availableComponents, setAvailableComponents] = useState<string[]>([]);
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(API_URL + '/config', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => { setConfig(json); setBoards(Object.keys(json)); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedBoard || !config[selectedBoard]) return;
    const bd = config[selectedBoard];
    setAvailableSubjects(bd.subjects.map((s) => s.name));
    setAvailableComponents(bd.components ?? []);
    setAvailableLevels(bd.levels ?? []);
    setSelectedTopics([]);
    setSelectedComponents([]);
    setSelectedLevels([]);
  }, [selectedBoard, config]);

  useEffect(() => {
    if (!selectedBoard || !selectedSubject || !config[selectedBoard]) {
      setAvailableTopics([]);
      return;
    }
    const sub = config[selectedBoard]?.subjects.find((s) => s.name === selectedSubject);
    setAvailableTopics(sub?.topics ?? []);
    setSelectedTopics([]);
  }, [selectedSubject, selectedBoard, config]);

  const handleBoardChange = (val: string) => {
    setSelectedBoard(val);
    setSelectedSubject('');
    setSelectedTopics([]);
    setSelectedComponents([]);
    setSelectedLevels([]);
    setSelectedDifficulties([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      alert('Please login to generate questions. This restriction prevents abuse.');
      setIsSubmitting(false);
      return;
    }

    const rawToken = localStorage.getItem('authToken');
    if (!rawToken) {
      alert('Authentication token missing. Please login again.');
      setIsSubmitting(false);
      return;
    }

    let tokenObj: any;
    try { tokenObj = JSON.parse(rawToken); }
    catch { alert('Authentication token corrupted. Please login again.'); setIsSubmitting(false); return; }

    // If user didn't select specific levels/components/difficulties,
    // send ALL available ones so the backend query doesn't get an empty array
    // (an empty array causes the server to crash or return no results).
    const levelsToSend = selectedLevels.length > 0 ? selectedLevels : availableLevels;
    const componentsToSend = selectedComponents.length > 0 ? selectedComponents : availableComponents;
    const difficultiesToSend = selectedDifficulties.length > 0 ? selectedDifficulties : [1, 2, 3, 4, 5];

    try {
      const res = await fetch(API_URL + '/question-gen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenObj.accessToken}`,
        },
        body: JSON.stringify({
          board: selectedBoard,
          subject: selectedSubject,
          topics: selectedTopics,            // empty = all topics (server handles this)
          components: componentsToSend,
          levels: levelsToSend,
          difficulties: difficultiesToSend,
        }),
      });

      if (res.status === 200) {
        const result = await res.json();
        setGeneratedResult(Array.isArray(result) ? result : []);
        setGenerating(false);
      } else if (res.status === 404) {
        alert('No questions found for this selection — try a different subject or topic combination.');
      } else if (res.status === 429) {
        const r = await res.json().catch(() => ({}));
        alert(`Rate limited. Please wait 5 minutes before generating again. ${r.detail ?? ''}`);
      } else if (res.status === 401) {
        alert('Session expired. Please login again.');
      } else {
        const errText = await res.text().catch(() => '');
        console.error('Generator error:', res.status, errText);
        alert('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Generator network error:', err);
      alert('Network error — please check your connection and try again.');
    }
    setIsSubmitting(false);
  };

  if (!generating && generatedResult.length > 0) {
    return (
      <GeneratedPage
        data={generatedResult}
        onBack={() => { setGenerating(true); setGeneratedResult([]); }}
      />
    );
  }

  const steps = [
    { label: 'Board', done: !!selectedBoard },
    { label: 'Subject', done: !!selectedSubject },
    { label: 'Topics', done: selectedTopics.length > 0, optional: true },
    { label: 'Generate', done: false },
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto rounded-2xl bg-[var(--baby-powder)] shadow-2xl">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-[var(--font-color)]">
          Question <span className="text-[var(--blue-highlight)]">Generator</span>
        </h1>
        <p className="text-base opacity-60">Configure your parameters to generate custom practice questions</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${step.done ? 'bg-[var(--blue-highlight)] text-white' : 'bg-[var(--color-nav)] opacity-60'}`}>
              {step.done && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              {step.label}
              {step.optional && !step.done && <span className="opacity-60 text-[10px]">(opt)</span>}
            </div>
            {i < steps.length - 1 && <span className="opacity-30 text-xs">→</span>}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Board + Subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SingleSelectDropdown
            label="Board"
            emoji="📚"
            options={boards}
            value={selectedBoard}
            onChange={handleBoardChange}
            placeholder="Select a board"
            searchable={boards.length > 5}
          />

          <SingleSelectDropdown
            label="Subject"
            emoji="📖"
            options={availableSubjects}
            value={selectedSubject}
            onChange={(v) => setSelectedSubject(v)}
            placeholder="Select a subject"
            disabled={!selectedBoard}
            searchable
          />
        </div>

        {/* Row 2: Topics + Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <MultiSelectDropdown
            label="Topics"
            emoji="🎯"
            options={availableTopics}
            selected={selectedTopics}
            setSelected={setSelectedTopics}
            placeholder={selectedSubject ? 'All topics (optional)' : 'Select subject first'}
            searchable
          />

          <MultiSelectDropdown
            label="Components"
            emoji="🔧"
            options={availableComponents}
            selected={selectedComponents}
            setSelected={setSelectedComponents}
            placeholder="All components (optional)"
          />
        </div>

        <hr className="border-[var(--color-border)]" />

        {/* Row 3: Level + Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <LevelSection
            levels={availableLevels}
            selected={selectedLevels}
            setSelected={setSelectedLevels}
          />
          <DifficultySection
            selected={selectedDifficulties}
            setSelected={setSelectedDifficulties}
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !selectedBoard || !selectedSubject}
            className="w-full py-4 px-8 rounded-xl bg-[var(--blue-highlight)] text-white text-xl font-bold shadow-lg hover:opacity-90 hover:scale-[1.01] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-3">
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Questions…
              </span>
            ) : (
              '🚀 Generate Questions'
            )}
          </button>
          {(!selectedBoard || !selectedSubject) && (
            <p className="text-center text-xs opacity-40 mt-2">Select a board and subject to continue</p>
          )}
        </div>
      </form>
    </div>
  );
}
