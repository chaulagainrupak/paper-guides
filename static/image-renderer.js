document.addEventListener("DOMContentLoaded", function () {
  
  const questionItems = document.querySelectorAll(".question-item");
  const questionContainers = document.querySelectorAll(".question-container");

  // Pagination
  const itemsPerPage = 6;
  let currentPage = 1;
  const totalPages = Math.ceil(questionItems.length / itemsPerPage);

  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");

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

  // Toggling question containers
  questionItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Remove 'active' class from all question items
      questionItems.forEach((otherItem) => {
        otherItem.classList.remove("active");
      });
      // Add 'active' class to the clicked item
      item.classList.add("active");
      const questionId = item.getAttribute("data-id");
      const questionContainer = document.querySelector(
        `#question-container-${questionId}`,
      );

      questionContainers.forEach(
        (container) => (container.style.display = "none"),
      );
      questionContainer.style.display = "flex";
    });
  });

  // Click on the first question
  const firstQuestionItem = document.querySelector(".question-item");
  if (firstQuestionItem) {
    firstQuestionItem.click();
  }

  // Toggling solution containers
  const solutionButtons = document.querySelectorAll(".toggle-solution-btn");

  solutionButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const buttonId = button.getAttribute("data-id");
      const solutionContainer = document.querySelector(
        `#solution-container-${buttonId}`,
      );
      const questionImage = document.querySelector(
        `.question-image[data-id="${buttonId}"]`,
      );

      if (
        solutionContainer.style.display === "none" ||
        !solutionContainer.style.display
      ) {
        solutionContainer.style.display = "flex";
        questionImage.style.display = "none";
        button.textContent = "Hide Solution";

        // Check if solution is not found
        const solutionImage =
          solutionContainer.querySelector(".solution-image");
        if (solutionImage && !solutionImage.querySelector("img")) {
          solutionImage.innerHTML =
            '<div class="solution-not-found">Solution not found!</div>';
        }
      } else {
        solutionContainer.style.display = "none";
        questionImage.style.display = "flex";
        button.textContent = "Show Solution";
      }
    });
  });

  // Initialize pagination
  showPage(currentPage);


  document.querySelectorAll(".difficulty").forEach((item) => {
    var diff = item.getAttribute("difficulty");

    if (diff == 1) {
    }
  })
});
