"use client";

import { getApiUrl, isLocalhost } from "@/app/config";
import { BackButton, Loader } from "@/app/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { noteRenderer } from "../../../../noteRenderer";

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
    <div>
      <div id="note-render-dest">{noteRenderer(noteContent)}</div>
    </div>
  );
}
