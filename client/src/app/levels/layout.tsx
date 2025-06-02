import LevelPage from "./page";
export default function LevelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-[64] h-screen px-6 py-6 flex xl:flex-row flex-col">
      <div className="h-full w-4/3">
        <main>{children}</main>
      </div>

      <div className="promo-space bg-[var(--color-nav)] xl:h-full h-1/4 xl:w-1/4">
            ADVERT
      </div>
    </div>
  );
}
