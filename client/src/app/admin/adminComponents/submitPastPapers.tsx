"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { getApiUrl, isLocalhost } from "../../config";
import { logOut } from "../../utils";

interface Subject {
  name: string;
  topics: string[];
}

interface Config {
  [board: string]: {
    levels: string[];
    subjects: Subject[];
    components: string[];
  };
}

export default function SubmitPaper() {
  const [config, setConfig] = useState<Config>({});
  const [boards, setBoards] = useState<string[]>([]);

  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [paperType, setPaperType] = useState<"yearly" | "topical">("yearly");

  const [year, setYear] = useState<string>("");
  const [customYear, setCustomYear] = useState("");
  const [level, setLevel] = useState("");
  const [component, setComponent] = useState("");
  const [session, setSession] = useState("may-june");
  const [topic, setTopic] = useState("");

  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [solutionFile, setSolutionFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      const res = await fetch(getApiUrl(isLocalhost()) + "/config", {
        cache: "no-store",
      });
      const json = await res.json();
      setConfig(json);
      const boardList = Object.keys(json);
      setBoards(boardList);
      setSelectedBoard(boardList[0] || "");
    };
    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tokenString = localStorage.getItem("authToken");
    if (!tokenString) return logOut();

    let accessToken: string;
    try {
      accessToken = JSON.parse(tokenString).accessToken;
    } catch {
      return logOut();
    }

    const formData = new FormData();
    formData.append("board", selectedBoard);
    formData.append("subject", selectedSubject);
    formData.append("paperType", paperType);
    formData.append("level", level);
    formData.append("component", component);
    formData.append("session", session);
    if (paperType === "yearly") {
      formData.append("year", year === "other" ? customYear : year);
    } else {
      formData.append("topic", topic);
    }
    if (paperFile) formData.append("questionFile", paperFile);
    if (solutionFile) formData.append("solutionFile", solutionFile);

    const res = await fetch(getApiUrl(isLocalhost()) + "/admin/submitPaper", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    if (res.ok) {
      alert("Paper submitted!");
      window.location.reload();
    } else {
      alert(await res.text());
    }
  };

  const subjectObjects = config[selectedBoard]?.subjects || [];
  const topics = subjectObjects.find((s) => s.name === selectedSubject)?.topics || [];
  const components = config[selectedBoard]?.components || [];
  const levels = config[selectedBoard]?.levels || [];

  return (
    <div className="mt-10 p-4 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Board */}
        <label className="block mb-2 font-semibold">Board:</label>
        <select
          value={selectedBoard}
          onChange={(e) => {
            setSelectedBoard(e.target.value);
            setSelectedSubject("");
            setTopic("");
            setLevel("");
            setComponent("");
          }}
          className="w-full p-2 border mb-4"
          required
        >
          <option value="" disabled>Select board</option>
          {boards.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        {/* Subject */}
        <label className="block mb-2 font-semibold">Subject:</label>
        <select
          value={selectedSubject}
          onChange={(e) => {
            setSelectedSubject(e.target.value);
            setTopic("");
          }}
          className="w-full p-2 border mb-4"
          required
          disabled={!selectedBoard}
        >
          <option value="" disabled>Select subject</option>
          {subjectObjects.map((s) => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
        </select>

        {/* Paper Type */}
        <label className="block mb-2 font-semibold">Paper Type:</label>
        <select
          value={paperType}
          onChange={(e) => setPaperType(e.target.value as any)}
          className="w-full p-2 border mb-4"
        >
          <option value="yearly">Yearly</option>
          <option value="topical">Topical</option>
        </select>

        {/* Year / Topic */}
        {paperType === "yearly" && (
          <>
            <label className="block mb-2 font-semibold">Year:</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full p-2 border mb-4"
            >
              <option value="" disabled>Select year</option>
              {Array.from({ length: 10 }).map((_, i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y}>{y}</option>;
              })}
              <option value="other">Other</option>
            </select>
            {year === "other" && (
              <input
                type="number"
                placeholder="Enter year"
                value={customYear}
                onChange={(e) => setCustomYear(e.target.value)}
                className="w-full p-2 border mb-4"
              />
            )}
          </>
        )}

        {paperType === "topical" && (
          <>
            <label className="block mb-2 font-semibold">Topic:</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-2 border mb-4"
            >
              <option value="" disabled>Select topic</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </>
        )}

        {/* Level */}
        <label className="block mb-2 font-semibold">Level:</label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full p-2 border mb-4"
        >
          <option value="" disabled>Select level</option>
          {levels.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        {/* Component */}
        <label className="block mb-2 font-semibold">Component:</label>
        <select
          value={component}
          onChange={(e) => setComponent(e.target.value)}
          className="w-full p-2 border mb-4"
        >
          <option value="" disabled>Select component</option>
          {components.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Session */}
        <label className="block mb-2 font-semibold">Session:</label>
        <select
          value={session}
          onChange={(e) => setSession(e.target.value)}
          className="w-full p-2 border mb-4"
        >
          <option value="specimen">Specimen</option>
          <option value="feb-mar">Feb / March</option>
          <option value="may-june">May / June</option>
          <option value="oct-nov">Oct / Nov</option>
        </select>

        {/* Files */}
        <label className="block mb-2 font-semibold">Question File (PDF):</label>
        <input
          type="file"
          accept="application/pdf"
          required
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPaperFile(e.target.files?.[0] || null)
          }
          className="w-full p-2 border mb-4"
        />

        <label className="block mb-2 font-semibold">Solution File (PDF):</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSolutionFile(e.target.files?.[0] || null)
          }
          className="w-full p-2 border mb-6"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Submit Paper
        </button>
      </form>
    </div>
  );
}
