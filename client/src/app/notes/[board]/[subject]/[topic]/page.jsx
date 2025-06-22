"use client";

import { getApiUrl, isLocalhost } from "@/app/config";
import { BackButton, Loader } from "@/app/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { noteRenderer } from "../../../../noteRenderer";
import { PrintButton } from "@/app/utils";

export default function QuestionLinks({ params }) {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState("");
  const pathname = usePathname();

  function encodeUrlSegment(subject, paperType, componentCode, session) {
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
        const { subject, topic } = await params;
        setSubject(subject);
        setTopic(topic);

        const res = await fetch(
          getApiUrl(isLocalhost()) + `/getNote/${subject}/${topic}`,
          { cache: "no-store" }
        );
        const result = await res.json();
        setNoteContent(result.content);
      } catch (err) {
        console.error("Failed to fetch or group papers:", err);
      } finally {
        setTimeout(() => setLoading(false), 200);
      }
    };

    load();
  }, [params]);

  return (
    <div className="printable-area mx-2">
      <div className="printable-area-title-note font-bold mb-2">
        <div>
                  <div className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl">
          {topic.replaceAll("%20", " ")} | {subject.replaceAll("%20", " ")}
        </div>
        <div className="text-lg sm:text-xl">
          Paper-<span className="blue-highlight">Guides</span>
        </div>

        <div>
          <BackButton></BackButton>
          <PrintButton></PrintButton>
        </div>
        </div>
      </div>
      <div id="note-render-dest" className="">
        {noteRenderer(noteContent)}
      </div>
      <div className="mt-6 text-center text-sm text-[text-color] leading-relaxed">
        <div className="text-xl">
          Notes curated by{" "}
          <strong>
            Paper-<span className="blue-highlight">Guides</span>
          </strong>
        </div>
        <div className="text-lg">
          <a
            href="https://discord.gg/U9fAnCgcu3"
            target="_blank"
            rel="noopener noreferrer"
            className="blue-highlight"
          >
            Join our Discord
          </a>
        </div>
        <div>
          Curated with{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            width="18"
            height="18"
            fill="#5d71e0"
            className="inline-block mx-1 align-middle"
          >
            <path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z" />
          </svg>{" "}
          and effort from 🇳🇵
        </div>
      </div>
    </div>
  );
}
