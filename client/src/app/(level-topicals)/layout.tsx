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
    

    {
      sidebar ?? (
      <div className="promo-space bg-[var(--baby-powder)] xl:h-full h-1/4 xl:w-1/4 shadow-xl rounded-md p-6">
            ADVERT
      </div>)
    }
    </div>
  );
}
