import { useState, useEffect } from "react";

export default function GeneratedPage({ data }) {
  const dataJson = JSON.parse(data);
  const questionJson = dataJson["questionSheet"];
  const answerJson = dataJson["answerSheet"];

  var counter = 0;
  const questionAmount = useState(questionJson["questions"].length || 0);

  const difficultyToColorMap = {
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState([]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);
    setPaginationData(data.slice(startIndex, endIndex));
  }, [currentPage, data]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const buttonBgClass = showSolution
    ? "bg-[var(--pink-highlight)]"
    : "bg-[var(--blue-highlight)]";
  return (
    // <div
    //   className="py-2 flex gap-3 bg-[var(--baby-powder)] rounded-lg shadow-lg max-md:flex-col"
    //   style={{
    //     position: "fixed",
    //     top: "88px",
    //     bottom: "24px",
    //     left: "24px",
    //     right: "24px",
    //     overflowY: "auto",
    //     padding: "16px",
    //     zIndex: 1000,
    //   }}
    // >
    //   {/* Sidebar with sticky header */}
    //   <div className="bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] md:w-1/4 max-md:h-1/4 flex flex-col overflow-hidden">
    //     {/* Sticky header */}
    //     <div className="p-4 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-surface)] z-10">
    //       <div className="text-2xl font-bold text-[var(--color-text)] flex items-center">
    //         <svg
    //           xmlns="http://www.w3.org/2000/svg"
    //           className="h-6 w-6 mr-2 text-[var(--blue-highlight)]"
    //           fill="none"
    //           viewBox="0 0 24 24"
    //           stroke="currentColor"
    //         >
    //           <path
    //             strokeLinecap="round"
    //             strokeLinejoin="round"
    //             strokeWidth={2}
    //             d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    //           />
    //         </svg>
    //         <h1>
    //           <span className="text-[var(--blue-highlight)]">
    //             {data.length}
    //           </span>{" "}
    //           Questions Generated
    //         </h1>
    //       </div>
    //     </div>

    //     {/* Scrollable question list + pagination */}
    //     <div className="overflow-y-auto flex-1">
    //       <div className="p-4">
    //         {paginationData.map((item, index) => {
    //           const questionTitle = Array.isArray(item)
    //             ? item[3]
    //             : item.title || "Untitled Question";
    //           const globalIndex = (currentPage - 1) * itemsPerPage + index;
    //           const difficultyColor = `var(--diff-${
    //             difficultyToColorMap[item[4]]
    //           }`;

    //           return (
    //             <div
    //               key={globalIndex}
    //               className={`h-20 mb-4 bg-[var(--color-nav)] rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg cursor-pointer shadow-lg outline outline-[var(--blue-highlight)] border-r-10`}
    //               style={{ borderColor: difficultyColor }}
    //               onClick={() => {
    //                 setCurrentQuestion(globalIndex);
    //               }}
    //             >
    //               <div className="p-4 flex items-start">
    //                 <div className="w-10 rounded-lg mr-3 overflow-hidden">
    //                   <img
    //                     src={`data:image/png;base64,${item[8]}`}
    //                     alt={`Question ${globalIndex + 1}`}
    //                     className="w-full h-full object-contain"
    //                   />
    //                 </div>

    //                 <div className="flex-col">
    //                   <h4 className="ml-2 text-2md font-semibold text-[var(--color-text)] truncate max-w-[200px]">
    //                     {questionTitle}
    //                   </h4>
    //                   <div className="flex mt-1 justify-start">
    //                     <span className="font-semibold text-sm px-2 py-1 text-[var(--pink-highlight)]">
    //                       Comp: {item[7]}
    //                     </span>
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>
    //           );
    //         })}
    //       </div>

    //       {/* Pagination Controls */}
    //       <div className="border-t border-[var(--color-border)] p-4 flex items-center justify-between">
    //         <button
    //           onClick={handlePrevPage}
    //           disabled={currentPage === 1}
    //           className={`flex items-center px-4 py-2 rounded-lg ${
    //             currentPage === 1
    //               ? "bg-gray-300 cursor-not-allowed"
    //               : "bg-[var(--blue-highlight)] hover:opacity-80 text-white cursor-pointer"
    //           }`}
    //         >
    //           <svg
    //             xmlns="http://www.w3.org/2000/svg"
    //             className="h-4 w-4 mr-1"
    //             fill="none"
    //             viewBox="0 0 24 24"
    //             stroke="currentColor"
    //           >
    //             <path
    //               strokeLinecap="round"
    //               strokeLinejoin="round"
    //               strokeWidth={2}
    //               d="M15 19l-7-7 7-7"
    //             />
    //           </svg>
    //           Prev
    //         </button>

    //         <div className="text-[var(--color-text)] font-medium">
    //           Page{" "}
    //           <span className="text-[var(--blue-highlight)]">
    //             {currentPage}
    //           </span>{" "}
    //           of{" "}
    //           <span className="text-[var(--pink-highlight)]">{totalPages}</span>
    //         </div>

    //         <button
    //           onClick={handleNextPage}
    //           disabled={currentPage === totalPages}
    //           className={`flex items-center px-4 py-2 rounded-lg ${
    //             currentPage === totalPages
    //               ? "bg-gray-300 cursor-not-allowed"
    //               : "bg-[var(--blue-highlight)] hover:opacity-80 text-white cursor-pointer"
    //           }`}
    //         >
    //           Next
    //           <svg
    //             xmlns="http://www.w3.org/2000/svg"
    //             className="h-4 w-4 ml-1"
    //             fill="none"
    //             viewBox="0 0 24 24"
    //             stroke="currentColor"
    //           >
    //             <path
    //               strokeLinecap="round"
    //               strokeLinejoin="round"
    //               strokeWidth={2}
    //               d="M9 5l7 7-7 7"
    //             />
    //           </svg>
    //         </button>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Main content remains unchanged */}
    //   <div className="w-full flex-1 bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] p-3 overflow-hidden">
    //     <div className="question-container">
    //       <div className=" shadow-lg top-bar bg-[var(--baby-powder)] flex justify-between p-2 text-xl max-md:text-sm rounded-lg">
    //         <div className="question-details p-2">
    //           <span className="detail-item">
    //             Topic: <strong>{data[currentQuestion][3]}</strong>
    //           </span>
    //           &nbsp; &nbsp;
    //           <span className="detail-item difficulty">
    //             Difficulty: <strong>{data[currentQuestion][4]}</strong>
    //           </span>
    //           &nbsp;&nbsp;
    //           <span className="detail-item">
    //             Component: <strong>{data[currentQuestion][7]}</strong>
    //           </span>
    //         </div>

    //         <div className="right-top-bar">
    //           <button
    //             className={`shadow-lg font-semibold text-white toggle-solution-btn  p-2 rounded-lg cursor-pointer ${buttonBgClass}` }
    //             onClick={() => setShowSolution(!showSolution)}
    //           >
    //             {showSolution ? "Hide Solution" : "Show Solution"}
    //           </button>
    //         </div>
    //       </div>

    //       <div className="overflow-y-auto max-h-[calc(100vh-250px)] px-2 mt-4">
    //         <div className="image-container question-image mb-4">
    //           {!showSolution ? (
    //             <img
    //               src={`data:image/png;base64,${data[currentQuestion][8]}`}
    //               alt="Question"
    //               className="w-full object-contain"
    //             />
    //           ) : (
    //             <img
    //               src={`data:image/png;base64,${data[currentQuestion][9]}`}
    //               alt="Question"
    //               className="w-full object-contain"
    //             />
    //           )}
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>

    <div className="flex flex-col">
      <div className="mb-5 flex justify-between">
        <div>
          <h1 className="text-4xl font-semibold">
            MCQs for {questionJson["board"]}'s {questionJson["subjects"][0]}
          </h1>
          <h6>Topics included: {questionJson["topics"].join(", ")}</h6>
        </div>
      </div>

      <div className="border-1 border-[var(--blue-highlight)] block p-4 rounded-xl w-full text-xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl shadow-xl">
        {questionJson["questions"].map((data) => {
          return (
            <p key={data["uuid"]}>
              {++counter}. {data["question"]}
            </p>
          );
        })}
      </div>
    </div>
  );
}
