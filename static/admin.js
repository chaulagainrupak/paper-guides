// Initialize IndexedDB
const dbName = "paperGuidesJsonStorage";
const storeName = "jsonData";
const version = 1;

// Function to open database connection
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };
  });
}

// Function to save data to IndexedDB
async function saveJsonData(data) {
  try {
    const db = await openDB();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.put({
        id: "jsonData",
        data: data,
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error saving data:", error);
    throw error;
  }
}

// Function to retrieve data from IndexedDB
async function getJsonData() {
  try {
    const db = await openDB();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get("jsonData");
      request.onsuccess = () =>
        resolve(request.result ? request.result.data : null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error retrieving data:", error);
    throw error;
  }
}

// Initial fetch on page load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const jsonData = document.getElementById("json-data").textContent;
    const currentData = JSON.parse(jsonData);

    // Get stored data from IndexedDB
    const storedData = await getJsonData();

    if (storedData) {
      // Find missing hashes
      const missingHashes = [];
      const removedHashes = [];

      // Check for missing hashes
      currentData.questions.forEach((question) => {
        if (
          !storedData.questions.find(
            (q) => q.questionFileHash === question.questionFileHash,
          )
        ) {
          missingHashes.push(question.questionFileHash);
        }
      });
      currentData.papers.forEach((paper) => {
        if (
          !storedData.papers.find(
            (p) => p.questionFileHash === paper.questionFileHash,
          )
        ) {
          missingHashes.push(paper.questionFileHash);
        }
      });

      // Check for removed hashes
      storedData.questions.forEach((question) => {
        if (
          !currentData.questions.find(
            (q) => q.questionFileHash === question.questionFileHash,
          )
        ) {
          removedHashes.push(question.questionFileHash);
        }
      });

      // Update IndexedDB by removing data for hashes that are no longer present on the server
      if (removedHashes.length > 0) {
        const updatedData = {
          questions: storedData.questions.filter(
            (q) => !removedHashes.includes(q.questionFileHash),
          ),
          papers: storedData.papers.filter(
            (p) => !removedHashes.includes(p.questionFileHash),
          ),
        };
        await saveJsonData(updatedData);

        location.reload(true);
      }

      storedData.papers.forEach((paper) => {
        if (
          !currentData.papers.find(
            (p) => p.questionFileHash === paper.questionFileHash,
          )
        ) {
          removedHashes.push(paper.questionFileHash);
        }
      });

      // If there are missing hashes, fetch new data
      if (missingHashes.length > 0) {
        fetch("/getNewData", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hashes: missingHashes }),
        })
          .then((response) => response.json())
          .then(async (newData) => {
            // Merge the new data with existing data
            const mergedData = {
              questions: [...storedData.questions, ...newData.questions],
              papers: [...storedData.papers, ...newData.papers],
            };

            // Save merged data to IndexedDB
            await saveJsonData(mergedData);

            // Render the merged data
            renderData(mergedData);
          })
          .catch((error) => console.error("Error:", error));
      } else {
        // Render existing data if no missing hashes
        renderData(storedData);
      }
    } else {
      // If no stored data exists, fetch all data
      fetch("/getNewData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "all" }),
      })
        .then((response) => response.json())
        .then(async (data) => {
          // Store the data in IndexedDB
          await saveJsonData(data);

          // Render the data
          renderData(data);
        })
        .catch((error) => console.error("Error:", error));
    }
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});

// Function to render the data (unchanged)
function renderData(data) {
  // Get the existing question and paper sections
  const questionSection = document.querySelector(".section:first-of-type");
  const paperSection = document.querySelector(".section:last-of-type");

  // Clear the existing question and paper sections
  questionSection.innerHTML = "";
  paperSection.innerHTML = "";

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

  // Render the images and PDFs
  document
    .querySelectorAll(".question-image, .solution-image")
    .forEach((element) => {
      const base64Data = element.getAttribute("data-compressed");
      renderImageFromElement(element, base64Data);
    });
  document.querySelectorAll(".paper-pdf").forEach((element) => {
    const base64Data = element.getAttribute("data-compressed");
    renderPDFElement(element, base64Data);
  });
}

