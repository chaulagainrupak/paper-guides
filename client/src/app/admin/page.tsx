"use client"

import { useEffect, useState } from "react";
import { getRole, Loader, logOut } from "../utils";
import { redirect } from "next/navigation";
import SubmitQuestion from "./submitFrom";
import NoteSubmitter from "./noteSubmitter";
import SubmitMCQsQuestion from "./subimitMCQs";


export default function AdminPage() {
  const [role, setRole] = useState(null);

  useEffect(() => {

    async function fetchRole() {
      const fetchedRole = await getRole();
      if (fetchedRole !== "admin") {
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
        <div className="">
            <SubmitQuestion/>
        </div>


        <div className="flex justify-center">
          <NoteSubmitter />
        </div>
        
        <div className="flex flex-col justify-center">
          <h1 className="text-xl">Submit MCQs</h1>
          <SubmitMCQsQuestion/>
        </div>
    </div>
  );
}
