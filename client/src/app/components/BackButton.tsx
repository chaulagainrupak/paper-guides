"use client";

export function BackButton() {
  const handleClick = () => {
    history.back();
  };

  return (
    <button
      onClick={handleClick}
      className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--blue-highlight)] text-white text-lg font-bold px-4 py-2 rounded rounded-lg hover:opacity-80 transition transition-colors"
      aria-label="Go back"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
      </svg>
      Back
    </button>
  );
}
