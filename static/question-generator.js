document.addEventListener("DOMContentLoaded", function () {
    const config = JSON.parse(document.getElementById("config").textContent);
    
    const styleBlock = `
    <style>
        .checkboxes label.disabled {
            color: #999;
            text-decoration: line-through;
            background-color: #f5f5f5;
            cursor: not-allowed;
        }

        .checkboxes label.disabled:hover {
            background-color: #f5f5f5;
        }

        .all-selected-notice {
            color: #666;
            font-style: italic;
            padding: 8px;
            background-color: #f8f8f8;
            margin-top: 5px;
            border-radius: 4px;
            font-size: 0.9em;
        }
    </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styleBlock);
    
    // Track current education system
    let currentSystem = document.getElementById("board").value;
    
    // Function to handle ALL selection behavior
    // Function to handle ALL selection behavior
    function handleAllSelection(containerId, inputName) {
        const container = document.getElementById(containerId);
        const allCheckbox = container.querySelector(`input[value="ALL"]`);
        const otherCheckboxes = container.querySelectorAll(`input[name="${inputName}"]:not([value="ALL"])`);
        const closeButton = container.querySelector('.close-button');
        
        // Remove any existing notice
        const existingNotice = container.querySelector('.all-selected-notice');
        if (existingNotice) {
            existingNotice.remove();
        }

        if (allCheckbox.checked) {
            // Create notice
            const notice = document.createElement('div');
            notice.className = 'all-selected-notice';
            notice.textContent = 'Uncheck "ALL" to select individual items';
            
            // Insert notice after the close button
            if (closeButton && closeButton.nextSibling) {
                container.insertBefore(notice, closeButton.nextSibling);
            } else {
                container.insertBefore(notice, container.firstChild);
            }

            // Disable and strike through other options
            otherCheckboxes.forEach(cb => {
                cb.checked = false;
                cb.disabled = true;
                cb.parentElement.classList.add('disabled');
            });
        } else {
            // Enable other options
            otherCheckboxes.forEach(cb => {
                cb.disabled = false;
                cb.parentElement.classList.remove('disabled');
            });
        }
    }
    
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
            handleAllSelection('componentCheckboxes', 'component');
            updateSelectTitle('componentCheckboxes', 'component-title');
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
                    handleAllSelection('componentCheckboxes', 'component');
                }
                updateSelectTitle('componentCheckboxes', 'component-title');
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
        
        // Reset topic title
        const topicTitleElement = document.querySelector('.topics-title');
        topicTitleElement.textContent = 'Select Topic(s)';
        
        if (!subjectName) {
            topicCheckboxes.innerHTML += '<p class="no-subject-message">Select a subject first</p>';
            return;
        }
        
        const subject = config[currentSystem].subjects.find(s => s.name === subjectName);
        if (subject) {
            // Add ALL option
            let allLabel = document.createElement("label");
            let allCheckbox = document.createElement("input");
            allCheckbox.type = "checkbox";
            allCheckbox.name = "topic";
            allCheckbox.value = "ALL";
            allCheckbox.addEventListener("change", function() {
                handleAllSelection('topicCheckboxes', 'topic');
                updateSelectTitle('topicCheckboxes', 'topics-title');
            });
            allLabel.appendChild(allCheckbox);
            allLabel.appendChild(document.createTextNode("ALL"));
            topicCheckboxes.appendChild(allLabel);
            
            // Add individual topics
            subject.topics.forEach(topic => {
                let label = document.createElement("label");
                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.name = "topic";
                checkbox.value = topic;
                checkbox.addEventListener("change", function() {
                    const allCheckbox = topicCheckboxes.querySelector('input[value="ALL"]');
                    if (this.checked) {
                        allCheckbox.checked = false;
                        handleAllSelection('topicCheckboxes', 'topic');
                    }
                    updateSelectTitle('topicCheckboxes', 'topics-title');
                });
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(topic));
                topicCheckboxes.appendChild(label);
            });
        }
    }
    
    // Function to update select title based on checked checkboxes
    function updateSelectTitle(checkboxesId, titleClass) {
        const checkboxes = document.getElementById(checkboxesId);
        const titleElement = document.querySelector(`.${titleClass}`);
        
        const checkedBoxes = checkboxes.querySelectorAll('input[type="checkbox"]:checked');
        
        if (checkedBoxes.length === 0) {
            titleElement.textContent = titleClass === 'topics-title' ? 'Select Topic(s)' : 
                                     titleClass === 'difficulty-title' ? 'Select Difficulty' : 
                                     'Select Component(s)';
        } else {
            const selectedNames = Array.from(checkedBoxes)
                .map(cb => cb.value)
                .join(', ');
            titleElement.textContent = selectedNames;
        }
    }
    
    // Initialize subject change listener
    const subjectSelect = document.getElementById("subject");
    if (subjectSelect) {
        subjectSelect.addEventListener("change", function() {
            populateTopics(this.value);
        });
    }
    
    // Initialize difficulty checkboxes
    const difficultyCheckboxes = document.getElementById("difficultyCheckboxes");
    
    // Add ALL option to difficulty
    let allLabel = document.createElement("label");
    let allCheckbox = document.createElement("input");
    allCheckbox.type = "checkbox";
    allCheckbox.name = "difficulty";
    allCheckbox.value = "ALL";
    allCheckbox.addEventListener("change", function() {
        handleAllSelection('difficultyCheckboxes', 'difficulty');
        updateSelectTitle('difficultyCheckboxes', 'difficulty-title');
    });
    allLabel.appendChild(allCheckbox);
    allLabel.appendChild(document.createTextNode("ALL"));
    difficultyCheckboxes.insertBefore(allLabel, difficultyCheckboxes.firstChild);
    
    // Add change listeners to existing difficulty checkboxes
    const difficultyBoxes = difficultyCheckboxes.querySelectorAll('input[type="checkbox"]:not([value="ALL"])');
    difficultyBoxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const allCheckbox = difficultyCheckboxes.querySelector('input[value="ALL"]');
            if (this.checked) {
                allCheckbox.checked = false;
                handleAllSelection('difficultyCheckboxes', 'difficulty');
            }
            updateSelectTitle('difficultyCheckboxes', 'difficulty-title');
        });
    });
    
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
    
    // Window global functions
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