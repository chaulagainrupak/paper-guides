// This file can be ignored / deleted but keeping this for "legacy" purposes. 


// "use client";

// import { usePathname } from "next/navigation";
// import { BackButton } from "@/app/utils";

// export default function SingleBoardLevel({ years }: { years: [number] }) {
//   const pathname = usePathname();
//   return (
//     <div>
//       <div className="flex justify-between align-center mb-6">
//         <h1 className="text-4xl font-semibold">
//           Available <span className="text-[var(--blue-highlight)]">Years</span>
//         </h1>
//         <BackButton></BackButton>
//       </div>

//       <div className="animate-fade-in space-y-4">
//         {years.map((item) => (
//           <a
//             key={item}
//             href={`${pathname.replace(/\/$/, "")}/${item}`}
//             className="border border-[var(--blue-highlight)] block p-4 rounded-xl w-full text-xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl hover:scale-[1.01] hover:shadow-2xl transition-all duration-200"
//           >
//             {item}
//           </a>
//         ))}
//       </div>
//     </div>
//   );
// }
