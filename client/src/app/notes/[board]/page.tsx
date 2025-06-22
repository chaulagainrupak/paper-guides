"use client";

import { useEffect, useState } from "react";
import { getApiUrl, isLocalhost } from "@/app/config";
import { BackButton, Loader } from "@/app/utils";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const board = decodeURIComponent(pathname.split("/")[2] || "");

  useEffect(() => {
    if (board.toLowerCase() === "neb") {
      redirect("/");
      return;
    }

    const fetchSubjects = async () => {
      try {
        const response = await fetch(
          getApiUrl(isLocalhost()) + `/subjects/${board}`,
          { cache: "no-store" }
        );
        const data = await response.json();
        const sortedSubjects = data.sort((a: any, b: any) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        );
        setSubjects(sortedSubjects);
        setTimeout(() => setLoading(false), 200);
      } catch {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [board]);

  return (
    <div>
      <div className="flex justify-between align-center mb-6">
        <h1 className="text-4xl font-semibold">
          Available <span className="text-[var(--blue-highlight)]">Subjects</span>
        </h1>

        <BackButton></BackButton>
      </div>


      {loading ? (
        <Loader />
      ) : subjects.length === 0 ? (
        <p className="text-lg text-gray-400">No subjects found.</p>
      ) : (
        <div className="animate-fade-in space-y-6">
          {subjects.map((subject: any) => (
            <div key={subject.name} className="mb-4">
              <Link
                href={`${pathname.replace(/\/$/, "")}/${subject.name}`}
                className="border-1 border-[var(--blue-highlight)] block p-4 rounded-xl w-full text-xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl hover:scale-[1.01] hover:shadow-xl transition-all duration-200"
              >
                {subject.name}
              </Link>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
