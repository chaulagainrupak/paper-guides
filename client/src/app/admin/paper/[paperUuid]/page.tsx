"use client";

import { use, useEffect, useState } from "react";
import { getApiUrl, isLocalhost } from "@/app/config";
import { Metadata } from "next";
import { logOut } from "@/app/utils";

interface PdfFile {
  questionFile: string | null;
  solutionFile: string | null;
}

interface Paper {
  id: number;
  uuid: string;
  subject: string;
  year: string;
  component: string;
  board: string;
  level: string;
  pdf: PdfFile;
  approved: boolean;
  submittedBy: string | null;
  submittedFrom: string | null;
  submitDate: string | null;
  approvedBy: string | null;
  approvedOn: string | null;
}

interface PageProps {
  params: Promise<{ paperUuid: string }>;
}

export default function PaperPage({ params }: PageProps) {
  const { paperUuid: string } = use(params);

  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPaper() {
      setLoading(true);

      const tokenString = localStorage.getItem("authToken");
      if (!tokenString) return;

      let accessToken: string;
      try {
        accessToken = JSON.parse(tokenString).accessToken;
      } catch {
        return;
      }

      try {
        const res = await fetch(
          `${getApiUrl(isLocalhost())}/admin/getPaper/${(await params).paperUuid}`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        const data = await res.json();

        const mappedPaper: Paper = {
          id: data[0],
          uuid: data[1],
          subject: data[2],
          year: data[3],
          component: data[4],
          board: data[5],
          level: data[6],
          pdf: {
            questionFile: data[7],
            solutionFile: data[8],
          },
          approved: Boolean(data[9]),
          submittedBy: data[10],
          submittedFrom: data[11],
          submitDate: data[12],
          approvedBy: data[13],
          approvedOn: data[14],
        };

        setPaper(mappedPaper);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPaper();
  }, [params]);

  if (loading) return <div>Loading...</div>;
  if (!paper) return <div>Paper not found</div>;

  return (
    <div className="mt-[64]">
      <h1>{paper.subject}</h1>
      <p>Year: {paper.year}</p>
      <p>Component: {paper.component}</p>
      <p>Board: {paper.board}</p>
      <p>Level: {paper.level}</p>
      <p>Approved: {paper.approved ? "Yes" : "No"}</p>
      <p>Submitted By: {paper.submittedBy || "Unknown"}</p>
      <p>Submit Date: {paper.submitDate || "Unknown"}</p>

      {/* Question PDF */}
      {paper.pdf.questionFile && (
        <div style={{ marginTop: "20px" }}>
          <h2>Question PDF</h2>
          <object
            type="application/pdf"
            data={`data:application/pdf;base64,${paper.pdf.questionFile}`}
            width="100%"
            height="600px"
          />
        </div>
      )}

      {/* Solution PDF */}
      {paper.pdf.solutionFile && (
        <div style={{ marginTop: "20px" }}>
          <h2>Solution PDF</h2>
          <object
            type="application/pdf"
            data={`data:application/pdf;base64,${paper.pdf.solutionFile}`}
            width="100%"
            height="600px"
          />
        </div>
      )}

      <button
        className="bg-green-800 px-3 py-1 rounded text-white"
        onClick={async () => {
          const tokenString = localStorage.getItem("authToken");
          if (!tokenString) return logOut();

          let accessToken: string;
          try {
            accessToken = JSON.parse(tokenString).accessToken;
          } catch {
            return logOut();
          }

          const res = await fetch(
            `${getApiUrl(isLocalhost())}/admin/approve?questionType=paper&uuid=${paper.uuid}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );

          if (!res.ok) {
            console.error("Approve failed");
            return;
          }

          console.log("Approved:", paper.uuid);
          alert(`Approved ${paper.uuid}`);
        }}
      >
        Approve Paper
      </button>
    </div>
  );
}
