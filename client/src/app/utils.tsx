import { redirect, useRouter } from "next/navigation";
import { getApiUrl, isLocalhost } from "./config";
import { useEffect } from "react";
import { jsx } from "react/jsx-runtime";

export async function isLoggedIn() {
  const accessToken = localStorage.getItem("authToken");
  
  if (!accessToken) return false;
  try {
    const apiUrl = getApiUrl(isLocalhost());
    const response = await fetch(apiUrl + "/validateToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: accessToken,
    });

    const result = await response.json();
    if (response.status === 200) {
      return true;
    } else {
      localStorage.removeItem("authToken");
      return false;
    }
  } catch (err) {
    console.error("Token validation failed:", err);
    localStorage.removeItem("authToken");
    return false;
  }
}

export async function getRole() {
  const accessToken = localStorage.getItem("authToken");

  if (!accessToken) return null;
  try {
    const apiUrl = getApiUrl(isLocalhost());
    const response = await fetch(apiUrl + "/validateToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: accessToken,
    });

    if (response.status === 200) {
      const result = await response.json();
      console.log(`role found for ${result[0]["user"]}`)
      return result[0]["role"];
    } else {
      localStorage.removeItem("authToken");
      return null;
    }
  } catch (err) {
    console.error("Failed to get role:", err);
    localStorage.removeItem("authToken");
    return null;
  }
}


export function logOut() {
  localStorage.removeItem("authToken");
  alert("Logged Out");
  redirect('/');
}


export function Loader() {
  return (
    <div
      id="loader"
      className="bg-[var(--color-nav)] flex flex-col items-center justify-center p-10 rounded-xl shadow-md animate-fade-in transition-opacity max-w-md mx-auto"
    >
      <div className="text-xl font-semibold text-[var(--font-color)] mb-4">
        🕒 Loading...
      </div>
      <div className="animate-pulse space-y-2 w-full">
        <div className="h-4 bg-gray-400 rounded w-5/6"></div>
        <div className="h-4 bg-gray-400 rounded w-4/6"></div>
        <div className="h-4 bg-gray-400 rounded w-2/3"></div>
      </div>
    </div>
  );
}


export function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-3 p-4 max-w-lg mx-auto">
      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
    </div>
  );
}

export function BackButton() {
  const router = useRouter();

  const handleClick = () => {
    // Check if we have a referrer and it's from the same origin
    if (document.referrer && document.referrer.startsWith(window.location.origin)) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--blue-highlight)] text-white text-lg font-bold px-4 py-2 rounded rounded-lg hover:opacity-80 transition transition-colors"
      aria-label="Go back"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
      Back
    </button>
  );
}

export function PrintButton({ containerId } : {containerId: string}) {
  function handlePrint() {
    const container = document.getElementById(containerId);
    if (!container) {
      alert("Print container not found");
      return;
    }

    const detailsList = container.querySelectorAll("details");
    detailsList.forEach((detail) => {
      detail.open = true;
    });

    window.print();
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      aria-label="Print content"
    >
      Print
    </button>
  );
}
