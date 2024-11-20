document.addEventListener("DOMContentLoaded", function () {
  const questionItems = document.querySelectorAll(".question-item");
  const questionContainers = document.querySelectorAll(".question-container");

  // Pagination variables
  const itemsPerPage = 6;
  let currentPage = 1;
  const totalPages = Math.ceil(questionItems.length / itemsPerPage);

  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");

  // Pagination logic
  function showPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    questionItems.forEach((item, index) => {
      item.style.display = index >= start && index < end ? "block" : "none";
    });

    prevPageBtn.disabled = page === 1;
    nextPageBtn.disabled = page === totalPages;
    pageInfo.textContent = `Page ${page} of ${totalPages}`;
  }

  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      showPage(currentPage);
    }
  });

  nextPageBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      showPage(currentPage);
    }
  });

  // Set up toggling logic for questions
  questionItems.forEach((item) => {
    item.addEventListener("click", () => {
      questionItems.forEach((otherItem) => otherItem.classList.remove("active"));
      item.classList.add("active");

      const questionId = item.getAttribute("data-id");
      const questionContainer = document.querySelector(`#question-container-${questionId}`);

      questionContainers.forEach((container) => (container.style.display = "none"));
      if (questionContainer) questionContainer.style.display = "flex";
    });
  });

  // Assign difficulty colors
  questionItems.forEach((item) => {
    const difficulty = item.getAttribute("data-difficulty");
    switch (difficulty) {
      case "1":
        item.style.borderRight = "10px solid #177245"; // Dark Green
        break;
      case "2":
        item.style.borderRight = "10px solid #3CB371"; // Medium Sea Green
        break;
      case "3":
        item.style.borderRight = "10px solid #FFD700"; // Gold
        break;
      case "4":
        item.style.borderRight = "10px solid #FF5800"; // Orange
        break;
      case "5":
        item.style.borderRight = "10px solid #DC143C"; // Crimson
        break;
      default:
        item.style.borderRight = "10px solid #ccc"; // Default Grey
        break;
    }
  });

  // Solution toggling logic
  const solutionButtons = document.querySelectorAll(".toggle-solution-btn");
  solutionButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const buttonId = button.getAttribute("data-id");
      const solutionContainer = document.querySelector(`#solution-container-${buttonId}`);
      const questionImage = document.querySelector(`.question-image[data-id="${buttonId}"]`);

      if (!solutionContainer.style.display || solutionContainer.style.display === "none") {
        solutionContainer.style.display = "flex";
        questionImage.style.display = "none";
        button.textContent = "Hide Solution";

        // Check if solution is missing
        const solutionImage = solutionContainer.querySelector(".solution-image");
        if (solutionImage && !solutionImage.querySelector("img")) {
          solutionImage.innerHTML = '<div class="solution-not-found">Solution not found!</div>';
        }
      } else {
        solutionContainer.style.display = "none";
        questionImage.style.display = "flex";
        button.textContent = "Show Solution";
      }
    });
  });

  // Initial setup: Click first question item and show the first page
  const firstQuestionItem = document.querySelector(".question-item");
  if (firstQuestionItem) {
    showPage(currentPage);
    firstQuestionItem.click();
  }
});
