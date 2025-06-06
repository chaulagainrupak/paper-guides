'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { isLoggedIn, logOut } from "./utils";

export default function LoginLink() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkLogin() {
      const result = await isLoggedIn();
      setLoggedIn(result);
    }
    checkLogin();
  }, []);

  if (loggedIn === null) return null; 

  return !loggedIn ? <Link href="/login">Login</Link> : <button onClick={logOut} className="text-left cursor-pointer">Log-Out</button>;
}
