import Script from "next/script";

export default function LevelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-16 flex flex-col xl:flex-row gap-4 px-6 py-6 min-h-full">
      <Script
        strategy="lazyOnload"
        type="text/javascript"
        id="MathJax-script"
        async
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
      ></Script>

      <div className="bg-[var(--baby-powder)] xl:w-full shadow-xl rounded-md p-6 min-h-full">
        <main>{children}</main>
      </div>

      <aside className="sidebar xl:w-1/5 flex flex-col gap-4 sticky top-20">
        <div
          className="p-6 bg-[var(--baby-powder)] rounded-md hidden max-xl:block xl:block max-xl:sticky max-xl:top-20"
          id="notes-navigation mcqs-navigation"
        ></div>

        <div className="p-6 bg-[var(--baby-powder)] rounded-md h-48">
          Advert
        </div>
      </aside>
    </div>
  );
}
