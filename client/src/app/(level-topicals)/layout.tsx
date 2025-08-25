
export default function LevelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-[64] h-auto px-6 py-6 flex xl:flex-row flex-col gap-6">
      <div className="bg-[var(--baby-powder)] h-full xl:w-4/3 shadow-xl rounded-md p-6">
        <main>{children}</main>
      </div>

      <div className="promo-space bg-[var(--baby-powder)] xl:h-auto h-1/4 xl:w-1/4 shadow-xl rounded-md p-6">
        ADVERT
      </div>
    </div>
  );
}
