"use client";

import { BackButton } from "@/app/utils";
import Link from "next/link";

interface PastPapersPageProps {
  boardsData: Record<string, any>;
}

export default function PastPapersPage({ boardsData }: PastPapersPageProps) {
  return (
    <div>
      <div className="flex justify-between align-center mb-6">
        <h1 className="text-4xl font-semibold">
          Available <span className="text-[var(--blue-highlight)]">Boards</span>{" "}
          and <span className="text-[var(--blue-highlight)]">Levels</span>
        </h1>
        <BackButton />
      </div>

      <div className="animate-fade-in space-y-6">
        {Object.entries(boardsData).map(([boardName, boardData]) => (
          <div key={boardName} className="board-section">
            <h2 className="text-4xl font-bold mb-2">{boardName}</h2>

            {boardName.toLowerCase() === "a levels" && (
              <div className="level-section mb-4">
                <Link
                  href={`/notes/A level`}
                  className="border-1 border-[var(--blue-highlight)] block p-4 rounded-xl w-full text-xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl hover:scale-[1.01] hover:shadow-xl transition-all duration-200"
                >
                  CAIE: A Levels
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
