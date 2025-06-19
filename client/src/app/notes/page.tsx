"use client";

import { useEffect, useState } from "react";
import { getApiUrl, isLocalhost } from "@/app/config";
import { Loader } from "@/app/utils";
import Link from "next/link";

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
      <h1 className="text-4xl font-semibold mb-6">
        Available <span className="text-[var(--blue-highlight)]">Boards</span>{" "}
        and <span className="text-[var(--blue-highlight)]">Levels</span>
      </h1>

      <div id="dynamic-container">
        {loading ? (
          <Loader/>
        ) : (
          <div className="animate-fade-in space-y-6">
            {Object.entries(data || {}).map(([boardName, boardData]: any) => (
              <div key={boardName} className="board-section">
                <h2 className="text-4xl font-bold mb-2">{boardName}</h2>

                {boardName.toLowerCase() === "a levels" ? (
                  <div className="level-section mb-4">
                    <Link
                      href={`/notes/A level`}
                      className="border-1 border-[var(--blue-highlight)] block p-4 rounded-xl w-full text-xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl hover:scale-[1.01] hover:shadow-xl transition-all duration-200"
                    >
                      CAIE: A Levels
                    </Link>
                  </div>
                ) : ( null )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
