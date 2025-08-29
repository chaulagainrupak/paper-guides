"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { getApiUrl, isLocalhost } from "../config";
import { logOut } from "../utils";

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

export default function SubmitMCQsQuestion() {
  const [config, setConfig] = useState<Config>({});
  const [boards, setBoards] = useState<string[]>([]);

  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedComponent, setSelectedComponent] = useState<string>("");
  // const [difficulty, setDifficulty] = useState<string>("");
  // const [level, setLevel] = useState<string>("");

  // const [questionImages, setQuestionImages] = useState<FileList | null>(null);
  // const [solutionImages, setSolutionImages] = useState<FileList | null>(null);

  useEffect(() => {
    const getConfig = async () => {
      const response = await fetch(getApiUrl(isLocalhost()) + "/config", {
        cache: "no-store",
      });
      const json = await response.json();
      setConfig(json);
      const boardList = Object.keys(json);
      setBoards(boardList);
      setSelectedBoard(boardList[0] || "");
    };
    getConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const tokenString = localStorage.getItem("authToken");

    if (!tokenString) {
      alert("No token found. Please log in.");
      logOut();
      return;
    }

    let accessToken: string;
    try {
      const tokenObject = JSON.parse(tokenString);
      accessToken = tokenObject.accessToken;
    } catch (err) {
      console.error("Invalid token JSON:", err);
      logOut();
      return;
    }

    const formData = new FormData();
    formData.append("board", selectedBoard);
    formData.append("subject", selectedSubject);
    formData.append("topic", selectedTopic);
    formData.append("component", selectedComponent);
    // formData.append("level", level);
    // formData.append("difficulty", difficulty);

    // if (questionImages) {
    //   Array.from(questionImages).forEach((file) =>
    //     formData.append("questionImages", file)
    //   );
    // }

    // if (solutionImages) {
    //   Array.from(solutionImages).forEach((file) =>
    //     formData.append("solutionImages", file)
    //   );
    // }

    try {
      const response = await fetch(
        getApiUrl(isLocalhost()) + "/submitQuestion",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (response.status == 200) {
        alert("Question submitted successfully!");
        window.location.reload();
      } else {
        const errorText = await response.text();
        alert("Submission failed: " + errorText);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting the question.");
    }
  };

  // Derive current subjects, topics, components, and levels based on selectedBoard
  const subjectObjects = config[selectedBoard]?.subjects || [];
  const subjects = subjectObjects.map((s) => s.name);
  const selectedSubjectObj = subjectObjects.find(
    (s) => s.name === selectedSubject
  );
  const topics = selectedSubjectObj?.topics || [];
  const components = config[selectedBoard]?.components || [];
  const levels = config[selectedBoard]?.levels || [];

  // Difficulty options fixed 1-5
  const difficultyOptions = [1, 2, 3, 4, 5];

  return (
    <div className="mt-10 p-4 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} method="POST" encType="multipart/form-data">
        {/* Board Selection */}
        <label className="block mb-2 font-semibold">Board:</label>
        <select
          name="board"
          value={selectedBoard}
          onChange={(e) => {
            setSelectedBoard(e.target.value);
            setSelectedSubject("");
            setSelectedTopic("");
            setSelectedComponent("");
            // setLevel("");
            // setDifficulty("");
          }}
          className="w-full p-2 border mb-4"
          required
        >
          <option value="" disabled>
            Select board
          </option>
          {boards.map((board) => (
            <option key={board} value={board}>
              {board}
            </option>
          ))}
        </select>

        {/* Subject Selection */}
        <label className="block mb-2 font-semibold">Subject:</label>
        <select
          name="subject"
          value={selectedSubject}
          onChange={(e) => {
            setSelectedSubject(e.target.value);
            setSelectedTopic("");
          }}
          className="w-full p-2 border mb-4"
          required
          disabled={!selectedBoard}
        >
          <option value="" disabled>
            Select subject
          </option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>

        {/* Topic Selection */}
        <label className="block mb-2 font-semibold">Topic:</label>
        <select
          name="topic"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="w-full p-2 border mb-4"
          required
          disabled={!selectedSubject}
        >
          <option value="" disabled>
            Select topic
          </option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>

        {/* Component Selection */}
        <label className="block mb-2 font-semibold">Component:</label>
        <select
          name="component"
          value={selectedComponent}
          onChange={(e) => setSelectedComponent(e.target.value)}
          className="w-full p-2 border mb-4"
          required
          disabled={!selectedBoard}
        >
          <option value="" disabled>
            Select component
          </option>
          {components.map((comp) => (
            <option key={comp} value={comp}>
              {comp}
            </option>
          ))}
        </select>

        {/* Level Dropdown */}
        {/* <label className="block mb-2 font-semibold">Level:</label>
        <select
          name="level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full p-2 border mb-4"
          required
          disabled={levels.length === 0}
        >
          <option value="">Select level</option>
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select> */}

        {/* Difficulty Dropdown */}
        {/* <label className="block mb-2 font-semibold">
          Difficulty (1 = Easy, 5 = Hard):
        </label>
        <select
          name="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-full p-2 border mb-4"
          required
        >
          <option value="">Select difficulty</option>
          {difficultyOptions.map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select> */}

        {/* Question Images Upload */}
        {/* <label className="block mb-2 font-semibold">Question Images:</label>
        <input
          type="file"
          name="questionImages"
          accept="image/*"
          multiple
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setQuestionImages(e.target.files)
          }
          className="w-full p-2 border mb-4"
          required
        /> */}

        {/* Solution Images Upload */}
        {/* <label className="block mb-2 font-semibold">Solution Images:</label>
        <input
          type="file"
          name="solutionImages"
          accept="image/*"
          multiple
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSolutionImages(e.target.files)
          }
          className="w-full p-2 border mb-4"
          required
        /> */}

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Submit Question
        </button>
      </form>
    </div>
  );
}
