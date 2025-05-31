import type { Metadata } from "next";
import "./global.css";

// Metadata for SEO and social previews
export const metadata: Metadata = {
  title: "Paper-Guides",
  description:
    "Access NEB and A Levels past papers and study resources for Grades 10, 11, and 12. Find SEE and A Level AS and A2 exam preparation materials, question banks, and study guides for subjects including Mathematics (9709), Physics (9702), Chemistry (9701), Biology (9700), and Computer Science (9618). Paper-Guides offers resources for CAIE students worldwide.",
  openGraph: {
    type: "website",
    title: "Paper-Guides",
    description:
      "Access NEB and A Levels past papers and study resources for Grades 10, 11, and 12. Find SEE and A Level AS and A2 exam preparation materials, question banks, and study guides for subjects including Mathematics (9709), Physics (9702), Chemistry (9701), Biology (9700), and Computer Science (9618). Paper-Guides offers resources for CAIE students worldwide.",
    images: "../public/logo_opg.png",
  },
};

// Root layout component with navbar and page wrapper
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-inter bg-[var(--background)] text-[var(--font-color)]">
        <nav className="bg-[var(--nav-background)] fixed top-0 w-full z-50 shadow-sm">
          <div className="flex justify-between items-center px-6 py-4 text-2xl font-bold">
            {/* Brand Title */}
            <a href="/" className="text-xl sm:text-2xl">
              Paper-
              <span className="text-[var(--blue-highlight)]">Guides</span>
            </a>

              <div className="flex gap-4 hidden xl:flex">
                <a href="/levels">Past Papers</a>
                <a href="/topicals">Topical Papers</a>
                <a href="/generator">Question Generator</a>
                <a href="/submit">Submit</a>
              </div>

              <div className="flex gap-2 hidden xl:flex">
                <a href="/stats" className="text-[var(--blue-highlight)]">
                  Statistics
                </a>
                <a href="/about" className="text-[var(--pink-highlight)]">
                  About
                </a>
                <a href="/login">Login</a>
              </div>

            {/* Hamburger Menu for Small Screens */}
            <div className="xl:hidden relative">
              {/* Hamburger toggle input (hidden) */}
              <input
                type="checkbox"
                id="hamburger"
                className="peer hidden"
              />
              {/* Hamburger icon */}
              <label
                htmlFor="hamburger"
                className="cursor-pointer text-3xl select-none"
              >
                &#9776;
              </label>

              {/* Hamburger dropdown menu */}
              <div className="absolute right-0 top-12 w-52 bg-white shadow-lg border rounded-lg p-4 flex flex-col gap-3 peer-checked:flex hidden">
                <a href="/levels">Past Papers</a>
                <a href="/topicals">Topical Papers</a>
                <a href="/generator">Question Generator</a>
                <a href="/submit">Submit</a>
                <a href="/stats" className="text-[var(--blue-highlight)]">
                  Statistics
                </a>
                <a href="/about" className="text-[var(--pink-highlight)]">
                  About
                </a>
                <a href="/login">Login</a>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="pt-24 px-4 sm:px-6 md:px-8">{children}</main>
      </body>
    </html>
  );
}
