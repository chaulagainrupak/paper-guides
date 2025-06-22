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
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch or group papers:", err);
      } finally {
        setTimeout(() => setLoading(false), 200);
      }
    };

    load();
  }, [params]);

  useEffect(() => {
    function slugify(text) {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }

    function generateNavLink(linkText, targetId) {
      const link = document.createElement("a");
      link.href = `#${targetId}`;
      link.textContent = linkText;

      link.style.display = "block";
      link.style.padding = "6px 10px";
      link.style.margin = "1px 0";
      link.style.borderRadius = "4px";
      link.style.fontSize = "13px";
      link.style.fontWeight = "400";
      link.style.color = "var(--color-text)";
      link.style.textDecoration = "none";
      link.style.transition = "all 0.1s ease";
      link.style.borderLeft = "3px solid transparent";

      link.addEventListener("mouseenter", () => {
        link.style.backgroundColor = "var(--color-nav)";
        link.style.borderLeftColor = "var(--blue-highlight)";
        link.style.paddingLeft = "12px";
      });

      link.addEventListener("mouseleave", () => {
        link.style.backgroundColor = "transparent";
        link.style.borderLeftColor = "transparent";
        link.style.paddingLeft = "10px";
      });

      return link;
    }

    const navigationDest = document.getElementById("notes-navigation");
    if (!navigationDest) return;

    navigationDest.innerHTML = "";

    const noteContainer = document.getElementById("note-render-dest");
    if (!noteContainer) return;

    const headings = noteContainer.querySelectorAll("h1");

    headings.forEach((heading) => {
      const text = heading.innerText;
      const slug = slugify(text);
      heading.id = slug;

      const link = generateNavLink(text, slug);
      navigationDest.appendChild(link);
    });

    if (window.MathJax) {
      window.MathJax.typesetClear();
      window.MathJax.typeset();
    }
  }, [noteContent]); 

  return (
    <div className="printable-area mx-2">
      <div className="printable-area-title-note font-bold mb-2 flex flex-col">
        <div>
          <div className="text-xl sm:text-xl md:text-2xl lg:text-3xl xl:text-5xl">
            {loading
              ? ""
              : `${topic.replaceAll("%20", " ")} | ${subject.replaceAll(
                  "%20",
                  " "
                )}`}
          </div>
          <div className="mb-2 text-lg sm:text-xl">
            Paper-<span className="blue-highlight">Guides</span>
          </div>
        </div>

        <div className="printing-toolbar flex justify-between">
          <PrintButton containerId="note-render-dest"></PrintButton>

          <BackButton></BackButton>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div id="note-render-dest" className="">
          {noteRenderer(noteContent)}
        </div>
      )}

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
