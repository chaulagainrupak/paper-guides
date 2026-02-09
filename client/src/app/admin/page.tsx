"use client"

import { useEffect, useState } from "react";
import { getRole, Loader, logOut } from "../utils";
import { redirect } from "next/navigation";
import SubmitQuestion from "./adminComponents/submitQuestion";
import NoteSubmitter from "./adminComponents/noteSubmitter";
import SubmitMCQsQuestion from "./adminComponents/subimitMCQs";
import SubmitPaper from "./adminComponents/submitPastPapers";
import AllUnapproved from "./adminComponents/unapprovedDataList";


export default function AdminPage() {
  const [role, setRole] = useState(null);

  useEffect(() => {

    async function fetchRole() {
      const fetchedRole = await getRole();
      if (!["admin", "moderator"].includes(fetchedRole)) {
        console.log(fetchedRole)
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

  return (
    <div className="pt-[64px] flex-grow">
        <div className="flex">
            <SubmitQuestion/>
            <SubmitPaper/>
        </div>


        <div className="flex justify-center">
          <NoteSubmitter />
        </div>
        
        <div className="flex flex-col justify-center">
          <h1 className="text-xl">Submit MCQs</h1>
          <SubmitMCQsQuestion/>
        </div>

        <div>
          <AllUnapproved/>
        </div>
    </div>
  );
}
