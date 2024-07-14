    document.addEventListener('DOMContentLoaded', function () {
        const questionButton = document.getElementById('question_button');
        const paperButton = document.getElementById('paper_button');
        const questionForm = document.getElementById('question_form');
        const paperForm = document.getElementById('paper_form');
        const subjectSelect = document.getElementById('subject');
        const topicSelect = document.getElementById('topic');
        const yearSelect = document.getElementById('year');
        const otherYearDiv = document.getElementById('other_year_div');
        const config = JSON.parse(document.getElementById('config').textContent);


        const questionFile = document.getElementById('questionFile');

        questionButton.addEventListener('click', function() {
            questionForm.style.display = 'block';
            paperForm.style.display = 'none';
        });

        paperButton.addEventListener('click', function() {
            questionForm.style.display = 'none';
            paperForm.style.display = 'block';
        });
        function populateTopics(subjectName) {
            topicSelect.innerHTML = '';
            config.NEB.subjects.forEach(subject => {
                if (subject.name === subjectName) {
                    subject.topics.forEach(topic => {
                        let option = document.createElement('option');
                        option.value = topic;
                        option.textContent = topic;
                        topicSelect.appendChild(option);
                    });
                }
            });
        }

        subjectSelect.addEventListener('change', function () {
            populateTopics(this.value);
        });

        // Initialize topics for the default selected subject
        populateTopics(subjectSelect.value);

        yearSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                otherYearDiv.style.display = 'block';
            } else {
                otherYearDiv.style.display = 'none';
            }
        });
    });
