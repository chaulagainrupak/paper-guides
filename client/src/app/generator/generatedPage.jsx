import React, { useState, useEffect } from 'react';

export default function GeneratedPage({ data }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState([]);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  useEffect(() => {
    // Calculate paginated data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);
    setPaginationData(data.slice(startIndex, endIndex));
  }, [currentPage, data]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="mt-[64] min-h-screen bg-gradient-to-br p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar with pagination */}
          <div className="w-full lg:w-1/4 bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[var(--blue-highlight)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-[var(--blue-highlight)]">{data.length}</span> Questions
              </h2>
            </div>
            
            <div className="question-list p-4 max-h-[calc(100vh-250px)] overflow-y-auto">
              {paginationData.map((item, index) => {
                const questionTitle = Array.isArray(item) ? item[1] : item.title || "Untitled Question";
                const globalIndex = (currentPage - 1) * itemsPerPage + index;
                
                return (
                  <div 
                    key={globalIndex}
                    className={`question-item mb-4 bg-[var(--color-nav)] rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg cursor-pointer ${index % 2 === 0 ? 'border-l-4 border-[var(--blue-highlight)]' : 'border-l-4 border-[var(--pink-highlight)]'}`}
                  >
                    <div className="p-4 flex items-start">
                      <div className="bg-[var(--baby-powder)] w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mr-3">
                        <span className="font-bold text-[var(--rich-black)]">{globalIndex + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[var(--color-text)] truncate max-w-[200px]">
                          {questionTitle}
                        </h4>
                        <div className="flex items-center mt-1">
                          <span className="text-xs px-2 py-1 bg-[var(--blue-highlight)] text-white rounded-full">Topic</span>
                          <span className="text-xs px-2 py-1 bg-[var(--pink-highlight)] text-white rounded-full ml-2">Component</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination Controls */}
            <div className="pagination border-t border-[var(--color-border)] p-4 flex items-center justify-between">
              <button 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[var(--blue-highlight)] hover:bg-[var(--picton-blue)] text-white'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </button>
              
              <div className="text-[var(--color-text)] font-medium">
                Page <span className="text-[var(--blue-highlight)]">{currentPage}</span> of <span className="text-[var(--pink-highlight)]">{totalPages}</span>
              </div>
              
              <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-[var(--blue-highlight)] hover:bg-[var(--picton-blue)] text-white'}`}
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] p-6">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center max-w-lg">
                <div className="bg-[var(--baby-powder)] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--plum)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-[var(--color-text)] mb-3">
                  Question Details
                </h2>
                
                <p className="text-[var(--color-text)] mb-6">
                  Select a question from the sidebar to view its details, solution, and related information. 
                  The paginated sidebar shows {itemsPerPage} questions per page for easier navigation.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[var(--color-nav)] p-4 rounded-lg">
                    <h3 className="font-bold text-[var(--blue-highlight)] mb-2">Topics</h3>
                    <ul className="space-y-1">
                      <li className="text-sm">Algebra</li>
                      <li className="text-sm">Geometry</li>
                      <li className="text-sm">Calculus</li>
                    </ul>
                  </div>
                  <div className="bg-[var(--color-nav)] p-4 rounded-lg">
                    <h3 className="font-bold text-[var(--pink-highlight)] mb-2">Difficulty</h3>
                    <ul className="space-y-1">
                      <li className="text-sm">Easy: 12 questions</li>
                      <li className="text-sm">Medium: 8 questions</li>
                      <li className="text-sm">Hard: 5 questions</li>
                    </ul>
                  </div>
                </div>
                
                <button className="bg-[var(--blue-highlight)] hover:bg-[var(--picton-blue)] text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Export Questions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}