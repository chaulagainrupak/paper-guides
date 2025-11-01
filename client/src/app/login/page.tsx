"use client";

import { useEffect, useState } from "react";
import { isLocalhost, getSiteKey, darkModeOn, getApiUrl } from "../config";
import { isLoggedIn } from "../utils";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [turnstileSuccessToken, setTurnstileSuccessToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (await isLoggedIn()) {
        window.location.href = "/";
      }
    };
    check();

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      const win = window as any;
      if (win.turnstile && document.getElementById("turnstile-container")) {
        win.turnstile.render("#turnstile-container", {
          sitekey: getSiteKey(),
          theme: darkModeOn() ? "dark" : "light",
          callback: (token: string) => {
            setTurnstileSuccessToken(token);
          },
        });
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => (data[key] = value.toString()));

    const url = activeTab === "login" ? "/login" : "/signup";

    const res = await fetch(getApiUrl(isLocalhost()) + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
        token: turnstileSuccessToken,
      }),
    });

    const result = await res.json();

    setIsSubmitting(false);

    if (activeTab === "login" && res.status == 200) {
      localStorage.setItem("authToken", JSON.stringify(result));
      alert("Logged In");
      window.location.href = "/";
    } else if (result.message) {
      alert(result.message);
    } else if (result.detail) {
      alert(result.detail);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-dvh p-4">
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl shadow-xl overflow-hidden"
          style={{
            backgroundColor: "var(--color-nav)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            className="flex"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <button
              className={`flex-1 py-4 font-medium transition-colors ${
                activeTab === "login"
                  ? "text-white"
                  : "text-[var(--color-text)]"
              }`}
              style={{
                backgroundColor:
                  activeTab === "login"
                    ? "var(--blue-highlight)"
                    : "var(--color-surface)",
              }}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 py-4 font-medium transition-colors ${
                activeTab === "signup"
                  ? "text-white"
                  : "text-[var(--color-text)]"
              }`}
              style={{
                backgroundColor:
                  activeTab === "signup"
                    ? "var(--blue-highlight)"
                    : "var(--color-surface)",
              }}
              onClick={() => setActiveTab("signup")}
            >
              Sign Up
            </button>
          </div>

          <div
            className="p-6"
            style={{ backgroundColor: "var(--color-surface)" }}
          >
            <form
              onSubmit={handleSubmit}
              className={`space-y-4 ${activeTab !== "login" && "hidden"}`}
              action="#"
            >
              <div>
                <label
                  htmlFor="login-username"
                  className="block mb-2 text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="login-username"
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: "var(--color-nav)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                  placeholder="eg: paperboy024"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="login-email"
                  className="block mb-2 text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="login-email"
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: "var(--color-nav)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                  placeholder="eg: bigman@paperguides.org"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="block mb-2 text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="login-password"
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: "var(--color-nav)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="text-white font-bold w-full py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--blue-highlight)" }}
              >
                {isSubmitting ? (
                  <div className="mx-auto h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <form
              onSubmit={handleSubmit}
              className={`space-y-4 ${activeTab !== "signup" && "hidden"}`}
              action="#"
            >
              <div>
                <label
                  htmlFor="signup-username"
                  className="block mb-2 text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="signup-username"
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: "var(--color-nav)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                  placeholder="eg: paperboy024"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="signup-email"
                  className="block mb-2 text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="signup-email"
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: "var(--color-nav)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                  placeholder="eg: bigman@paperguides.org"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="signup-password"
                  className="block mb-2 text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="signup-password"
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: "var(--color-nav)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block mb-2 text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirm-password"
                  id="confirm-password"
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: "var(--color-nav)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="text-white font-bold w-full py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--blue-highlight)" }}
              >
                {isSubmitting ? (
                  <div className="mx-auto h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="my-6 flex justify-center">
              <div id="turnstile-container" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
