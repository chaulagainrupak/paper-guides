import { getApiUrl, isLocalhost } from "./config";

export async function isLoggedIn() {
  const accessToken = localStorage.getItem("authToken");
  if (!accessToken) return false;
  try {
    1;
    const apiUrl = getApiUrl(isLocalhost());
    const response = await fetch(apiUrl + "/validateToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: accessToken,
    });

    const result = await response.json();
    console.log(result);
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

export function logOut() {
  localStorage.removeItem("authToken");
  alert("Logged Out");
  window.location.reload();
}

export function Loader() {
  return (
    <div
      id="loader"
      className="bg-[var(--color-nav)] flex flex-col items-center justify-center p-10 rounded-xl shadow-md animate-fade-in transition-opacity"
    >
      <div className="text-xl font-semibold text-[var(--font-color)] mb-4">
        🕒 Loading...
      </div>
    </div>
  );
}
