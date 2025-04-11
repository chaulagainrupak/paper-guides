document.addEventListener("DOMContentLoaded", function () {

  // Disable submit buttons on page load
  document.querySelectorAll('.submit-btn').forEach((button) => {
    button.disabled = true;
    button.style.cursor = 'not-allowed';
  });

  
// Get DOM elements
const questionForm = document.getElementById("question_form");
const paperForm = document.getElementById("paper_form");
const submissionCards = document.querySelector(".submission-cards");
const questionCard = document.getElementById("question_card");
const paperCard = document.getElementById("paper_card");
const yearSelect = document.getElementById("year");
const otherYearDiv = document.getElementById("other_year_div");
const sessionDiv = document.getElementById("session_div");
const levelDiv = document.getElementById("level_div");

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
  paperType: paperForm.querySelector('select[name="paper_type"]'),
  topic: paperForm.querySelector('select[name="topic"]'),
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

  if (selectedBoard === "A Levels") {
    levelDiv.style.display = "none";
  }else{
    levelDiv.style.display = "block";
  }

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
  populateTopics(questionSelects.topic, paperSelects.subject.value, selectedBoard);
  if (selectedBoard === "A Levels") {
    sessionDiv.style.display = "block";
    levelDiv.style.display = "none";
  } else {
    sessionDiv.style.display = "none";
    levelDiv.style.display = "block";
  }
});


paperSelects.paperType.addEventListener("change", function(){
  if (this.value == 'topical'){
    paperSelects.topic.parentElement.parentElement.style.display = 'block';
  }else{
    paperSelects.topic.parentElement.parentElement.style.display = 'none';
  }
});


paperSelects.subject.addEventListener("change", function () {
  const selectedBoard = paperSelects.board.value;
  populateTopics(paperSelects.topic, this.value, selectedBoard);
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
      if (this.files.length === 1) {
        span.textContent = "1 file selected";
      } else {
        span.textContent = `${this.files.length} files selected`;
      }
    }
  } else {
    label.style.borderColor = "#e0e0e0";
    label.style.backgroundColor = "";
    const span = label.querySelector("span");
    if (span) {
      span.textContent = input.id.includes("Solution")
        ? "Solution Images"
        : "Question Images";
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


// Turnstile callback functions
function onTurnstileSuccess(token) {
document.querySelectorAll('.submit-btn').forEach((button) => {
  button.disabled = false;
  button.style.cursor = 'pointer';
});
}

function onTurnstileExpired() {
document.querySelectorAll('.submit-btn').forEach((button) => {
  button.disabled = true;
  button.style.cursor = 'not-allowed';
});
}