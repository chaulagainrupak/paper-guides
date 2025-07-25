import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <div className="min-h-screen mt-[64] px-4 sm:px-6 lg:px-12">
        <div className="max-w-3xl mx-auto p-10 shadow-xl rounded-2xl bg-[var(--baby-powder)] text-center">
          <h1 className="text-4xl font-bold mb-6">
            Welcome to <span style={{ color: 'var(--blue-highlight)' }}>Paper-Guides</span>!
          </h1>
          <p className="mb-4 text-lg">
            Paper-Guides is a community-driven initiative built by students, for students — with one mission:
            <strong> make learning accessible and free</strong>. We’re based in Nepal and strive to support learners everywhere by providing curated study resources.
          </p>

          <p className="mb-4 text-lg">
            We’re completely <strong>open-source</strong> and transparent — anyone can contribute, improve, or suggest. You’ll find us on{' '}
            <Link href="https://github.com/chaulagainrupak/paper-guides" className="underline" style={{ color: 'var(--pink-highlight)' }} target="_blank" rel="noopener noreferrer">
              GitHub
            </Link>{' '}
            and active across social platforms too.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-6 mb-10">
            <Link href="https://github.com/chaulagainrupak/paper-guides" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--pink-highlight)' }}>
              GitHub Repository
            </Link>
            <Link href="https://instagram.com/paperguides.official" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--pink-highlight)' }}>
              Instagram
            </Link>
            <Link href="https://instagram.com/ausernamehandle" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--pink-highlight)' }}>
              @ausernamehandle
            </Link>
            <Link href="https://instagram.com/shreenish_shakya" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--pink-highlight)' }}>
              @shreenish_shakya
            </Link>
            <Link href="https://discord.gg/U9fAnCgcu3" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--blue-highlight)' }}>
              Join us on Discord
            </Link>
            <Link href="https://www.youtube.com/@Paper-Guides" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--blue-highlight)' }}>
              YouTube Channel
            </Link>
          </div>

          <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
          <p className="mb-4">
            To empower students by giving them access to high-quality, organized academic content — without charging a single rupee.
            We believe that shared knowledge fuels growth, and that learning should never be locked behind a paywall.
          </p>

          <h2 className="text-2xl font-semibold mb-2">Community-Driven</h2>
          <p className="mb-4">
            Paper-Guides is powered by students, volunteers, and curious minds who want to make education a bit easier for everyone.
            Whether it’s uploading notes or helping organize content, every bit of help matters. Join our Discord to contribute or connect!
          </p>

          <h2 className="text-2xl font-semibold mb-2">How It Works</h2>
          <p className="mb-4">
            Just head over to the homepage, select your class or subject, and start browsing.
            You can also search topics directly. Everything is categorized for easier access and constantly updated with new materials.
          </p>

          <h2 className="text-2xl font-semibold mb-2">Get Involved</h2>
          <p className="mb-4">
            Want to contribute? You can submit notes, suggest topics, review shared content, or simply share Paper-Guides with your friends and school groups.
            We’re also working on a contributor leaderboard and credit system — stay tuned.
          </p>

          <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
          <p className="mb-2">
            Email us at <span style={{ color: 'var(--pink-highlight)' }}><Link href='mailto:contact@paperguides.org'>contact@paperguides.org</Link></span> or{' '}
            <span style={{ color: 'var(--blue-highlight)' }}><Link href='mailto:paperguides.official@proton.me'>paperguides.official@proton.me</Link></span>
          </p>

          <p className="text-center mt-8 text-sm opacity-75">Thank you for supporting accessible education 🙌</p>
        </div>
      </div>
    </>
  )
}
