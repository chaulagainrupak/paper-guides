import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import ThemeToggleButton from "./themeToggle";
import LoginLink from "./loginLink";

export const metadata: Metadata = {
  title: "Paper Guides",
  description: "Free exam preparation resources, Notes, Past-Papers, Question",
  icons: "/images/logo.ico",
  openGraph: {
    title: "Paper Guides",
    description: "Free exam preparation resources for students and learners.",
    url: "https://paperguides.org",
    siteName: "Paper Guides",
    images: [
      {
        url: "/images/opg_paper_guides.png",
        width: 1200,
        height: 720,
        alt: "Paper Guides Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="text/javascript"
          id="MathJax-script"
          async
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        ></script>
      </head>
      <body>
        <nav className="bg-[var(--color-nav)] fixed top-0 w-full z-50 shadow-sm">
          <div className="flex justify-between items-center px-6 py-4 text-2xl font-bold">
            <Link href="/" className="text-xl sm:text-2xl">
              Paper-<span className="text-[var(--blue-highlight)]">Guides</span>
            </Link>

            <div className="flex gap-4 hidden xl:flex">
              <Link href="/pastpapers">Past Papers</Link>
              {/* <Link href="/topicals">Topical Papers</Link> */}
              <Link href="/notes">Notes</Link>
              <Link href="/generator">Question Generator</Link>
              {/* <Link href="/submit">Submit</Link> */}
            </div>

            <div className="flex gap-4 hidden xl:flex">
              <Link href="/about" className="text-[var(--pink-highlight)]">
                About
              </Link>
              {/* <LoginLink /> */}
            </div>

            <div className="xl:hidden relative">
              <input type="checkbox" id="hamburger" className="peer hidden" />
              <label
                htmlFor="hamburger"
                className="cursor-pointer text-3xl select-none"
              >
                &#9776;
              </label>

              <div className="bg-[var(--color-nav)] absolute right-0 top-12 w-52 shadow-lg border rounded-lg p-4 flex flex-col gap-3 peer-checked:flex hidden">
                <Link href="/pastpapers">Past Papers</Link>
                {/* <Link href="/topicals">Topical Papers</Link> */}
                <Link href="/notes">Notes</Link>
                <Link href="/generator">Question Generator</Link>
                {/* <Link href="/submit">Submit</Link> */}
                <Link href="/about" className="text-[var(--pink-highlight)]">
                  About
                </Link>
                {/* <LoginLink /> */}
              </div>
            </div>
          </div>
        </nav>

        <ThemeToggleButton />
        <main className="">{children}</main>
      </body>
    </html>
  );
}