// Function to create a question card (unchanged)
function createQuestionCard(question) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.setAttribute("data-compressed", JSON.stringify(question));

  const questionDetailsDiv = document.createElement("div");
  questionDetailsDiv.innerHTML = `
                    <h3>Question Details</h3>
                    <p><strong>Subject:</strong> ${question.subject}</p>
                    <p><strong>Topic:</strong> ${question.topic}</p>
                    <p><strong>Difficulty:</strong> ${question.difficulty}/5</p>
                    <p><strong>Board:</strong> ${question.board}</p>
                    <p><strong>Level:</strong> ${question.level}</p>
                    <p><strong>Component:</strong> ${question.component}</p>
                `;
  card.appendChild(questionDetailsDiv);

  const questionImageDiv = document.createElement("div");
  questionImageDiv.classList.add("image-container");
  questionImageDiv.innerHTML = `
                    <h4>Question:</h4>
                    <div class="question-image" data-compressed="${question.questionBlob}"></div>
                `;
  card.appendChild(questionImageDiv);

  const solutionImageDiv = document.createElement("div");
  solutionImageDiv.classList.add("image-container");
  solutionImageDiv.innerHTML = `
                    <h4>Solution:</h4>
                    <div class="solution-image" data-compressed="${question.solutionBlob}"></div>
                `;
  card.appendChild(solutionImageDiv);

  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("actions");
  actionsDiv.innerHTML = `
                    <button onclick="handleAction('approve', 'question', '${question.uuid}')" class="button approve">Approve</button>
                    <button onclick="handleAction('edit', 'question', '${question.uuid}')" class="button edit">Edit</button>
                    <button onclick="deleteItem('question', '${question.uuid}')" class="button delete">Delete</button>
                `;
  card.appendChild(actionsDiv);

  return card;
}

// Function to create a paper card (unchanged)
function createPaperCard(paper) {
  const card = document.createElement("div");
  card.classList.add("card");

  const paperDetailsDiv = document.createElement("div");
  paperDetailsDiv.innerHTML = `
                    <h3>Paper Details</h3>
                    <p><strong>Subject:</strong> ${paper.subject}</p>
                    <p><strong>Year:</strong> ${paper.year}</p>
                    <p><strong>Component:</strong> ${paper.component}</p>
                    <p><strong>Board:</strong> ${paper.board}</p>
                    <p><strong>Level:</strong> ${paper.level}</p>
                `;
  card.appendChild(paperDetailsDiv);

  const pdfDiv = document.createElement("div");
  pdfDiv.classList.add("pdf-container");
  pdfDiv.innerHTML = `
                    <h4>Question Paper:</h4>
                    <div class="paper-pdf" data-compressed="${paper.questionBlob}">
                        <object type="application/pdf" width="100%" height="600px">
                            <p>Your browser doesn't support embedded PDFs.
                               <a class="pdf-download" download="document.pdf">Download the PDF</a> instead.</p>
                        </object>
                    </div>
                `;
  card.appendChild(pdfDiv);

  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("actions");
  actionsDiv.innerHTML = `
                    <button onclick="handleAction('approve', 'paper', '${paper.uuid}')" class="button approve">Approve</button>
                    <button onclick="deleteItem('paper', '${paper.uuid}')" class="button delete">Delete</button>
                `;
  card.appendChild(actionsDiv);

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
    })
      .then((response) => {
        if (response.ok) {
          window.location.reload();
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

// Delete function
function deleteItem(type, uuid) {
  if (confirm(`Are you sure you want to delete this ${type}?`)) {
    fetch(`/delete_${type}/${uuid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          window.location.reload();
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

// Handle other actions (approve, edit)
function handleAction(action, type, uuid) {
  fetch(`/${action}_${type}/${uuid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      window.location.reload();
    })
    .catch((error) => {
      console.error("Error:", error);
      alert(
        `An error occurred while processing your request: ${error.message}`,
      );
    });
}
