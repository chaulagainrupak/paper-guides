"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { getApiUrl, isLocalhost } from "../config";
import { logOut } from "../utils";
import config from "./configs.json";
import { noteRenderer } from "../noteRenderer";

export default function NoteSubmitter() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const  [editorNoteContent, setEditorNoteContent] = useState("");

  useEffect(() => {
    const editorElement = document.getElementById("note-editor");

    if (!editorElement) return;

    const handleInput = () => {
      setEditorNoteContent(editorElement.innerText);
    };

    editorElement.addEventListener("input", handleInput);

    return () => {
      editorElement.removeEventListener("input", handleInput);
    };
  }, []);
  return (
    <div className="flex flex-col h-screen w-full p-8 bg-[var(--color-nav)]">
      NOTE SUBMISSION!
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <label htmlFor="board">Board:</label>
        <select name="board" id="board" required>
          {Object.entries(config).map(([boardKey, boardValue]) => (
            <option
              key={boardKey}
              value={boardKey}
              className="bg-[var(--color-nav)]"
            >
              {boardKey}
            </option>
          ))}
        </select>

        <label htmlFor="level">Level:</label>
        <select name="level" id="level" required>
          {Object.entries(config).map(([boardKey, boardValue]) =>
            boardValue["levels"].map((level) => (
              <option
                key={level}
                value={level}
                className="bg-[var(--color-nav)]"
              >
                {level}
              </option>
            ))
          )}
        </select>

        <label htmlFor="subject">Subject:</label>
        <select
          required
          name="subject"
          id="subject"
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          {Object.entries(config).map(([boardKey, boardValue]) =>
            boardValue["subjects"].map((subjectData) => (
              <option
                key={subjectData.name}
                value={subjectData.name}
                className="bg-[var(--color-nav)]"
              >
                {subjectData.name}
              </option>
            ))
          )}
        </select>

        <label htmlFor="topic">Topic:</label>
        <select name="topic" id="topic" required>
          {Object.entries(config).flatMap(([_, boardValue]) =>
            boardValue.subjects
              .filter((s) => s.name === selectedSubject)
              .flatMap((s) =>
                s.topics.map((topic) => (
                  <option
                    key={topic}
                    value={topic}
                    className="bg-[var(--color-nav)]"
                  >
                    {topic}
                  </option>
                ))
              )
          )}
        </select>

        <div className="flex w-screen gap-2">
          <div
            id="note-editor"
            contentEditable
            className="h-screen w-1/2 bg-[var(--baby-powder)]"
          ></div>

          <div
            id="note-render-section"
            className="bg-[var(--baby-powder)] h-screen w-1/2"
          >
            {noteRenderer(editorNoteContent)}
          </div>
        </div>
        <br />

        <button
          type="submit"
          className=" bg-[var(--blue-highlightLZ )] text-xl"
        >
          Submit The Note!
        </button>
      </form>
    </div>
  );
}

const handleSubmit = async (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const board = formData.get("board");
  const level = formData.get("level");
  const subject = formData.get("subject");
  const topic = formData.get("topic");

  const content = document.getElementById("note-editor")?.innerText;

  try {
    let accessToken;
    try {
      const tokenString = localStorage.getItem("authToken");

      const tokenObject = JSON.parse(tokenString);
      accessToken = tokenObject.accessToken;
    } catch (err) {
      console.error("Invalid token JSON:", err);
      logOut();
      return;
    }

    const response = await fetch(`${getApiUrl(isLocalhost())}/postNote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        board,
        level,
        subject,
        topic,
        content,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit note");
    }

    console.log("Note submitted successfully");
  } catch (error) {
    console.error("Submission error:", error);
  }
};
