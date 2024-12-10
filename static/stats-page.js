// Function to generate random color
function getRandomColor() {
    return `rgba(${randomNum(255)}, ${randomNum(255)}, ${randomNum(255)}, 0.3)`
}

function randomNum(val){
    return Math.floor(Math.random() * val);
}

// Parse the JSON data from the hidden div
const chartDataDiv = document.getElementById('chart-data').innerText;
const statsData = JSON.parse(chartDataDiv);

// Common chart options
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            font: {
                size: 16
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(0, 0, 0, 0.1)'
            }
        },
        x: {
            grid: {
                display: false
            }
        }
    }
};

// Create overall stats chart
const overallCtx = document.getElementById('overallChart');
new Chart(overallCtx, {
    type: 'bar',
    data: {
        labels: ['Questions', 'Papers', 'Topicals'],
        datasets: [
            {
                label: 'Approved',
                data: [
                    statsData.overall.questions.approved,
                    statsData.overall.papers.approved,
                    statsData.overall.topicals.approved
                ],
                backgroundColor: 'rgba(75, 192, 92, 0.2)', // Light green
                borderColor: 'rgb(75, 192, 92)', // Green
                borderWidth: 1
            },
            {
                label: 'Unapproved',
                data: [
                    statsData.overall.questions.unapproved,
                    statsData.overall.papers.unapproved,
                    statsData.overall.topicals.unapproved
                ],
                backgroundColor: 'rgba(255, 99, 132, 0.2)', // Light red
                borderColor: 'rgb(255, 99, 132)', // Red
                borderWidth: 1
            }
        ]
    },
    options: {
        ...commonOptions,
        plugins: {
            ...commonOptions.plugins,
            title: {
                ...commonOptions.plugins.title,
                text: 'Overall Status'
            }
        }
    }
});

// Create per-level subject distribution charts for each board
Object.keys(statsData.byBoard).forEach(board => {
    const boardData = statsData.byBoard[board];

    Object.keys(boardData.levels).forEach(level => {
        // Create container for this level
        const levelContainer = document.createElement('div');
        levelContainer.className = 'level-chart-container';
        levelContainer.style.marginBottom = '2rem';
        
        // Create canvas for the chart
        const canvas = document.createElement('canvas');
        canvas.id = `level${board}_${level}Chart`;
        canvas.style.height = '400px';
        
        // Add canvas to level container
        levelContainer.appendChild(canvas);
        document.querySelector('.charts-container').appendChild(levelContainer);
        
        const levelData = boardData.levels[level];
        const subjects = Object.keys(levelData.subjects);

        // Adjust level display
        let levelLabel = level;
        if (level !== 'A level' && level !== 'AS level') {
            levelLabel = "Level " + level;
        }

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: subjects,
                datasets: [
                    {
                        label: 'Approved Questions',
                        data: subjects.map(subject => levelData.subjects[subject].approved),
                        backgroundColor: subjects.map(() => getRandomColor()),
                        borderColor: subjects.map(() => getRandomColor()),
                        borderWidth: 1
                    },
                    {
                        label: 'Unapproved Questions',
                        data: subjects.map(subject => levelData.subjects[subject].unapproved),
                        backgroundColor: subjects.map(() => 'rgba(255, 99, 132, 0.2)'), // Light red
                        borderColor: subjects.map(() => 'rgb(255, 99, 132)'), // Red
                        borderWidth: 1
                    },
                    {
                        label: 'Approved Papers',
                        data: subjects.map(subject => levelData.subjects[subject].approvedPapers),
                        backgroundColor: subjects.map(() => getRandomColor()),
                        borderColor: subjects.map(() => getRandomColor()),
                        borderWidth: 1
                    },
                    {
                        label: 'Unapproved Papers',
                        data: subjects.map(subject => levelData.subjects[subject].unapprovedPapers),
                        backgroundColor: subjects.map(() => 'rgba(255, 99, 132, 0.2)'), // Light red
                        borderColor: subjects.map(() => 'rgb(255, 99, 132)'), // Red
                        borderWidth: 1
                    },
                    {
                        label: 'Approved Topicals',
                        data: subjects.map(subject => levelData.subjects[subject].approvedTopicals),
                        backgroundColor: subjects.map(() => getRandomColor()),
                        borderColor: subjects.map(() => getRandomColor()),
                        borderWidth: 1
                    },
                    {
                        label: 'Unapproved Topicals',
                        data: subjects.map(subject => levelData.subjects[subject].unapprovedTopicals),
                        backgroundColor: subjects.map(() => 'rgba(255, 99, 132, 0.2)'), // Light red
                        borderColor: subjects.map(() => 'rgb(255, 99, 132)'), // Red
                        borderWidth: 1
                    }

                ]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        ...commonOptions.plugins.title,
                        text: `${levelLabel} - ${board} Subject Distribution For Approved & Unapproved: Questions & Papers`
                    }
                },
                scales: {
                    ...commonOptions.scales,
                    x: {
                        ...commonOptions.scales.x,
                        ticks: {
                            autoSkip: false,
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    });
});