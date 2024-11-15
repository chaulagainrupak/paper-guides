document.addEventListener("DOMContentLoaded", function () {
  const config = JSON.parse(document.getElementById("config").textContent);
  
  // Track current education system
  let currentSystem = "NEB"; // Default to NEB
  
  // Add education system selector
  function initializeEducationSystem() {
      const boardSelect = document.getElementById("board");
      if (boardSelect) {
          boardSelect.addEventListener("change", function() {
              currentSystem = this.value;
              updateFormForSystem(currentSystem);
          });
      }
  }
  
  function updateFormForSystem(system) {
      // Update levels
      const levelSelect = document.getElementById("level");
      levelSelect.innerHTML = '<option value="" disabled selected>Select Level</option>';
      config[system].levels.forEach(level => {
          const option = document.createElement("option");
          option.value = level;
          option.textContent = level;
          levelSelect.appendChild(option);
      });
      
      // Update subjects
      const subjectSelect = document.getElementById("subject");
      subjectSelect.innerHTML = '<option value="" disabled selected>Select Subject</option>';
      config[system].subjects.forEach(subject => {
          const option = document.createElement("option");
          option.value = subject.name;
          option.textContent = subject.name;
          subjectSelect.appendChild(option);
      });
      
      // Clear topics
      populateTopics("");
      
      // Update components
      updateComponents(system);
  }
  
  function updateComponents(system) {
      const componentCheckboxes = document.getElementById("componentCheckboxes");
      componentCheckboxes.innerHTML = '<span class="close-button" onclick="closeCheckboxes(\'componentCheckboxes\')">×</span>';
      
      // Add ALL option
      let allLabel = document.createElement("label");
      let allCheckbox = document.createElement("input");
      allCheckbox.type = "checkbox";
      allCheckbox.name = "component";
      allCheckbox.value = "ALL";
      allCheckbox.addEventListener("change", function() {
          const otherCheckboxes = componentCheckboxes.querySelectorAll('input[name="component"]:not([value="ALL"])');
          otherCheckboxes.forEach(cb => {
              cb.checked = false;
              cb.disabled = this.checked;
          });
      });
      allLabel.appendChild(allCheckbox);
      allLabel.appendChild(document.createTextNode("ALL"));
      componentCheckboxes.appendChild(allLabel);
      
      // Add individual components
      config[system].components.forEach(component => {
          let label = document.createElement("label");
          let checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.name = "component";
          checkbox.value = component;
          checkbox.addEventListener("change", function() {
              const allCheckbox = componentCheckboxes.querySelector('input[value="ALL"]');
              if (this.checked) {
                  allCheckbox.checked = false;
              }
          });
          label.appendChild(checkbox);
          label.appendChild(document.createTextNode(component));
          componentCheckboxes.appendChild(label);
      });
  }
  
  function populateTopics(subjectName) {
      const topicCheckboxes = document.getElementById("topicCheckboxes");
      if (!topicCheckboxes) return;
      
      topicCheckboxes.innerHTML = '<span class="close-button" onclick="closeCheckboxes(\'topicCheckboxes\')">×</span>';
      
      if (!subjectName) {
          topicCheckboxes.innerHTML += '<p class="no-subject-message">Select a subject first</p>';
          return;
      }
      
      const subject = config[currentSystem].subjects.find(s => s.name === subjectName);
      if (subject) {
          subject.topics.forEach(topic => {
              let label = document.createElement("label");
              let checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.name = "topic";
              checkbox.value = topic;
              label.appendChild(checkbox);
              label.appendChild(document.createTextNode(topic));
              topicCheckboxes.appendChild(label);
          });
      }
  }
  
  // Initialize subject change listener
  const subjectSelect = document.getElementById("subject");
  if (subjectSelect) {
      subjectSelect.addEventListener("change", function() {
          populateTopics(this.value);
      });
  }
  
  // Initialize board change listener
  const boardSelect = document.getElementById("board");
  if (boardSelect) {
      boardSelect.addEventListener("change", function() {
          updateFormForSystem(this.value);
      });
  }
  
  // Initialize the form with default system
  initializeEducationSystem();
  updateFormForSystem(currentSystem);
  
  // Make functions globally available
  window.toggleCheckboxes = function(checkboxesId) {
      const checkboxes = document.getElementById(checkboxesId);
      const isCurrentlyHidden = checkboxes.style.display === "none" || checkboxes.style.display === "";
      
      document.querySelectorAll(".checkboxes").forEach(el => {
          el.style.display = "none";
      });
      
      if (isCurrentlyHidden) {
          checkboxes.style.display = "block";
      }
  };
  
  window.closeCheckboxes = function(checkboxesId) {
      document.getElementById(checkboxesId).style.display = "none";
  };
  
  // Close checkboxes when clicking outside
  document.addEventListener("click", function(event) {
      if (!event.target.closest(".multiselect")) {
          document.querySelectorAll(".checkboxes").forEach(checkbox => {
              checkbox.style.display = "none";
          });
      }
  });
});
