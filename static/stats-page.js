        // Parse the JSON data from the hidden div
        const chartDataDiv = document.getElementById('chart-data').innerText;
        const statsData = JSON.parse(chartDataDiv);
        
        // Color settings for approval status
        const approvalColors = {
            approved: {
                background: 'rgba(75, 192, 92, 0.2)',  // Light green
                border: 'rgb(75, 192, 92)'            // Green
            },
            unapproved: {
                background: 'rgba(255, 99, 132, 0.2)', // Light red
                border: 'rgb(255, 99, 132)'           // Red
            }
        };

        // Enhanced subject colors with base colors and transparent versions
        const subjectColors = {
            'Accounts': {
                base: 'rgb(255, 99, 132)',      // Bright Pink
                transparent: 'rgba(255, 99, 132, 0.2)'
            },
            'Biology': {
                base: 'rgb(46, 204, 113)',      // Emerald Green
                transparent: 'rgba(46, 204, 113, 0.2)'
            },
            'Chemistry': {
                base: 'rgb(52, 152, 219)',      // Blue
                transparent: 'rgba(52, 152, 219, 0.2)'
            },
            'Compulsory Maths': {
                base: 'rgb(155, 89, 182)',      // Purple
                transparent: 'rgba(155, 89, 182, 0.2)'
            },
            'Computer': {
                base: 'rgb(241, 196, 15)',      // Yellow
                transparent: 'rgba(241, 196, 15, 0.2)'
            },
            'Economics': {
                base: 'rgb(230, 126, 34)',      // Orange
                transparent: 'rgba(230, 126, 34, 0.2)'
            },
            'English': {
                base: 'rgb(26, 188, 156)',      // Turquoise
                transparent: 'rgba(26, 188, 156, 0.2)'
            },
            'Nepali': {
                base: 'rgb(231, 76, 60)',       // Red
                transparent: 'rgba(231, 76, 60, 0.2)'
            },
            'Optional Maths': {
                base: 'rgb(142, 68, 173)',      // Wisteria Purple
                transparent: 'rgba(142, 68, 173, 0.2)'
            },
            'Physics': {
                base: 'rgb(41, 128, 185)',      // Blue
                transparent: 'rgba(41, 128, 185, 0.2)'
            }
        };

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
                labels: ['Questions', 'Papers'],
                datasets: [
                    {
                        label: 'Approved',
                        data: [
                            statsData.overall.questions.approved,
                            statsData.overall.papers.approved
                        ],
                        backgroundColor: approvalColors.approved.background,
                        borderColor: approvalColors.approved.border,
                        borderWidth: 1
                    },
                    {
                        label: 'Unapproved',
                        data: [
                            statsData.overall.questions.unapproved,
                            statsData.overall.papers.unapproved
                        ],
                        backgroundColor: approvalColors.unapproved.background,
                        borderColor: approvalColors.unapproved.border,
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

        // Create per-level subject distribution charts
        Object.keys(statsData.byLevel).forEach(level => {
            // Create container for this level
            const levelContainer = document.createElement('div');
            levelContainer.className = 'level-chart-container';
            levelContainer.style.marginBottom = '2rem';
            
            // Create canvas for the chart
            const canvas = document.createElement('canvas');
            canvas.id = `level${level}Chart`;
            canvas.style.height = '400px';
            
            // Add canvas to level container
            levelContainer.appendChild(canvas);
            document.querySelector('.charts-container').appendChild(levelContainer);
            
            const levelData = statsData.byLevel[level];
            const subjects = Object.keys(levelData.subjects);
            
            // Allows adding `Level 10` to the front of the string so `Level A levels` is not seen on the stats page. 
            if (level != 'A level' && level != 'As level') {
                level = "Level " + String(level);
            }
            
            new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: subjects,
                    datasets: [
                        {
                            label: 'Approved Questions',
                            data: subjects.map(subject => levelData.subjects[subject].approved),
                            backgroundColor: subjects.map(subject => subjectColors[subject].transparent),
                            borderColor: subjects.map(subject => subjectColors[subject].base),
                            borderWidth: 1
                        },
                        {
                            label: 'Unapproved Questions',
                            data: subjects.map(subject => levelData.subjects[subject].unapproved),
                            backgroundColor: subjects.map(() => approvalColors.unapproved.background),
                            borderColor: subjects.map(() => approvalColors.unapproved.border),
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
                            text: `${level} Subject Distribution`
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