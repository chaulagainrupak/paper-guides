"use client";

import { BackButton} from "@/app/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface SubjetcsProps {
    "board": string,
    "subjects": [],
}


export default function SubjectsPage({ board ,subjects }: SubjetcsProps) {
    const pathname = usePathname();
    return (
        <div>
            <div className="flex justify-between align-center mb-6">
                <h1 className="text-4xl font-semibold">
                    Available <span className="text-[var(--blue-highlight)]">Subjects</span> for: {board}
                </h1>
                <BackButton></BackButton>
            </div>

            <div className="animate-fade-in space-y-6">
                {subjects?.map((subject: {'name': string}) => (
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
        </div>
    );
}
