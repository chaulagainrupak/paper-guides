document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const questionForm = document.getElementById("question_form");
  const paperForm = document.getElementById("paper_form");
  const submissionCards = document.querySelector(".submission-cards");
  const questionCard = document.getElementById("question_card");
  const paperCard = document.getElementById("paper_card");
  const subjectSelects = document.querySelectorAll('select[name="subject"]');
  const topicSelect = document.getElementById("topic");
  const yearSelect = document.getElementById("year");
  const otherYearDiv = document.getElementById("other_year_div");
  const config = JSON.parse(document.getElementById("config").textContent);

  // Form visibility functions
  function showQuestionForm() {
    submissionCards.style.display = "none";
    questionForm.style.display = "block";
    paperForm.style.display = "none";
  }

  function showPaperForm() {
    submissionCards.style.display = "none";
    questionForm.style.display = "none";
    paperForm.style.display = "block";
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

  // Topic population function
  function populateTopics(subjectName) {
    if (!topicSelect) return; // Guard clause in case topic select doesn't exist

    topicSelect.innerHTML = "";
    config.NEB.subjects.forEach((subject) => {
      if (subject.name === subjectName) {
        subject.topics.forEach((topic) => {
          let option = document.createElement("option");
          option.value = topic;
          option.textContent = topic;
          topicSelect.appendChild(option);
        });
      }
    });
  }

  // Add change event listeners to all subject selects
  subjectSelects.forEach((select) => {
    select.addEventListener("change", function () {
      populateTopics(this.value);
    });
  });

  // Initialize topics for the default selected subject in question form
  const defaultSubject = document.querySelector(
    '#question_form select[name="subject"]',
  );
  if (defaultSubject) {
    populateTopics(defaultSubject.value);
  }

  // Year select handling
  if (yearSelect) {
    yearSelect.addEventListener("change", function () {
      if (this.value === "other") {
        otherYearDiv.style.display = "block";
      } else {
        otherYearDiv.style.display = "none";
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
        "input[required], select[required]",
      );
      let isValid = true;

      requiredInputs.forEach((input) => {
        if (!input.value) {
          isValid = false;
          input.style.borderColor = "red";
        }
      });

      if (!isValid) {
        e.preventDefault();
        alert("Please fill in all required fields");
      }
    });
  });
});
