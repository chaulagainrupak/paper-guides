// app/subjects/[level]/[subject]/[year]/[component]/PaperViewerClient.tsx
"use client";

import { getApiUrl, isLocalhost } from "@/app/config";
import { Loader } from "@/app/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaperViewerClient({
  params,
}: {
  params: Promise<{
    question: string;
  }>;
}) {
  const [questionName, setQuestionName] = useState("");
  const [questionData, setQuestionData] = useState("");
  const [markSchemeData, setMarkSchemeData] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const qName = async () => {
      const { question } = await params;
      setQuestionName(question);

      const res = await fetch(
        getApiUrl(isLocalhost()) + `/getData/${questionName}`,
        { cache: "no-store" }
      );
      let response = await res.json();
      setQuestionData(await response[0]["questionData"]);
      setMarkSchemeData(await response[0]["markSchemeData"]);
      setIsLoading(false);
    };
    qName();
  });

  return <div>{isLoading ? <Loader /> : <div>
        <object data={`data:application/pdf;base64,${questionData}`} type="application/pdf" className="question-pdf w-full h-200"></object>
        <object data={`data:application/pdf;base64,${markSchemeData}`} type="application/pdf" className="soluton-pdf w-full h-200"></object>
    </div>}</div>;
}
