

// JavaScript to dynamically populate topics based on selected subject
document.addEventListener('DOMContentLoaded', function () {
    const subjectSelect = document.getElementById('subject');
    const topicSelect = document.getElementById('topic');
    const config = document.getElementById('config').innerHTML;

    console.log(config);


    // Event listener for subject dropdown change
    subjectSelect.addEventListener('change', function () {
        const selectedSubjectName = subjectSelect.value;
        topicSelect.innerHTML = ''; // Clear current topics

        // Find the selected subject from config
        config.NEB.subjects.forEach(subject => {
            if (subject.name === selectedSubjectName) {
                // Populate topics for the selected subject
                subject.topics.forEach(topic => {
                    let option = document.createElement('option');
                    option.value = topic;
                    option.textContent = topic;
                    topicSelect.appendChild(option);
                });
            }
        });
    });

    // Initialize topics based on the default selected subject
    const initialSubjectName = subjectSelect.value;
    config.NEB.subjects.forEach(subject => {
        if (subject.name === initialSubjectName) {
            subject.topics.forEach(topic => {
                let option = document.createElement('option');
                option.value = topic;
                option.textContent = topic;
                topicSelect.appendChild(option);
            });
        }
    });
});