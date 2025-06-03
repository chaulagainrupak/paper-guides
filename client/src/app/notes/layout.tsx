export default function LevelsLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="mt-[64] h-screen px-6 py-6 flex xl:flex-row flex-col gap-6">
      <div className="bg-[var(--baby-powder)] h-full xl:w-4/3 shadow-xl rounded-md p-6">
        <main>{children}</main>
      </div>

        <div className="sidebar xl:h-full xl:w-1/4 shadow-xl flex flex-col gap-6">
          <div className="p-6 xl:h-4/3 h-1/2 bg-[var(--baby-powder)] rounded-md">
            Navigation
          </div>

          <div className="p-6 xl:h-1/3 h-1/2 bg-[var(--baby-powder)] rounded-md">
            Advert
          </div>
        </div>
    </div>
  );
}
