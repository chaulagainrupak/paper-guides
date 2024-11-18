document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const questionForm = document.getElementById("question_form");
  const paperForm = document.getElementById("paper_form");
  const submissionCards = document.querySelector(".submission-cards");
  const questionCard = document.getElementById("question_card");
  const paperCard = document.getElementById("paper_card");
  const yearSelect = document.getElementById("year");
  const otherYearDiv = document.getElementById("other_year_div");
  const sessionDiv = document.getElementById("session_div");
  const sessionSelect = document.getElementById("session");

  const questionSelects = {
    board: document.getElementById("board"),
    subject: questionForm.querySelector('select[name="subject"]'),
    topic: questionForm.querySelector('select[name="topic"]'),
    level: questionForm.querySelector('select[name="level"]'),
    component: questionForm.querySelector('select[name="component"]')
  };

  const paperSelects = {
    board: paperForm.querySelector('select[name="board"]'),
    subject: paperForm.querySelector('select[name="subject"]'),
    level: paperForm.querySelector('select[name="level"]'),
    component: paperForm.querySelector('select[name="component"]'),
    paperType: paperForm.querySelector('select[name="paper_type"]')
  };

  const config = JSON.parse(document.getElementById("config").textContent);

  // Form visibility functions
  function showQuestionForm() {
    submissionCards.style.display = "none";
    questionForm.style.display = "block";
    paperForm.style.display = "none";
    populateAll(questionSelects);
  }

  function showPaperForm() {
    submissionCards.style.display = "none";
    questionForm.style.display = "none";
    paperForm.style.display = "block";
    populateAll(paperSelects);
  }

  function showSubmissionCards() {
    submissionCards.style.display = "flex";
    questionForm.style.display = "none";
    paperForm.style.display = "none";
  }

  // Add click event listeners to cards
  questionCard.addEventListener("click", showQuestionForm);
  paperCard.addEventListener("click", showPaperForm);

  // Add click event listeners to back buttons
  const backButtons = document.querySelectorAll(".back-btn");
  backButtons.forEach((button) => {
    button.addEventListener("click", showSubmissionCards);
  });

  // Populate functions
  function populateBoards(select) {
    select.innerHTML = "";
    for (const board in config) {
      const boardOption = document.createElement("option");
      boardOption.value = board;
      boardOption.textContent = board;
      select.appendChild(boardOption);
    }
  }

  function populateSubjects(select, board) {
    select.innerHTML = "";
    if (config[board]) {
      config[board].subjects.forEach((subject) => {
        const subjectOption = document.createElement("option");
        subjectOption.value = subject.name;
        subjectOption.textContent = subject.name;
        select.appendChild(subjectOption);
      });
    }
  }

  function populateTopics(topicSelect, subjectName, board) {
    topicSelect.innerHTML = "";
    if (config[board]) {
      config[board].subjects.forEach((subject) => {
        if (subject.name === subjectName) {
          subject.topics.forEach((topic) => {
            const topicOption = document.createElement("option");
            topicOption.value = topic;
            topicOption.textContent = topic;
            topicSelect.appendChild(topicOption);
          });
        }
      });
    }
  }

  function populateLevels(levelSelect, board) {
    levelSelect.innerHTML = "";
    if (config[board]) {
      config[board].levels.forEach((level) => {
        const levelOption = document.createElement("option");
        levelOption.value = level;
        levelOption.textContent = level;
        levelSelect.appendChild(levelOption);
      });
    }
  }

  function populateComponents(componentSelect, board) {
    componentSelect.innerHTML = "";
    if (config[board]) {
      config[board].components.forEach((component) => {
        const componentOption = document.createElement("option");
        componentOption.value = component;
        componentOption.textContent = component;
        componentSelect.appendChild(componentOption);
      });
    }
  }

  function populateAll(selects) {
    const selectedBoard = selects.board.value;
    if (!config[selectedBoard]) {
      console.error(`Board '${selectedBoard}' is not found in config.`);
      return;
    }
    populateSubjects(selects.subject, selectedBoard);
    if (selects.topic) populateTopics(selects.topic, selects.subject.value, selectedBoard);
    populateLevels(selects.level, selectedBoard);
    populateComponents(selects.component, selectedBoard);
  }

  // Event listeners for dropdowns
  questionSelects.board.addEventListener("change", function () {
    const selectedBoard = this.value;
    populateSubjects(questionSelects.subject, selectedBoard);
    populateLevels(questionSelects.level, selectedBoard);
    populateComponents(questionSelects.component, selectedBoard);
    populateTopics(questionSelects.topic, questionSelects.subject.value, selectedBoard);
  });

  questionSelects.subject.addEventListener("change", function () {
    const selectedBoard = questionSelects.board.value;
    populateTopics(questionSelects.topic, this.value, selectedBoard);
  });

  paperSelects.board.addEventListener("change", function () {
    const selectedBoard = this.value;
    populateSubjects(paperSelects.subject, selectedBoard);
    populateLevels(paperSelects.level, selectedBoard);
    populateComponents(paperSelects.component, selectedBoard);
    
    if (selectedBoard === "A Levels") {
      sessionDiv.style.display = "block";
    } else {
      sessionDiv.style.display = "none";
    }

  });

  // Initial population for both forms
  populateBoards(questionSelects.board);
  populateBoards(paperSelects.board);
  
  yearSelect.value = new Date().getFullYear();
  // Year select handling
  if (yearSelect) {
    yearSelect.addEventListener("change", function () {
      if (this.value === "other") {
        otherYearDiv.style.display = "block";
        otherYearDiv.querySelector("input").setAttribute("required", "true");
      } else {
        otherYearDiv.style.display = "none";
        otherYearDiv.querySelector("input").removeAttribute("required");
      }
    });
    
  }

  // File upload visual feedback
  const fileInputs = document.querySelectorAll('input[type="file"]');
  fileInputs.forEach((input) => {
    input.addEventListener("change", function () {
      const label = input.previousElementSibling;
      if (this.files.length > 0) {
        label.style.borderColor = "var(--picton-blue)";
        label.style.backgroundColor = "rgba(62, 175, 228, 0.05)";
        const span = label.querySelector("span");
        if (span) {
          span.textContent = this.files[0].name;
        }
      } else {
        label.style.borderColor = "#e0e0e0";
        label.style.backgroundColor = "";
        const span = label.querySelector("span");
        if (span) {
          span.textContent = input.id.includes("Solution")
            ? "Solution Image"
            : "Question Image";
        }
      }
    });
  });

  // Form validation
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      const requiredInputs = form.querySelectorAll(
        "input[required], select[required]"
      );
      let isValid = true;

      requiredInputs.forEach((input) => {
        input.addEventListener("input", function () {
          if (this.value) {
            this.style.borderColor = "";
          }
        });
      });
      
      if (!isValid) {
        e.preventDefault();
        alert("Please fill in all required fields");
      }
    });
  });
});
