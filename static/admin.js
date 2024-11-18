
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
  data.questions.forEach((question) => {
    const questionCard = createQuestionCard(question);
    questionSection.appendChild(questionCard);
  });

  // Render the papers
  data.papers.forEach((paper) => {
    const paperCard = createPaperCard(paper);
    paperSection.appendChild(paperCard);
  });

}

// Function to create a question card (unchanged)
function createQuestionCard(question) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.setAttribute("data-compressed", JSON.stringify(question));

  const questionDetailsDiv = document.createElement("div");
  questionDetailsDiv.innerHTML = `
                    <a href='/admin/question/${question.uuid}' style='text-decoration: none; color: #5d71e0;'>
                    <h3>Question Details</h3>
                    <p><strong>Subject:</strong> ${question.subject}</p>
                    <p><strong>Topic:</strong> ${question.topic}</p>
                    <p><strong>Difficulty:</strong> ${question.difficulty}/5</p>
                    <p><strong>Board:</strong> ${question.board}</p>
                    <p><strong>Level:</strong> ${question.level}</p>
                    <p><strong>Component:</strong> ${question.component}</p>
                    </a>
                `;
  card.appendChild(questionDetailsDiv);
  return card;
}

// Function to create a paper card (unchanged)
function createPaperCard(paper) {
  const card = document.createElement("div");
  card.classList.add("card");

  const paperDetailsDiv = document.createElement("div");
  paperDetailsDiv.innerHTML = `
                    <a href='/admin/paper/${paper.uuid}' style='text-decoration: none; color: #F25C6A;'>
                    <h3>Paper Details</h3>
                    <p><strong>Subject:</strong> ${paper.subject}</p>
                    <p><strong>Year:</strong> ${paper.year}</p>
                    <p><strong>Component:</strong> ${paper.component}</p>
                    <p><strong>Board:</strong> ${paper.board}</p>
                    <p><strong>Level:</strong> ${paper.level}</p>
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
        if (response.ok) {
          window.location.reload();
          window.location.href = '/admin';
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

function approveItem(type, uuid) {
  if (confirm(`Are you sure you want to approve this ${type}?`)) {
    fetch(`/approve_${type}/${uuid}`, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      }   
    }).then((response) => {
      if (response.ok) {
        window.location.reload();
        window.location.href = '/admin';
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