"use client";

import { useEffect, useState } from "react";
import { getApiUrl, isLocalhost } from "@/app/config";

export default function PastPapersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = getApiUrl(isLocalhost());

    fetch(apiUrl + "/pastpapers", { cache: "no-store" })
      .then((res) => res.json())
      .then((jsonData) => {
        setData(jsonData);
        setTimeout(() => setLoading(false), 200); // mimic fade-out time
      })
      .catch((err) => {
        console.error("Failed to fetch:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-6xl font-semibold mb-6">
        Available <span className="text-[var(--blue-highlight)]">Boards</span>{" "}
        and <span className="text-[var(--blue-highlight)]">Levels</span>
      </h1>

      <div id="dynamic-container">
        {loading ? (
          <div
            id="loader"
            className="bg-[var(--color-nav)] flex flex-col items-center justify-center p-10 rounded-xl shadow-md animate-fade-in transition-opacity"
          >
            <div className="text-xl font-semibold text-[var(--font-color)] mb-4">
              🕒 Loading Levels...
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-6">
            {Object.entries(data || {}).map(([boardName, boardData]: any) => (
              <div key={boardName} className="board-section">
                <h2 className="text-4xl font-bold mb-2">{boardName}</h2>

                {boardName.toLowerCase() === "a levels" ? (
                  <div className="level-section mb-4">
                    <a
                      href={`/subjects/A level`}
                      className="border-1 border-[var(--blue-highlight)] block p-4 rounded-xl w-full text-xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl hover:scale-[1.01] hover:shadow-xl transition-all duration-200"
                    >
                      CAIE: A Levels
                    </a>
                  </div>
                ) : (
                  boardData.levels.map((level: string) => (
                    <div key={level} className="level-section mb-4">
                      <a
                        href={`/subjects/${boardName}/${level}`}
                        className="border-1 border-[var(--blue-highlight)] block p-4 rounded-xl w-full text-2xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl hover:scale-[1.01] hover:shadow-2xl transition-all duration-200"
                      >
                        {boardName} Grade: {level}
                      </a>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-20">
        <a
          href="/submit"
          className="border border-[var(--blue-highlight)] block p-4 rounded-xl w-full text-center text-2xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl hover:scale-[1.01] hover:shadow-2xl transition-all duration-200"
        >
          🚀 Didn’t find your paper?{" "}
          <span className="text-[var(--blue-highlight)] underline">Submit-It</span>
        </a>
      </div>
    </div>
  );
}
