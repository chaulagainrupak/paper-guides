import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";


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


export default function HomePage() {
  return (
    <section className="mt-[64] min-h-screen text-[var(--font-color)] flex flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mb-16">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
          Prepare <span className="text-[var(--blue-highlight)]">Faster</span>{" "}
          Than Ever
        </h1>
        <p className="text-xl md:text-2xl mb-4">
          Paper-<span className="text-[var(--blue-highlight)]">Guides</span>{" "}
          gives you access to Past Papers, Notes, Topical Questions, and a Question
          Generator to{" "}
          <span className="text-[var(--pink-highlight)]">
            prepare faster than ever
          </span>
          .
        </p>
        <p className="text-lg md:text-xl">By the students for the students.</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Card 1 */}
        <div className="bg-[var(--baby-powder)] rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-all hover:-translate-y-1">
          <Image
          loading="lazy"
            src="/images/compressed_past-papers.webp"
            alt="Past Papers"
            width={600}
            height={337}
            className="w-full rounded-lg mb-4 border-2 border-[var(--blue-highlight)] object-cover"
          />
          <h3 className="text-xl font-semibold text-[var(--blue-highlight)] mb-2">
            Exam Success Starts Here
          </h3>
          <p className="text-[var(--font-color)] mb-4">
            Access past-papers to boost your exam preparation.
          </p>
          <Link
            href="/pastpapers"
            className="inline-block py-3 text-white text-lg font-medium rounded-md bg-[var(--blue-highlight)] hover:bg-[var(--picton-blue)] transition-colors w-full mt-auto"
          >
            Past Papers
          </Link>
        </div>

        {/* Card 2 */}
        <div className="bg-[var(--baby-powder)] rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-all hover:-translate-y-1">
          <Image
          loading="lazy"
            src="/images/compressed_question-generator.webp"
            alt="Question Generator"
            width={600}
            height={337}
            className="w-full rounded-lg mb-4 border-2 border-[var(--blue-highlight)] object-cover"
          />
          <h3 className="text-xl font-semibold text-[var(--blue-highlight)] mb-2">
           Question Practice
          </h3>
          <p className="text-[var(--font-color)] mb-4">
            Generate custom practice questions tailored to your needs.
          </p>
          <Link
            href="/generator"
            className="inline-block py-3 text-white text-lg font-medium rounded-md bg-[var(--blue-highlight)] hover:bg-[var(--picton-blue)] transition-colors w-full mt-auto"
          >
            Start Generating
          </Link>
        </div>

        {/* Card 4 */}
        <div className="bg-[var(--baby-powder)] rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-all hover:-translate-y-1">
          <Image
          loading="lazy"
            src="/images/compressed_notes.webp"
            alt="Notes"
            width={600}
            height={337}
            className="w-full rounded-lg mb-4 border-2 border-[var(--blue-highlight)] object-cover"
          />
          <h3 className="text-xl font-semibold text-[var(--blue-highlight)] mb-2">
            Quality  Notes
          </h3>
          <p className="text-[var(--font-color)] mb-4">
            Acess quality study notes well organized and easily accessible.
          </p>
          <Link
            href="/notes"
            className="inline-block py-3 text-white text-lg font-medium rounded-md bg-[var(--blue-highlight)] hover:bg-[var(--picton-blue)] transition-colors w-full mt-auto"
          >
            View Notes
          </Link>
        </div>

        {/* Card 3 */}
        {/* <div className="bg-[var(--baby-powder)] rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-all hover:-translate-y-1">
          <Image
          loading="lazy"
            src="/images/compressed_topicals.webp"
            alt="Topical Papers"
            width={600}
            height={337}
            className="w-full rounded-lg mb-4 border-2 border-[var(--blue-highlight)] object-cover"
          />
          <h3 className="text-xl font-semibold text-[var(--blue-highlight)] mb-2">
            Focused Topic Mastery
          </h3>
          <p className="text-[var(--font-color)] mb-4">
            Dive deep with carefully curated topical practice papers.
          </p>
          <Link
            href="/topicals"
            className="inline-block py-3 text-white text-lg font-medium rounded-md bg-[var(--blue-highlight)] hover:bg-[var(--picton-blue)] transition-colors w-full mt-auto"
          >
            Discover Topicals
          </Link>
        </div> */}
      </div>
    </section>
  );
}
