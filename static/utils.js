
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


function showSolution(button) {
    const questionContainer = document.querySelector('.question-pdf');
    const solutionContainer = document.querySelector('.solution-pdf');
    const paperTitle = document.querySelector('.paper-title');

    if (solutionContainer.style.display === 'none') {
        questionContainer.style.display = 'none';
        solutionContainer.style.display = 'block';
        button.setAttribute('style', 'border: #F25C6A 2px solid; color: #F25C6A;');
        button.innerText = "Hide Solution";
        paperTitle.innerText = paperTitle.innerText.replace('question paper', 'mark scheme');
    }else {
        questionContainer.style.display = 'block';
        solutionContainer.style.display = 'none';
        button.setAttribute('style', 'border: #5d71e0 2px solid; color: #5d71e0;');
        button.innerText = "Show Solution";        
        paperTitle.innerText =paperTitle.innerText.replace('mark scheme', 'question paper');
    }
}

function filterPaper(f, button) {
    // Ensure the filter value is treated as a string
    const filterValue = String(f).trim();
    
    // Select all elements with the class 'question-link'
    const questionLinks = document.querySelectorAll('.question-link');
    
    // Select all filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Remove the 'active' class from all buttons
    filterButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add the 'active' class to the clicked button (if provided)
    if (button) {
        button.classList.add('active');
    }
    
    // Handle the "clear" case
    if (filterValue === 'clear') {
        questionLinks.forEach(link => {
            link.setAttribute('style', 'display: block;');
        });
        return;
    }



    questionLinks.forEach(link => {
        // Extract the paper number between commas using regex
        const match = link.href.match(/,%20(\d+),/);
        const paperNumber = match ? match[1] : null;
    
        if (paperNumber) {
            // Create a dynamic regex pattern based on filterValue
            const pattern = new RegExp(`^${filterValue}\\d$`);
            
            if (pattern.test(paperNumber)) {
                link.style.display = 'block';
            } else {
                link.style.display = 'none';
            }
        } else {
            link.style.display = 'none';
        }
    });
}


function onTurnstileSuccess() {
    document.querySelectorAll('.submit-btn').forEach((button) => {
        button.disabled = false;
    });
}

function onTurnstileExpired() {
    document.querySelectorAll('.submit-btn').forEach((button) => {
        button.disabled = true;
    });
}