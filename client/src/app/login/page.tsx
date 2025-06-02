"use client";

import { useEffect, useState } from "react";
import { isLocalhost, getSiteKey, darkModeOn } from "../config";

export default function LoginPage() {
  const [isLocal, setIsLocal] = useState(true);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  useEffect(() => {
    setIsLocal(isLocalhost());
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {

        console.log(getSiteKey());
      const win = window as any;
      if (win.turnstile && document.getElementById("turnstile-container")) {
        win.turnstile.render("#turnstile-container", {
          sitekey: getSiteKey(),
          theme: darkModeOn()? "dark": "light",
        });
      }
    };
  }, []);

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
          {/* Tab Selection */}
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
            {/* Login Form */}
            <form
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
                  placeholder="Enter your username"
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
                  placeholder="Enter your email"
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
                />
              </div>
            </form>

            {/* Signup Form */}
            <form
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
                  placeholder="Create a username"
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
                  placeholder="Enter your email"
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
                />
              </div>
            </form>

            {/* Turnstile CAPTCHA */}
            <div className="my-6 flex justify-center">
              <div id="turnstile-container" />
            </div>

            {/* Submit Button */}
            <button
              className="w-full py-3 px-4 font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
              style={{
                backgroundColor: "var(--blue-highlight)",
                color: "var(--baby-powder)",
              }}
            >
              {activeTab === "login" ? "Login" : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
