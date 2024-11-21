
function goBack() {
    const referrer = document.referrer;
    const mySite = window.location.origin;

    if (referrer && referrer.startsWith(mySite)) {
        // Referrer is from the same site
        history.back();
    } else {
        // Referrer is external or not present
        window.location.href = '/';
    }
}


function getRandomQuestion() {
    // Select all question links
    const questionLinks = document.querySelectorAll('.question-link');

    // Check if there are any questions available
    if (questionLinks.length === 0) {
        alert('No questions available.');
        return;
    }

    // Generate a random index
    const randomIndex = Math.floor(Math.random() * questionLinks.length);

    // Get the href of the randomly selected question
    const randomQuestionLink = questionLinks[randomIndex].href;

    // Navigate to the random question
    window.location.href = randomQuestionLink;
}
