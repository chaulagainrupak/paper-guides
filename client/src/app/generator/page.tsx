"use client";
import QuestionGeneratorForm from "./QuestionGeneratorForm.jsx";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-6xl p-6">
        <QuestionGeneratorForm />
      </div>
    </div>
  );
}
