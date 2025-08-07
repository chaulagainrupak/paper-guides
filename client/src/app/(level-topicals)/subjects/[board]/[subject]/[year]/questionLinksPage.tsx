"use client";

import { BackButton } from "@/app/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface QuestionLinksProps {
  subject: string;
  groupedPapers: {
    [sessionName: string]: [string, string][];
  };
}

export default function QuestionLinks({ subject, groupedPapers }: QuestionLinksProps) {
  const pathname = usePathname();

  function encodeUrlSegment(
    subject: string,
    paperType: string,
    componentCode: string,
    session: string
  ): string {
    const cleanSubject = subject.toLowerCase().replace(/\s+/g, "-");
    const cleanType = paperType.toLowerCase().replace(/\s+/g, "-");
    const cleanCode = componentCode.toLowerCase();
    const cleanSession = session
      .toLowerCase()
      .replace(/\//g, " ")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    return `${cleanSubject}-${cleanType}-${cleanCode}-${cleanSession}`;
  }

  return (
    <div>
      <div className="flex justify-between border-b-2 border-[var(--blue-highlight)]">
        <h1 className="text-4xl font-bold mb-6">
          Available <span className="text-[var(--blue-highlight)]">Papers</span>{" "}
          for{" "}
          <span className="text-[var(--blue-highlight)]">
            {subject.replaceAll("%20", " ")}
          </span>
        </h1>
        <div>
          <BackButton />
        </div>
      </div>

      {Object.entries(groupedPapers).map(([sessionName, papers]) =>
        papers.length > 0 ? (
          <div key={sessionName}>
            <h2 className="text-3xl font-bold mt-6 underline">• {sessionName}</h2>
            <div className="animate-fade-in space-y-4 mt-2">
              {papers.map(([session, code], index) => (
                <div className="flex w-full" key={`${session}-${code}-${index}`}>
                  <Link
                    href={`${pathname.replace(/\/$/, "")}/${encodeUrlSegment(
                      subject,
                      "Question Paper",
                      code,
                      session
                    )}`}
                    className={`border block p-4 rounded-xl w-4/3 text-xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl hover:scale-[1.01] hover:shadow-xl transition-all duration-200 ${
                      session.includes("Insert Paper")
                        ? "border-[var(--diff-three)]"
                        : "border-[var(--blue-highlight)]"
                    }`}
                  >
                    {subject.replaceAll("%20", " ")}, {code},{" "}
                    {session.includes("Insert Paper")
                      ? `Year: ${session}`
                      : `Year: ${session} Question Paper`}
                  </Link>
                  <Link
                    href={`${pathname.replace(/\/$/, "")}/${encodeUrlSegment(
                      subject,
                      "Mark Scheme",
                      code,
                      session
                    )}`}
                    className="ml-4 block p-4 rounded-xl text-xl font-bold bg-[var(--red)] text-white shadow-xl hover:scale-[1.01] hover:shadow-xl transition-all duration-200"
                    style={{ flexShrink: 0 }}
                  >
                    Mark Scheme
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}
