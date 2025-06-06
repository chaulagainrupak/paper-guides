"use client";

import { getApiUrl, isLocalhost } from "@/app/config";
import { BackButton, Loader } from "@/app/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function QuestionLinks({
  params,
}: {
  params: Promise<{ subject: string; year: string }>;
}) {
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [groupedPapers, setGroupedPapers] = useState<Record<string, [string, string][]>>({});
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const load = async () => {
      try {
        const { subject, year } = await params;
        setSubject(subject);
        setYear(year);

        const res = await fetch(
          getApiUrl(isLocalhost()) + `/getPapers/${subject}/${year}`,
          { cache: "no-store" }
        );
        const result = await res.json();
        const papers: [string, string][] = result[0]["components"];

        const grouped: Record<string, [string, string][]> = {
          "Feb / Mar": [],
          "May / June": [],
          "Oct / Nov": [],
          Other: [],
        };

        for (const item of papers) {
          const rawSession = item[0];
          const session = rawSession.toLowerCase();

          if (session.includes("feb") || session.includes("mar")) {
            grouped["Feb / Mar"].push(item);
          } else if (session.includes("may") || session.includes("jun")) {
            grouped["May / June"].push(item);
          } else if (session.includes("oct") || session.includes("nov")) {
            grouped["Oct / Nov"].push(item);
          } else {
            grouped["Other"].push(item);
          }
        }

        setGroupedPapers(grouped);
      } catch (err) {
        console.error("Failed to fetch or group papers:", err);
      } finally {
        // Give a tiny delay if you want the fade‐out effect to align:
        setTimeout(() => setLoading(false), 200);
      }
    };

    load();
  }, [params]);

  return (
    <div>
      <div className="flex justify-between border-b-2 border-[var(--blue-highlight)]">
        <h1 className="text-4xl font-bold mb-6">
          Available <span className="text-[var(--blue-highlight)]">Papers</span> for{" "}
          <span className="text-[var(--blue-highlight)]">{subject.replaceAll("%20", " ")}</span>
        </h1>
        <div>
          <BackButton />
        </div>
      </div>

      {loading ? (
          <Loader />
      ) : (
        Object.entries(groupedPapers).map(([sessionName, papers]) =>
          papers.length > 0 ? (
            <div key={sessionName}>
              <h2 className="text-3xl font-bold mt-6 underline">• {sessionName}</h2>
              <div className="animate-fade-in space-y-4 mt-2">
                {papers.map((item, index) => (
                  <div className="flex w-full" key={`${item[0]}-${item[1]}-${index}`}>
                    <Link
                      href={`${pathname.replace(/\/$/, "")}/${encodeUrlSegment(
                        subject,
                        "Question Paper",
                        item[1],
                        item[0]
                      )}`}
                      className="border border-[var(--blue-highlight)] block p-4 rounded-xl w-4/3 text-xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl hover:scale-[1.01] hover:shadow-xl transition-all duration-200"
                    >
                      {subject.replaceAll("%20", " ")}, {item[1]}, Year: {item[0]} Question Paper
                    </Link>
                    <Link
                      href={`${pathname.replace(/\/$/, "")}/${encodeUrlSegment(
                        subject,
                        "Mark Scheme",
                        item[1],
                        item[0]
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
        )
      )}
    </div>
  );
}
