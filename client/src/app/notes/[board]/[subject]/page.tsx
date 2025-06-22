"use client";

import { getApiUrl, isLocalhost } from "@/app/config";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BackButton, Loader } from "@/app/utils";
import Link from "next/link";

export default function singleBoardLevel({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const [subjectName, setSubjectName] = useState("");
  const [comp, setComp] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const load = async () => {
      try {
        const { subject } = await params;
        setSubjectName(subject);

        const res = await fetch(
          getApiUrl(isLocalhost()) + `/getTopics/${subject}`,
          { cache: "no-store" }
        );
        const result = await res.json();
        setComp(result[0]["topics"]);
      } catch (err) {
        console.error("Failed to fetch years:", err);
      } finally {
        setTimeout(() => setLoading(false), 200); // match fade-out timing
      }
    };

    load();
  }, [params]);

  return (
    <div>
      <div className="flex justify-between align-center mb-6">
        <h1 className="text-4xl font-semibold">
          Available <span className="text-[var(--blue-highlight)]">Topics</span>
        </h1>

        <BackButton></BackButton>
      </div>
      {loading ? (
        <Loader />
      ) : (
        <div className="animate-fade-in space-y-4">
          {comp.map((item) => (
            <Link
              key={item}
              href={`${pathname.replace(/\/$/, "")}/${item}`}
              className="border border-[var(--blue-highlight)] block p-4 rounded-xl w-full text-xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl hover:scale-[1.01] hover:shadow-2xl transition-all duration-200"
            >
              {item}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
