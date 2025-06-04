"use client";

import { useEffect, useState } from "react";

export default function singleBoardLevel({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  let [subjectName, setSubjectName] = useState("");

  useEffect(() => {
    const slug = async () => {
      const { subject } = await params;
      setSubjectName(subject);
    };
    slug();
  });

  return(
    <div>
        
    </div>
  );
}
