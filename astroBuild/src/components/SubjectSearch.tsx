import { useState, useMemo, useEffect, useRef } from 'react';

interface Subject {
  name: string;
}

interface SubjectSearchProps {
  subjects: Subject[];
  boardSlug: string;
  basePath: string;
}

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, data?: Record<string, string | number | boolean>) => void;
    };
  }
}

function trackEvent(eventName: string, data?: Record<string, string | number | boolean>) {
  try {
    window.umami?.track(eventName, data);
  } catch (_) {}
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\(|\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function SubjectSearch({ subjects, boardSlug, basePath }: SubjectSearchProps) {
  const [query, setQuery] = useState('');

  const searchDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTrackedSearch = useRef(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return subjects;
    const q = query.toLowerCase();
    return subjects.filter((s) => s.name.toLowerCase().includes(q));
  }, [query, subjects]);

  useEffect(() => {
    if (!query.trim()) {
      hasTrackedSearch.current = false;
      return;
    }

    if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);

    searchDebounceTimer.current = setTimeout(() => {
      trackEvent('Subject Searched', {
        'Board': boardSlug,
        'Search Query': query.trim(),
        'Results Found': filtered.length,
        'Total Subjects': subjects.length,
        'No Results': filtered.length === 0,
      });
      hasTrackedSearch.current = true;
    }, 600);

    return () => {
      if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);
    };
  }, [query, filtered.length]);

  const handleClear = () => {
    if (hasTrackedSearch.current) {
      trackEvent('Subject Search Cleared', {
        'Board': boardSlug,
        'Query Was': query.trim(),
        'Results Were': filtered.length,
      });
    }
    setQuery('');
  };

  const handleSubjectClick = (subjectName: string) => {
    trackEvent('Subject Selected', {
      'Board': boardSlug,
      'Subject': subjectName,
      'Via Search': query.trim().length > 0,
      'Search Query': query.trim() || 'None',
      'Position In List': filtered.findIndex((s) => s.name === subjectName) + 1,
      'Total Visible': filtered.length,
    });
  };

  return (
    <>
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-[var(--blue-highlight)] opacity-70"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search subjects…"
          className="w-full pl-12 pr-10 py-3 rounded-xl border-2 border-[var(--blue-highlight)] bg-[var(--color-nav)] text-[var(--font-color)] text-base font-medium placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-[var(--blue-highlight)] transition-all duration-200 shadow-md"
        />
        {query && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute inset-y-0 right-4 flex items-center opacity-50 hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {query.trim() && (
        <p className="text-sm opacity-60 mb-4">
          {filtered.length === 0
            ? 'No subjects match your search.'
            : `${filtered.length} subject${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      )}

      <div className="animate-fade-in space-y-4">
        {filtered.map((subject) => (
          <div key={subject.name} className="mb-4">
            <a
              href={`${basePath}/${slugify(subject.name)}`}
              onClick={() => handleSubjectClick(subject.name)}
              className="border border-[var(--blue-highlight)] block p-4 rounded-xl w-full text-xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl hover:scale-[1.01] hover:shadow-xl transition-all duration-200"
            >
              {subject.name}
            </a>
          </div>
        ))}
      </div>
    </>
  );
}