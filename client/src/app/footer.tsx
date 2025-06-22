import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-[var(--color-nav)] text-[--color-text] mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-[var(--blue-highlight)]">
            Paper-Guides
          </h3>
          <p>
            Built by students, for students. Free study resources for everyone.
            Open-source, community-supported, and forever accessible.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-[var(--pink-highlight)]">
            Quick Links
          </h3>
          <ul className="space-y-1">
            <li>
              <Link href="/pastpapers" className="hover:underline">
                Past Papers
              </Link>
            </li>
            <li>
              <Link href="/notes" className="hover:underline">
                Notes
              </Link>
            </li>
            <li>
              <Link href="/generator" className="hover:underline">
                Question Generator
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">
                About Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-[var(--blue-highlight)]">
            Community
          </h3>
          <ul className="space-y-1">
            <li>
              <Link
                href="https://github.com/chaulagainrupak/paper-guides"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                GitHub
              </Link>
            </li>
            <li>
              <Link
                href="https://discord.gg/U9fAnCgcu3"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Discord
              </Link>
            </li>
            <li>
              <Link
                href="https://www.youtube.com/@Paper-Guides"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                YouTube
              </Link>
            </li>
            <li>
              <Link
                href="https://instagram.com/paperguides.official"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Instagram
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-[var(--pink-highlight)]">
            Contact
          </h3>
          <ul className="space-y-1">
            <li>
              <Link
                href="mailto:contact@paperguides.org"
                className="hover:underline"
              >
                contact@paperguides.org
              </Link>
            </li>
            <li>
              <Link
                href="mailto:paperguides.official@proton.me"
                className="hover:underline"
              >
                paperguides.official@proton.me
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center py-4 text-sm border-t border/20">
        Built with{" "}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          width="18"
          height="18"
          fill="#5d71e0"
          className="inline-block mx-1 align-middle"
        >
          <path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z" />
        </svg>{" "}
        in Nepal 🇳🇵.
      </div>
    </footer>
  );
}
