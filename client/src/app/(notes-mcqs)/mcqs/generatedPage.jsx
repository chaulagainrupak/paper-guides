import { getApiUrl, isLocalhost } from "@/app/config";
import { useState, useEffect } from "react";
import { BackButton } from "@/app/utils";

export default function GeneratedPage({ data }) {
  const dataJson = JSON.parse(data);
  const questionJson = dataJson.questionSheet;
  const answerJson = dataJson.answerSheet;

  var answeredAnswers = useState(answerJson);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  var questions = questionJson.questions;

  const handleSelect = (questionUuid, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionUuid]: [answer],
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSubmit = () => {
    answeredAnswers.answers = questions.map((q) => ({
      questionUuid: q.uuid,
      answer: selectedAnswers[q.uuid] || [],
    }));

    console.log(answeredAnswers);

    let correctCount = 0;
    answerJson.answers.forEach((ans) => {
      const userAnswer = selectedAnswers[ans.questionUuid] || [];
      if (
        JSON.stringify(userAnswer.sort()) === JSON.stringify(ans.answer.sort())
      ) {
        correctCount++;
      }
    });
    const percentage = Math.round((correctCount / questions.length) * 100);
    setScore({
      correct: correctCount,
      total: questions.length,
      percent: percentage,
    });
    setShowResult(true);



    // This is disabled temporarly as to make it fast for development for Ubuntu Con
    // const res = async () => {
    //   const respone = await fetch(getApiUrl(isLocalhost()) + "/submit-mcqs", {
    //     method: "POST",
    //     body: JSON.stringify(answeredAnswers),
    //   });

    //   return respone;
    // };
    // var response = res();

    // console.log(response);
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            MCQs for {questionJson.board}'s {questionJson.subjects[0]}
          </h1>
          <p className="text-gray-400">
            Topics: {questionJson.topics.join(", ")}
          </p>
        </div>
        <p className="text-lg font-medium">
          {currentIndex + 1} / {questions.length}
        </p>
      </div>

      {!showResult ? (
        <>
          <div className="border border-[var(--blue-highlight)] p-6 rounded-xl shadow-xl  text-[var(--font-color)]">
            <h4 className="font-semibold text-2xl mb-4">
              {currentIndex + 1}. {currentQuestion.question}
            </h4>
            <div className="grid gap-3">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(currentQuestion.uuid, opt)}
                  className={`px-4 py-2 rounded-lg border border-[var(--blue-highlight)] font-medium text-left transition-all duration-200 cursor-pointer ${
                    selectedAnswers[currentQuestion.uuid]?.includes(opt)
                      ? "bg-[var(--blue-highlight)] text-white"
                      : null
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl bg-gray-400 cursor-pointer disabled:opacity-50"
            >
              Prev
            </button>
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-[var(--blue-highlight)] cursor-pointer text-white hover:bg-blue-600"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-xl bg-[var(--green-highlight)] cursor-pointer text-white hover:bg-green-600"
              >
                Submit
              </button>
            )}
          </div>
        </>
      ) : (
        // Result view
        <div className="flex flex-col items-center mt-8">
          <div className="relative w-40 h-40 rounded-full border-8 border-[var(--blue-highlight)] flex items-center justify-center animate-pulse">
            <span className="text-2xl font-bold">{score.percent}%</span>
          </div>
          <p className="mt-4 text-xl font-semibold">
            You got{" "}
            <span className="text-[var(--blue-highlight)]">
              {score.correct}
            </span>{" "}
            out of{" "}
            <span className="text-[var(--blue-highlight)]">{score.total}</span>{" "}
            correct!
          </p>

          <div className="mt-8"><BackButton /></div>
          
        </div>
      )}

    </div>
  );
}
