"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Subject {
  name: string;
}

interface SubjectSearchProps {
  subjects: Subject[];
  board: string;
}

export default function SubjectSearch({ subjects, board }: SubjectSearchProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return subjects;
    const q = query.toLowerCase();
    return subjects.filter((s) => s.name.toLowerCase().includes(q));
  }, [query, subjects]);

  return (
    <>
      {/* Search Bar */}
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
          className="
            w-full pl-12 pr-10 py-3 rounded-xl
            border-2 border-[var(--blue-highlight)]
            bg-[var(--color-nav)] text-[var(--font-color)]
            text-base font-medium
            placeholder:text-[var(--font-color)] placeholder:opacity-40
            focus:outline-none focus:ring-2 focus:ring-[var(--blue-highlight)]
            transition-all duration-200
            shadow-md
          "
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute inset-y-0 right-4 flex items-center text-[var(--font-color)] opacity-50 hover:opacity-100 transition-opacity"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Result count */}
      {query.trim() && (
        <p className="text-sm text-[var(--font-color)] opacity-60 mb-4">
          {filtered.length === 0
            ? "No subjects match your search."
            : `${filtered.length} subject${filtered.length !== 1 ? "s" : ""} found`}
        </p>
      )}

      {/* Subject list */}
      <div className="animate-fade-in space-y-6">
        {filtered.map((subject) => (
          <div key={subject.name} className="mb-4">
            <Link
              href={`/subjects/${board}/${subject.name}`}
              className="border-1 border-[var(--blue-highlight)] block p-4 rounded-xl w-full text-xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl hover:scale-[1.01] hover:shadow-xl transition-all duration-200"
              prefetch={true}
            >
              {subject.name}
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}