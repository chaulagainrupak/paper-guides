"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BackButton, Loader } from "@/app/utils";

interface TopicsPageProps {
  subjectName: string;
  topics: string[];
}

export default function TopicsPage({ subjectName, topics }: TopicsPageProps) {
  const pathname = usePathname();


  return (
    <div>
      <div className="flex justify-between align-center mb-6">
        <h1 className="text-4xl font-semibold">
          Available <span className="text-[var(--blue-highlight)]">Topics</span>
        </h1>
        <BackButton />
      </div>

        <div className="animate-fade-in space-y-4">
          {topics.map((topic) => (
            <Link
              key={topic}
              href={`${pathname.replace(/\/$/, "")}/${topic}`}
              className="border border-[var(--blue-highlight)] block p-4 rounded-xl w-full text-xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl hover:scale-[1.01] hover:shadow-2xl transition-all duration-200"
            >
              {topic}
            </Link>
          ))}
        </div>
    </div>
  );
}
