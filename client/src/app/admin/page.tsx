"use client"
import { useEffect, useState } from "react";
import { getRole, Loader, logOut } from "../utils";
import { redirect } from "next/navigation";

export default function AdminPage() {
  const [role, setRole] = useState(null);
    
  useEffect(() => {

    async function fetchRole() {
      const fetchedRole = await getRole();
      if (fetchedRole !== "admin") {
        logOut();
        redirect('/');
      } else {
        setRole(fetchedRole);
      }
    }

    fetchRole();
  }, []);

  if (role === null) {
    return <div className="flex flex-col justify-center h-screen"> <Loader/> </div>;
  }

  const onEdit = () => {

  }

  return (
    <div className="pt-[64px]">
        <div>
            <h1>NOTE EDITOR</h1>

            <div className="flex xl:flex-row flex-col gap-3 h-screen">
                <div className="note-writing-section bg-[var(--baby-powder)] h-full" contentEditable>
                    ow
                </div>

                <div className="notes-render-section bg-[var(--baby-powder)] h-full">

                </div>
            </div>
        </div>
    </div>
  );
}
