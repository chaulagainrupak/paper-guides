export default function LevelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-[64] h-screen px-6 py-6 flex xl:flex-row flex-col gap-4">
      <div className="bg-[var(--baby-powder)] xl:w-4/3 h-fit shadow-xl rounded-md p-6">
        <main>{children}</main>
      </div>

        <div className="sidebar  xl:w-1/4 shadow-xl flex flex-col gap-4 top-20 sticky self-start">
          <div className="p-6 xl:h-4/3 max-xl:hidden bg-[var(--baby-powder)] rounded-md" id="notes-navigation">
          </div>

          <div className="p-6 xl:h-1/3 h-1/2 bg-[var(--baby-powder)] rounded-md">
            Advert
          </div>
        </div>
    </div>
  );
}
