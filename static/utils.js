function goBack() {
  const referrer = document.referrer;
  const mySite = window.location.origin;

  if (referrer && referrer.startsWith(mySite)) {
    // Referrer is from the same site
    history.back();
    await(300);
    window.location.reload();
  } else {
    // Referrer is external or not present
    window.location.href = "/";
  }
}

function getRandomQuestion() {
  // Select all question links
  const questionLinks = document.querySelectorAll(".question-link");

  // Check if there are any questions available
  if (questionLinks.length === 0) {
    alert("No questions available.");
    return;
  }

  // Generate a random index
  const randomIndex = Math.floor(Math.random() * questionLinks.length);

  // Get the href of the randomly selected question
  const randomQuestionLink = questionLinks[randomIndex].href;

  // Navigate to the random question
  window.location.href = randomQuestionLink;
}

function showSolution(button) {
  const questionContainer = document.querySelector(".question-pdf");
  const solutionContainer = document.querySelector(".solution-pdf");

  const downloadQuestion = document.querySelector(".download-question");
  const downloadSolution = document.querySelector(".download-solution");

  const paperTitle = document.querySelector(".paper-title");

  const questionFull = document.querySelector(".question-full");
  const solutionFull = document.querySelector(".solution-full");

  const desktopButton = document.querySelector(".btn.solution-toggle");
  const mobileButton = document.getElementById("toggleViewMobileButton");

  const isShowingSolution = solutionContainer.style.display === "none";

  // Toggle content
  questionContainer.style.display = isShowingSolution ? "none" : "block";
  solutionContainer.style.display = isShowingSolution ? "block" : "none";
  downloadQuestion.style.display = isShowingSolution ? "none" : "block";
  downloadSolution.style.display = isShowingSolution ? "block" : "none";
  questionFull.style.display = isShowingSolution ? "none" : "block";
  solutionFull.style.display = isShowingSolution ? "block" : "none";

  paperTitle.innerText = paperTitle.innerText.replace(
    isShowingSolution ? "question paper" : "mark scheme",
    isShowingSolution ? "mark scheme" : "question paper"
  );

  const newBgColor = isShowingSolution ? "#F25C6A" : "#5d71e0";
  const newText = isShowingSolution ? "Hide Solution" : "Show Solution";

  // Update desktop button
  if (desktopButton) {
    desktopButton.style.backgroundColor = newBgColor;
    desktopButton.innerText = newText;
  }

  // Update mobile button
  if (mobileButton) {
    mobileButton.style.backgroundColor = newBgColor;

    // Find the <i> inside the button for Font Awesome
    const icon = mobileButton.querySelector("i");
    if (icon) {
      icon.classList.remove("fa-eye", "fa-eye-slash");
      icon.classList.add(isShowingSolution ? "fa-eye-slash" : "fa-eye");
    }
  }
}




function filterPaper(f, button) {
  // Ensure the filter value is treated as a string
  const filterValue = String(f).trim();

  // Select all elements with the class 'question-link'
  const questionLinks = document.querySelectorAll(".question-link");

  // Select all filter buttons
  const filterButtons = document.querySelectorAll(".filter-btn");

  // Remove the 'active' class from all buttons
  filterButtons.forEach((btn) => btn.classList.remove("active"));

  // Add the 'active' class to the clicked button (if provided)
  if (button) {
    button.classList.add("active");
  }

  // Handle the "clear" case
  if (filterValue === "clear") {
    questionLinks.forEach((link) => {
      link.parentElement.setAttribute("style", "display: flex;");
    });
    return;
  }

  questionLinks.forEach((link) => {
    // Extract the paper number between commas using regex
    const match = link.href.match(/,%20(\d+),/);
    const paperNumber = match ? match[1] : null;

    if (paperNumber) {
      // Create a dynamic regex pattern based on filterValue
      const pattern = new RegExp(`^${filterValue}\\d$`);

      if (pattern.test(paperNumber)) {
        link.parentElement.style.display = "flex";
      } else {
        link.parentElement.style.display = "none";
      }
    } else {
      link.parentElement.style.display = "none";
    }
  });
}

function openFullscreen(uuid, type) {
  window.open(`/view-pdf/${type}/${uuid}`);
}
