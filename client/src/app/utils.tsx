import { redirect, useRouter } from "next/navigation";
import { getApiUrl, isLocalhost } from "./config";
import { useEffect, useMemo } from "react";
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
      console.log(`role found for ${result[0]["user"]}`);
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
  redirect("/");
}

export function Loader() {
  const lineWidths = [
    "w-full",
    "w-5/6",
    "w-4/6",
    "w-2/3",
    "w-1/2",
    "w-1/3",
    "w-1/4",
    "w-1/2",
    "w-2/3",
    "w-4/6",
    "w-5/6",
    "w-full",
    "w-1/3",
    "w-1/4",
    "w-1/2",
  ];

  return (
    <div
      id="loader"
      className="bg-[var(--color-nav)] flex flex-col items-center justify-center p-10 rounded-xl shadow-md animate-fade-in transition-opacity w-full mx-auto"
    >
      <div className="text-xl font-semibold text-[var(--font-color)] mb-4">
        🕒 Loading...
      </div>
      <div className="animate-pulse space-y-2 w-full">
        {lineWidths.map((widthClass, index) => (
          <div
            key={index}
            className={`h-4 bg-gray-400 rounded ${widthClass}`}
          ></div>
        ))}
      </div>
    </div>
  );
}

export function BackButton() {
  const router = useRouter();

  const handleClick = () => {
    router.back();
  };

  return (
    <button
      onClick={handleClick}
      className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--blue-highlight)] text-white text-lg font-bold px-4 py-2 rounded rounded-lg hover:opacity-80 transition transition-colors"
      aria-label="Go back"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
      </svg>
      Back
    </button>
  );
}

export function PrintButton({ containerId }: { containerId: string }) {
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
      className="px-4 py-2 text-white bg-[var(--green-highlight)] rounded-lg"
      aria-label="Print content"
    >
      <span className="flex justify-around gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#ffffff"
        >
          <path d="M720-680H240v-160h480v160Zm0 220q17 0 28.5-11.5T760-500q0-17-11.5-28.5T720-540q-17 0-28.5 11.5T680-500q0 17 11.5 28.5T720-460Zm-80 260v-160H320v160h320Zm80 80H240v-160H80v-240q0-51 35-85.5t85-34.5h560q51 0 85.5 34.5T880-520v240H720v160Z" />
        </svg>
        Print
      </span>
    </button>
  );
}
