
document.addEventListener("DOMContentLoaded", async () => {
  try {
        fetch("/getNewData", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          }
        })
          .then((response) => response.json())
          .then(async (newData) => {
            renderData(newData);
          })
          .catch((error) => console.error("Error fetching new data:", error));
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});


// Function to render the data (unchanged)
function renderData(data) {
  // Get the existing question and paper sections
  const questionSection = document.querySelector(".section:first-of-type");
  const paperSection = document.querySelector(".section:last-of-type");

  if (!questionSection || !paperSection) {
    return;
  }

  // Render the questions
  data.questions.forEach((question, count) => {
    const questionCard = createQuestionCard(question, count + 1);
    questionSection.appendChild(questionCard);
  });

  // Render the papers
  data.papers.forEach((paper, count) => {
    const paperCard = createPaperCard(paper, count + 1);
    paperSection.appendChild(paperCard);
  });

}

// Function to create a question card (unchanged)
function createQuestionCard(question, count) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.setAttribute("data-compressed", JSON.stringify(question));

  const questionDetailsDiv = document.createElement("div");
  questionDetailsDiv.innerHTML = `
                    <a href='/admin/question/${question.uuid}' style='text-decoration: none; color: black;'>
                    <h1>${count}) Question Details</h1>
                    <h2 style='color: #5d71e0;'><strong>Subject:</strong> ${question.subject}</h2>
                    <h2><strong>Topic:</strong> ${question.topic}</h2>
                    <h2><strong>Difficulty:</strong> ${question.difficulty}/5</h2>
                    <h2><strong>Board:</strong> ${question.board}</h2>
                    <h2><strong>Level:</strong> ${question.level}</h2>
                    <h2><strong>Component:</strong> ${question.component}</h2>
                    <h2 style='color: #5d71e0;'><strong>Submitted by:</strong> ${question.submittedBy}</h2>
                    <h2><strong>Submitted on:</strong> ${question.submittedOn}</h2>
                    <h2><strong>UUID:</strong> ${question.uuid}</h2>
                    </a>
                `;
  card.appendChild(questionDetailsDiv);
  return card;
}

// Function to create a paper card (unchanged)
function createPaperCard(paper, count) {
  const card = document.createElement("div");
  card.classList.add("card");

  const paperDetailsDiv = document.createElement("div");
  paperDetailsDiv.innerHTML = `
                    <a href='/admin/paper/${paper.uuid}' style='text-decoration: none; color: black;'>
                    <h1 style='color: #F25C6A;'>${count}) Paper Details</h1>
                    <h2><strong>Subject:</strong> ${paper.subject}</h2>
                    <h2><strong>Year:</strong> ${paper.year}</h2>
                    <h2><strong>Component:</strong> ${paper.component}</h2>
                    <h2><strong>Board:</strong> ${paper.board}</h2>
                    <h2><strong>Level:</strong> ${paper.level}</h2>
                    <h2 style='color: #F25C6A;'><strong>Submitted by:</strong> ${paper.submittedBy}</h2>
                    <h2><strong>Submitted on:</strong> ${paper.submittedOn}</h2>
                    <h2><strong>UUID:</strong> ${paper.uuid}</h2>
                    </a>
                `;
  card.appendChild(paperDetailsDiv);
  return card;
}

// Delete existing item function
function deleteExistingItem() {
  const itemType = document.getElementById("itemType").value;
  const uuid = document.getElementById("uuid").value.trim();

  if (!uuid) {
    alert("Please enter a UUID");
    return;
  }

  if (confirm(`Are you sure you want to delete this ${itemType}?`)) {
    fetch(`/delete_${itemType}/${uuid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          alert(`${itemType} deleted successfully`);
          document.getElementById("uuid").value = "";
        } else {
          throw new Error("Failed to delete item");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while deleting the item");
      });
  }
}

// Regular delete function
function deleteItem(type, uuid) {
  if (confirm(`Are you sure you want to delete this ${type}?`)) {
    fetch(`/delete_${type}/${uuid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
        if (response) {
          window.location.href = "/admin";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while deleting the item");
      });
  }
}

function approveItem(type, uuid) {
  if (confirm(`Are you sure you want to approve this ${type}?`)) {
    fetch(`/approve_${type}/${uuid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if(response.status == 200) {
          alert(`${type} approved successfully`);
          window.location.reload(); 
        }else if (response.status == 400) {
          alert(`paper already approved and exists in the database`);
        }else {
          alert('An error occurred while approving the item, check console');
          console.log(response);
          throw new Error("Failed to approve item");
        }
  })
}
}

function giveAdmin() {
  const username = document.getElementById('username').value;
  fetch('/admin/give_admin/' + username, {
      method: 'POST'
  }).then((response) => {
      if (response.ok) {
        alert(`Admin rights given to ${username}`);
          username.value = '';
          window.location.href = "/admin";

      }
  }).catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while giving admin");
  });

}