document.addEventListener("DOMContentLoaded", function () {
  const config = JSON.parse(document.getElementById("config").textContent);

  function populateTopics(subjectName) {
    const topicCheckboxes = document.getElementById("topicCheckboxes");
    if (!topicCheckboxes) return;
    topicCheckboxes.innerHTML =
      '<span class="close-button" onclick="closeCheckboxes(\'topicCheckboxes\')">×</span>';
    if (!subjectName) {
      topicCheckboxes.innerHTML +=
        '<p class="no-subject-message">Select a subject first</p>';
      return;
    }
    const subject = config.NEB.subjects.find((s) => s.name === subjectName);
    if (subject) {
      subject.topics.forEach((topic) => {
        let label = document.createElement("label");
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "topic";
        checkbox.value = topic;
        label.appendChild(checkbox);
        let span = document.createElement("span");
        span.textContent = topic;
        label.appendChild(span);
        topicCheckboxes.appendChild(label);
      });
    }
  }

  const subjectSelect = document.getElementById("subject");
  if (subjectSelect) {
    subjectSelect.addEventListener("change", function () {
      populateTopics(this.value);
    });
    // Initialize topics for the default selected subject
    populateTopics(subjectSelect.value);
  }

  // Add validation for checkboxes (all checkboxes required)
  const form = document.querySelector("#questionForm");
  form.addEventListener("submit", function (event) {
    const subject = document.getElementById("subject").value;
    const topicCheckboxes = document.querySelectorAll('input[name="topic"]');
    const difficultyCheckboxes = document.querySelectorAll(
      'input[name="difficulty"]',
    );
    const componentCheckboxes = document.querySelectorAll(
      'input[name="component"]',
    );

    // Check if a subject is selected
    if (!subject) {
      alert("Please select a subject.");
      event.preventDefault();
      return;
    }

    // Check if at least one topic is selected
    const isTopicChecked = Array.from(topicCheckboxes).some((cb) => cb.checked);
    if (!isTopicChecked) {
      alert("Please select at least one topic.");
      event.preventDefault();
      return;
    }

    // Check if at least one difficulty level is selected
    const isDifficultyChecked = Array.from(difficultyCheckboxes).some(
      (cb) => cb.checked,
    );
    if (!isDifficultyChecked) {
      alert("Please select at least one difficulty level.");
      event.preventDefault();
      return;
    }

    // Check if at least one component is selected
    const isComponentChecked = Array.from(componentCheckboxes).some(
      (cb) => cb.checked,
    );
    if (!isComponentChecked) {
      alert("Please select at least one component.");
      event.preventDefault();
      return;
    }
  });
});

function toggleCheckboxes(checkboxesId) {
  var checkboxes = document.getElementById(checkboxesId);
  if (checkboxes.style.display === "none" || checkboxes.style.display === "") {
    checkboxes.style.display = "block";
    document.querySelectorAll(".checkboxes").forEach(function (el) {
      if (el.id !== checkboxesId) {
        el.style.display = "none";
      }
    });
  } else {
    checkboxes.style.display = "none";
  }
}

function closeCheckboxes(checkboxesId) {
  var checkboxes = document.getElementById(checkboxesId);
  checkboxes.style.display = "none";
}

// Close checkboxes when clicking outside
document.addEventListener("click", function (event) {
  if (!event.target.closest(".multiselect")) {
    var allCheckboxes = document.querySelectorAll(".checkboxes");
    allCheckboxes.forEach(function (checkbox) {
      checkbox.style.display = "none";
    });
  }
});
