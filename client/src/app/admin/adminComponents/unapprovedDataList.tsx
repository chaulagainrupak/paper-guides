"use client";

import { getApiUrl, isLocalhost } from "@/app/config";
import { logOut } from "@/app/utils";
import { useEffect, useState } from "react";
import Link from "next/link";

interface PaperItem {
  id: string;
  subject: string;
  year: string;
  component: string;
  board: string;
  level: string;
}

export default function AllUnapproved() {
  return <UnapprovedPapersList />;
}

function UnapprovedPapersList() {
  const [papers, setPapers] = useState<PaperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState<number>(20);

  useEffect(() => {
    async function fetchPapers() {
      setLoading(true);

      const tokenString = localStorage.getItem("authToken");
      if (!tokenString) return logOut();

      let accessToken: string;
      try {
        accessToken = JSON.parse(tokenString).accessToken;
      } catch {
        return logOut();
      }

      try {
        const res = await fetch(
          `${getApiUrl(isLocalhost())}/admin/getUnapproved?q=papers&count=${count}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const data = await res.json();
        setPapers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPapers();
  }, [count]);

  if (loading) return <div>Loading...</div>;
  if (!papers.length) return <div>No unapproved papers found</div>;

  return (
    <div>
      <div>
        <label>Show papers: </label>
        <select value={count} onChange={(e) => setCount(parseInt(e.target.value, 10))}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={-1}>Random</option>
        </select>
      </div>

      <div>
        {papers.map((paper) => (
          <div key={paper.id}>
            <Link href={`/admin/paper/${paper.id}`}>
              {paper.subject} ({paper.year}) - {paper.component} [{paper.board} | {paper.level}]
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
