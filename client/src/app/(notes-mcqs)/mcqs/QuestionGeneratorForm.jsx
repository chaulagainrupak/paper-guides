"use client";

// this shit has been pulled from the previous question generation form so the code is shit and what not.

import { useState, useEffect, useRef, cache } from "react";
import { getApiUrl, isLocalhost } from "@/app/config";
import GeneratedPage from "./generatedPage";
import { isLoggedIn } from "@/app/utils";
import { Link } from "next";

// Utility to toggle checkbox selections
function toggleCheckbox(value, array, setArray) {
  if (array.includes(value)) {
    setArray(array.filter((v) => v !== value));
  } else {
    setArray([...array, value]);
  }
}

export default function QuestionGeneratorForm() {
  const [generating, setGenerating] = useState(true);
  const [generatedResult, setGeneratedResult] = useState({});

  const [config, setConfig] = useState({});
  const [boards, setBoards] = useState([]);

  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState([]);
  // const [selectedLevels, setSelectedLevels] = useState([]);
  // const [selectedDifficulties, setSelectedDifficulties] = useState([]);

  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [availableComponents, setAvailableComponents] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);

  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [showComponentDropdown, setShowComponentDropdown] = useState(false);

  const topicRef = useRef(null);
  const compRef = useRef(null);

  // Fetch config on mount
  useEffect(() => {
    async function fetchConfig() {
      const res = await fetch(getApiUrl(isLocalhost()) + "/config", {
        cache: "no-store",
      });
      const json = await res.json();
      setConfig(json);
      setBoards(Object.keys(json));
    }
    fetchConfig();
  }, []);

  // Update available fields when board/subject changes
  useEffect(() => {
    if (!selectedBoard || !config[selectedBoard]) return;
    const boardData = config[selectedBoard];
    setAvailableSubjects(boardData.subjects.map((s) => s.name));
    setAvailableComponents(boardData.components);
    setAvailableLevels(boardData.levels);

    const sub = boardData.subjects.find((s) => s.name === selectedSubject);
    setAvailableTopics(sub?.topics || []);
    setSelectedTopics([]);
  }, [selectedBoard, selectedSubject, config]);

  // Click outside dropdown handler
  useEffect(() => {
    function handleClick(e) {
      if (topicRef.current && !topicRef.current.contains(e.target)) {
        setShowTopicDropdown(false);
      }
      if (compRef.current && !compRef.current.contains(e.target)) {
        setShowComponentDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      {generating ? (
        <div className="p-6 max-w-6xl mx-auto my-auto text-[var(--color-text)] font-bold rounded-lg bg-[var(--baby-powder)]">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 tracking-tight">
              Mutiple-Choice Question Generator
            </h1>
            <p className="text-lg opacity-70">
              Configure your parameters to generate custom questions
            </p>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              const payload = {
                board: selectedBoard,
                subject: selectedSubject,
                topics: selectedTopics,
                components: selectedComponents,
              };

              try {
                const loggedIn = await isLoggedIn();
                if (!loggedIn) {
                  alert(
                    "Please login to generate questions! This restriction is placed to prevent spamming."
                  );
                  return;
                }

                // Retrieve and parse auth token from localStorage
                const rawToken = localStorage.getItem("authToken");
                if (!rawToken) {
                  alert("Authentication token missing. Please login again.");
                  return;
                }

                let tokenObj;
                try {
                  tokenObj = JSON.parse(rawToken);
                } catch (err) {
                  console.error("Invalid token format:", err);
                  alert("Authentication token corrupted. Please login again.");
                  return;
                }

                const res = await fetch(
                  getApiUrl(isLocalhost()) + "/mcqs-gen",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${tokenObj.accessToken}`,
                      cache: "no-store",
                    },
                    body: JSON.stringify(payload),
                  }
                );
                if (res.status === 200) {
                  const result = await res.json();
                  setGeneratedResult(result);
                  setGenerating(false);
                } else if (res.status == 404) {
                  alert(
                    "No data found for your selection please try another subject / topic combination!"
                  );
                } else if (res.status === 429) {
                  const result = await res.json();
                  alert(
                    `You are only allowed to generate questions once every 5 minutes. ${result.detail}`
                  );
                } else if (res.status === 401) {
                  alert("Unauthorized or invalid token.");
                }
              } catch (error) {
                console.error("Failed to submit form:", error);
              }
            }}
            className="space-y-6"
          >
            {/* Hidden Inputs */}
            {[
              ["topics", selectedTopics],
              ["components", selectedComponents],
            ].map(([name, arr]) =>
              arr.map((val) => (
                <input
                  type="hidden"
                  name={name}
                  value={val}
                  key={`${name}-${val}`}
                />
              ))
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Board */}
              <div>
                <label className="block text-2xl font-bold mb-3">
                  📚 Board:
                </label>
                <select
                  name="board"
                  value={selectedBoard}
                  onChange={(e) => {
                    setSelectedBoard(e.target.value);
                    setSelectedSubject("");
                    setSelectedTopics([]);
                    setSelectedComponents([]);
                  }}
                  className="w-full p-2 text-lg border-2 border-[var(--blue-highlight)] rounded-xl focus:outline-none transition-all duration-300 bg-[var(--baby-powder)]"
                  required
                >
                  <option value="">Select board</option>
                  {boards.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-2xl font-bold mb-3">
                  📖 Subject:
                </label>
                <select
                  name="subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-2 text-lg border-2 border-[var(--blue-highlight)] rounded-xl focus:outline-none transition-all duration-300 bg-[var(--baby-powder)]"
                  required
                >
                  <option value="">Select subject</option>
                  {availableSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topics */}
              <div className="relative" ref={topicRef}>
                <label className="block text-2xl font-bold mb-3">
                  🎯 Topics:
                </label>
                <div
                  className="flex items-center justify-between text-lg p-2 border-2 border-[var(--blue-highlight)] rounded-xl focus:outline-none transition-all duration-300 cursor-pointer bg-[var(--baby-powder)]"
                  onClick={() => setShowTopicDropdown((prev) => !prev)}
                >
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {selectedTopics.length > 0
                      ? selectedTopics.join(", ")
                      : "Select Topics"}
                  </span>

                  <span className="text-xl">
                    {showTopicDropdown ? "↑" : "↓"}
                  </span>
                </div>
                {showTopicDropdown && (
                  <div className="absolute z-10 cursor-pointer bg-[var(--baby-powder)] border border-[var(--color-border)] rounded shadow mt-1 max-h-60 overflow-y-auto w-full">
                    {availableTopics.map((topic) => {
                      const isChecked = selectedTopics.includes(topic);
                      return (
                        <label
                          key={topic}
                          className={`flex items-center px-4 py-2 hover:opacity-90 cursor-pointer select-none ${
                            isChecked
                              ? "bg-[var(--blue-highlight)] text-white"
                              : ""
                          } rounded`}
                        >
                          <input
                            type="checkbox"
                            className="appearance-none absolute opacity-0"
                            checked={isChecked}
                            onChange={() =>
                              toggleCheckbox(
                                topic,
                                selectedTopics,
                                setSelectedTopics
                              )
                            }
                          />
                          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                            {topic}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Components */}
              <div className="relative" ref={compRef}>
                <label className="block text-2xl font-bold mb-3">
                  🔧 Components:
                </label>
                <div
                  className="flex items-center justify-between text-lg p-2 border-2 border-[var(--blue-highlight)] rounded-xl focus:outline-none transition-all duration-300 cursor-pointer bg-[var(--baby-powder)]"
                  onClick={() => setShowComponentDropdown((prev) => !prev)}
                >
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {selectedComponents.length > 0
                      ? selectedComponents.join(", ")
                      : "Select Components"}
                  </span>

                  <span className="text-xl">
                    {showComponentDropdown ? "↑" : "↓"}
                  </span>
                </div>
                {showComponentDropdown && (
                  <div className="absolute z-10 bg-[var(--baby-powder)] border border-[var(--color-border)] rounded shadow mt-1 max-h-60 overflow-y-auto w-full">
                    {availableComponents.map((comp) => {
                      const isChecked = selectedComponents.includes(comp);
                      return (
                        <label
                          key={comp}
                          className={`flex items-center px-4 py-2 hover:opacity-90 cursor-pointer select-none ${
                            isChecked
                              ? "bg-[var(--blue-highlight)] text-white"
                              : ""
                          } rounded`}
                        >
                          <input
                            type="checkbox"
                            className="appearance-none absolute opacity-0"
                            checked={isChecked}
                            onChange={() =>
                              toggleCheckbox(
                                comp,
                                selectedComponents,
                                setSelectedComponents
                              )
                            }
                          />
                          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                            {comp}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                className="mt-6 bg-[var(--blue-highlight)] text-3xl text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-500 transition hover:scale-105 cursor-pointer"
              >
                🚀 Generate Questions
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <GeneratedPage data={JSON.stringify(generatedResult)} />
        </>
      )}
    </>
  );
}
