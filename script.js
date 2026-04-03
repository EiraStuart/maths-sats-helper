// Data Structure
let appData = {
    stats: {
        totalProblems: 0,
        correctAnswers: 0,
        bestStreak: 0,
        currentStreak: 0,
        topicStats: {
            algebra: { solved: 0, correct: 0 },
            geometry: { solved: 0, correct: 0 },
            ratio: { solved: 0, correct: 0 },
            statistics: { solved: 0, correct: 0 },
            fractions: { solved: 0, correct: 0 },
            percentages: { solved: 0, correct: 0 }
        },
        quizzesCompleted: 0,
        gamesPlayed: 0
    },
    currentProblem: null,
    currentPastPaper: null,
    currentPastPaperFilter: '',
    weakSpots: {
        algebra: false,
        geometry: false,
        ratio: false,
        statistics: false,
        fractions: false,
        percentages: false
    },
    questionHistory: {}, // Track when each question was last shown
    quizState: {
        active: false,
        questions: [],
        currentIndex: 0,
        startTime: null,
        userAnswers: []
    },
    achievements: {
        'first-solve': { name: 'First Steps', desc: 'Solve your first problem', unlocked: false, icon: '👣' },
        'ten-solved': { name: 'Getting Started', desc: 'Solve 10 problems', unlocked: false, icon: '🎯' },
        'fifty-solved': { name: 'Math Master', desc: 'Solve 50 problems', unlocked: false, icon: '🧠' },
        'perfect-quiz': { name: 'Quiz Champion', desc: 'Get 100% on a quiz', unlocked: false, icon: '🏆' },
        'streak-five': { name: 'On Fire!', desc: 'Get 5 correct in a row', unlocked: false, icon: '🔥' },
        'play-game': { name: 'Game Master', desc: 'Play your first game', unlocked: false, icon: '🎮' },
        'all-topics': { name: 'Polymath', desc: 'Practice all topics', unlocked: false, icon: '🌟' }
    }
};

// Load data from localStorage
function loadData() {
    try {
        const saved = localStorage.getItem('mathsSATsData');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge parsed values into default appData to avoid missing keys
            appData = Object.assign({}, appData, parsed);
            // Ensure nested objects exist
            appData.stats = Object.assign({}, appData.stats || {}, parsed.stats || {});
            appData.weakSpots = Object.assign({}, appData.weakSpots || {}, parsed.weakSpots || {});
            appData.quizState = Object.assign({}, appData.quizState || {}, parsed.quizState || {});
            appData.achievements = Object.assign({}, appData.achievements || {}, parsed.achievements || {});
            appData.questionHistory = Object.assign({}, appData.questionHistory || {}, parsed.questionHistory || {});
        }
    } catch (e) {
        console.warn('Failed to load saved data, resetting to defaults.', e);
        try { localStorage.removeItem('mathsSATsData'); } catch (er) {}
        // keep default appData
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('mathsSATsData', JSON.stringify(appData));
}


// Problem Database
const problems = {
    algebra: [
        {
            question: "Solve for x: 2x + 5 = 13",
            correct: "4",
            difficulty: "easy",
            steps: ["2x + 5 = 13", "2x = 13 - 5", "2x = 8", "x = 8 ÷ 2", "x = 4"]
        },
        {
            question: "Solve for x: 3x - 7 = 14",
            correct: "7",
            difficulty: "easy",
            steps: ["3x - 7 = 14", "3x = 14 + 7", "3x = 21", "x = 21 ÷ 3", "x = 7"]
        },
        {
            question: "Solve for x: x/2 + 3 = 8",
            correct: "10",
            difficulty: "medium",
            steps: ["x/2 + 3 = 8", "x/2 = 8 - 3", "x/2 = 5", "x = 5 × 2", "x = 10"]
        },
        {
            question: "Solve for x: 4(x - 2) = 12",
            correct: "5",
            difficulty: "medium",
            steps: ["4(x - 2) = 12", "4x - 8 = 12", "4x = 12 + 8", "4x = 20", "x = 5"]
        },
        {
            question: "Solve for x: 5x + 2x = 49",
            correct: "7",
            difficulty: "medium",
            steps: ["5x + 2x = 49", "7x = 49", "x = 49 ÷ 7", "x = 7"]
        },
        {
            question: "Solve for x: 2(3x - 4) = 4x + 8",
            correct: "8",
            difficulty: "hard",
            steps: ["2(3x - 4) = 4x + 8", "6x - 8 = 4x + 8", "6x - 4x = 8 + 8", "2x = 16", "x = 8"]
        }
    ],
    geometry: [
        {
            question: "What is the area of a rectangle with length 5 cm and width 3 cm?",
            correct: "15",
            difficulty: "easy",
            steps: ["Area = length × width", "Area = 5 × 3", "Area = 15 cm²"]
        },
        {
            question: "What is the perimeter of a square with side length 6 cm?",
            correct: "24",
            difficulty: "easy",
            steps: ["Perimeter = 4 × side", "Perimeter = 4 × 6", "Perimeter = 24 cm"]
        },
        {
            question: "Calculate the area of a triangle with base 8 cm and height 5 cm.",
            correct: "20",
            difficulty: "medium",
            steps: ["Area = ½ × base × height", "Area = ½ × 8 × 5", "Area = ½ × 40", "Area = 20 cm²"]
        },
        {
            question: "A circle has a radius of 7 cm. What is its circumference? (Use π ≈ 3.14)",
            correct: "43.96",
            difficulty: "medium",
            steps: ["C = 2πr", "C = 2 × 3.14 × 7", "C = 43.96 cm"]
        },
        {
            question: "What is the area of a circle with radius 5 cm? (Use π ≈ 3.14)",
            correct: "78.5",
            difficulty: "hard",
            steps: ["Area = πr²", "Area = 3.14 × 5²", "Area = 3.14 × 25", "Area = 78.5 cm²"]
        }
    ],
    ratio: [
        {
            question: "Simplify the ratio 12:8",
            correct: "3:2",
            difficulty: "easy",
            steps: ["12:8", "Divide both by 4", "3:2"]
        },
        {
            question: "If 3 apples cost £1.50, how much do 5 apples cost?",
            correct: "2.50",
            difficulty: "medium",
            steps: ["Cost per apple = £1.50 ÷ 3 = £0.50", "5 apples = £0.50 × 5 = £2.50"]
        },
        {
            question: "A recipe uses flour and sugar in the ratio 5:2. If you use 10 cups of flour, how much sugar do you need?",
            correct: "4",
            difficulty: "medium",
            steps: ["Ratio is 5:2 (flour:sugar)", "Flour used = 10 cups", "10 ÷ 5 = 2 (scale factor)", "Sugar = 2 × 2 = 4 cups"]
        },
        {
            question: "Expand: 3(2x + 5)",
            correct: "6x + 15",
            difficulty: "hard",
            steps: ["3(2x + 5)", "Multiply 3 by each term", "(3 × 2x) + (3 × 5)", "6x + 15"]
        }
    ],
    statistics: [
        {
            question: "Find the mean of: 3, 5, 7, 9",
            correct: "6",
            difficulty: "easy",
            steps: ["Mean = (3 + 5 + 7 + 9) ÷ 4", "Mean = 24 ÷ 4", "Mean = 6"]
        },
        {
            question: "Find the median of: 2, 5, 8, 1, 9",
            correct: "5",
            difficulty: "easy",
            steps: ["Order: 1, 2, 5, 8, 9", "Middle value (3rd of 5) = 5"]
        },
        {
            question: "Find the range of: 15, 8, 23, 12, 19",
            correct: "15",
            difficulty: "medium",
            steps: ["Range = Highest - Lowest", "Range = 23 - 8", "Range = 15"]
        },
        {
            question: "Find the mode of: 2, 3, 3, 5, 3, 7",
            correct: "3",
            difficulty: "hard",
            steps: ["Mode is the most frequent value", "3 appears 3 times (most frequent)", "Mode = 3"]
        }
    ],
    fractions: [
        {
            question: "What is 1/2 + 1/4?",
            correct: "3/4",
            difficulty: "easy",
            steps: ["1/2 + 1/4", "2/4 + 1/4", "3/4"]
        },
        {
            question: "What is 3/4 × 2/3?",
            correct: "1/2",
            difficulty: "easy",
            steps: ["3/4 × 2/3", "= (3 × 2)/(4 × 3)", "= 6/12", "= 1/2"]
        },
        {
            question: "Convert 0.75 to a fraction in simplest form.",
            correct: "3/4",
            difficulty: "medium",
            steps: ["0.75 = 75/100", "Divide by GCD of 25", "= 3/4"]
        },
        {
            question: "What is 5/6 - 1/3?",
            correct: "1/2",
            difficulty: "hard",
            steps: ["5/6 - 1/3", "5/6 - 2/6", "3/6", "= 1/2"]
        }
    ],
    percentages: [
        {
            question: "What is 20% of 50?",
            correct: "10",
            difficulty: "easy",
            steps: ["20% of 50 = 0.20 × 50", "= 10"]
        },
        {
            question: "If a item costs £80 and is reduced by 25%, what is the new price?",
            correct: "60",
            difficulty: "medium",
            steps: ["Reduction = 25% of £80 = £20", "New price = £80 - £20 = £60"]
        },
        {
            question: "What percentage is 15 out of 60?",
            correct: "25",
            difficulty: "medium",
            steps: ["Percentage = (15/60) × 100", "= 0.25 × 100", "= 25%"]
        },
        {
            question: "If a quantity increases from 40 to 60, what is the percentage increase?",
            correct: "50",
            difficulty: "hard",
            steps: ["Increase = 60 - 40 = 20", "Percentage = (20/40) × 100", "= 0.5 × 100", "= 50%"]
        }
    ]
};

// Past Papers Database
const pastPapers = {
    'ks2-standard': [
        {
            question: "What is 24 ÷ 8?",
            correct: "3",
            difficulty: "ks2-standard",
            steps: ["24 ÷ 8 = 3"]
        },
        {
            question: "What is 15% of 80?",
            correct: "12",
            difficulty: "ks2-standard",
            steps: ["15% of 80 = 0.15 × 80 = 12"]
        },
        {
            question: "What is 2/5 as a decimal?",
            correct: "0.4",
            difficulty: "ks2-standard",
            steps: ["2/5 = 2 ÷ 5 = 0.4"]
        }
    ],
    'ks2-greater': [
        {
            question: "Solve: 4x - 3 = 13",
            correct: "4",
            difficulty: "ks2-greater",
            steps: ["4x - 3 = 13", "4x = 16", "x = 4"]
        },
        {
            question: "A rectangle has length 8 cm and width 6 cm. What is its area?",
            correct: "48",
            difficulty: "ks2-greater",
            steps: ["Area = length × width", "Area = 8 × 6 = 48 cm²"]
        },
        {
            question: "If the ratio of boys to girls is 3:5 and there are 24 boys, how many girls are there?",
            correct: "40",
            difficulty: "ks2-greater",
            steps: ["Ratio 3:5 with 24 boys", "24 ÷ 3 = 8 (scale factor)", "Girls = 5 × 8 = 40"]
        },
        {
            question: "Calculate: (6 + 2) × 3 - 4",
            correct: "20",
            difficulty: "ks2-greater",
            steps: ["(6 + 2) × 3 - 4", "= 8 × 3 - 4", "= 24 - 4", "= 20"]
        },
        {
            question: "A ball costs £12.50. It is reduced by 20%. What is the new price?",
            correct: "10",
            difficulty: "ks2-greater",
            steps: ["Reduction = 20% of £12.50 = £2.50", "New price = £12.50 - £2.50 = £10"]
        }
    ]
};

// Topic Details
const topicDetails = {
    algebra: {
        title: "Algebra",
        content: `
            <h3>Understanding Algebra</h3>
            <p>Algebra is about finding unknown values using equations and expressions.</p>
            <h4>Key Concepts:</h4>
            <ul>
                <li><strong>Variables:</strong> Letters that represent unknown numbers</li>
                <li><strong>Expressions:</strong> Combinations of numbers, variables, and operations</li>
                <li><strong>Equations:</strong> Two expressions with an equals sign</li>
                <li><strong>Solving:</strong> Finding the value that makes the equation true</li>
            </ul>
            <h4>Example:</h4>
            <p>2x + 5 = 13</p>
            <p>Subtract 5 from both sides: 2x = 8</p>
            <p>Divide both sides by 2: x = 4</p>
        `
    },
    geometry: {
        title: "Geometry",
        content: `
            <h3>Understanding Geometry</h3>
            <p>Geometry is the study of shapes, space, and size.</p>
            <h4>Key Concepts:</h4>
            <ul>
                <li><strong>Area:</strong> The space inside a 2D shape</li>
                <li><strong>Perimeter:</strong> The distance around a shape</li>
                <li><strong>Volume:</strong> The space inside a 3D shape</li>
                <li><strong>Angles:</strong> Measured in degrees</li>
            </ul>
            <h4>Common Formulas:</h4>
            <ul>
                <li>Rectangle Area = length × width</li>
                <li>Triangle Area = ½ × base × height</li>
                <li>Circle Circumference = 2πr</li>
            </ul>
        `
    },
    ratio: {
        title: "Ratios & Proportions",
        content: `
            <h3>Understanding Ratios</h3>
            <p>A ratio compares two quantities.</p>
            <h4>Key Concepts:</h4>
            <ul>
                <li><strong>Ratio:</strong> A comparison of two quantities (e.g., 3:2)</li>
                <li><strong>Proportion:</strong> When two ratios are equal</li>
                <li><strong>Scaling:</strong> Multiplying or dividing both parts of a ratio</li>
            </ul>
            <h4>Example:</h4>
            <p>If the ratio of boys to girls is 2:3 and there are 10 boys, how many girls?</p>
            <p>2 × 5 = 10 boys, so 3 × 5 = 15 girls</p>
        `
    },
    statistics: {
        title: "Statistics",
        content: `
            <h3>Understanding Statistics</h3>
            <p>Statistics helps us understand and analyze data.</p>
            <h4>Key Concepts:</h4>
            <ul>
                <li><strong>Mean:</strong> Average of all values</li>
                <li><strong>Median:</strong> Middle value when ordered</li>
                <li><strong>Mode:</strong> Most frequent value</li>
                <li><strong>Range:</strong> Difference between highest and lowest</li>
            </ul>
            <h4>Example:</h4>
            <p>Data: 3, 5, 7, 9</p>
            <p>Mean = (3+5+7+9)÷4 = 6</p>
            <p>Median = (5+7)÷2 = 6</p>
            <p>Range = 9-3 = 6</p>
        `
    },
    fractions: {
        title: "Fractions & Decimals",
        content: `
            <h3>Understanding Fractions</h3>
            <p>Fractions represent parts of a whole.</p>
            <h4>Key Concepts:</h4>
            <ul>
                <li><strong>Numerator:</strong> Top number (how many parts)</li>
                <li><strong>Denominator:</strong> Bottom number (total parts)</li>
                <li><strong>Simplifying:</strong> Dividing by common factors</li>
            </ul>
            <h4>Operations:</h4>
            <ul>
                <li>To add: Use common denominator</li>
                <li>To multiply: Multiply numerators and denominators</li>
                <li>To divide: Flip and multiply</li>
            </ul>
        `
    },
    percentages: {
        title: "Percentages",
        content: `
            <h3>Understanding Percentages</h3>
            <p>A percentage is a fraction out of 100.</p>
            <h4>Key Concepts:</h4>
            <ul>
                <li><strong>%:</strong> Out of 100</li>
                <li><strong>50%:</strong> Half (1/2)</li>
                <li><strong>25%:</strong> Quarter (1/4)</li>
                <li><strong>Decimal:</strong> Percentage ÷ 100</li>
            </ul>
            <h4>Examples:</h4>
            <ul>
                <li>20% of 50 = 0.20 × 50 = 10</li>
                <li>15 out of 60 = (15÷60) × 100 = 25%</li>
            </ul>
        `
    }
};

// Initialize
function init() {
    loadData();
    updateStats();
    displayAchievements();
    loadPracticeProblem();
    loadPastPaperQuestion();
    setupNavigation();

    // Explicitly attach practice Next button handler as a fallback for inline onclick issues
    try {
        const btn = document.getElementById('practiceNextBtn');
        if (btn && !btn.__attached) {
            btn.addEventListener('click', loadPracticeProblem);
            btn.__attached = true;
        }
    } catch (e) { console.warn('Failed to attach practiceNextBtn handler', e); }

    // Attach other explicit handlers for Next buttons
    try {
        const quizBtn = document.getElementById('quizNextBtn');
        if (quizBtn && !quizBtn.__attached) {
            quizBtn.addEventListener('click', nextQuizQuestion);
            quizBtn.__attached = true;
        }
    } catch (e) { console.warn('Failed to attach quizNextBtn handler', e); }

    try {
        const pastBtn = document.getElementById('pastNextBtn');
        if (pastBtn && !pastBtn.__attached) {
            pastBtn.addEventListener('click', loadPastPaperQuestion);
            pastBtn.__attached = true;
        }
    } catch (e) { console.warn('Failed to attach pastNextBtn handler', e); }

    // Fallback: convert inline onclick attributes into real listeners to avoid issues
    try {
        document.querySelectorAll('[onclick]').forEach(el => {
            if (el.__inlineAttached) return;
            const code = el.getAttribute('onclick');
            if (!code) return;
            el.addEventListener('click', function(e) {
                try {
                    // Execute inline handler code with event available
                    new Function('event', code).call(this, e);
                } catch (err) {
                    console.error('inline handler exec error', err);
                }
            });
            el.__inlineAttached = true;
        });
    } catch (e) { console.warn('Failed to attach inline onclick fallbacks', e); }
}

// Navigation
function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Use currentTarget to ensure we read the button element even if an inner element was clicked
            const section = e.currentTarget.getAttribute('data-section') || e.currentTarget.dataset.section;
            if (section && document.getElementById(section)) {
                switchSection(section);
            }
        });
    });
}

function switchSection(sectionId) {
    if (!sectionId) return;
    const sectionEl = document.getElementById(sectionId);
    if (!sectionEl) return;

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    sectionEl.classList.add('active');
    const navBtn = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);
    if (navBtn) navBtn.classList.add('active');
    
    // Update progress section when opened
    if (sectionId === 'progress') {
        updateProgressDisplay();
    }
}

// Update Stats
function updateStats() {
    const total = appData.stats.totalProblems;
    const correct = appData.stats.correctAnswers;
    const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
    
    document.getElementById('totalProblems').textContent = total;
    document.getElementById('correctAnswers').textContent = correct;
    document.getElementById('accuracyPercent').textContent = accuracy + '%';
    document.getElementById('bestStreak').textContent = appData.stats.bestStreak;
    
    document.getElementById('totalProblems2').textContent = total;
    document.getElementById('accuracy2').textContent = accuracy + '%';
    document.getElementById('quizzesCompleted').textContent = appData.stats.quizzesCompleted;
}

// Practice Problems
function getRandomProblem(topic = '') {
    let availableProblems = [];
    
    if (topic && problems[topic]) {
        availableProblems = problems[topic];
    } else {
        Object.values(problems).forEach(arr => availableProblems.push(...arr));
    }
    
    return availableProblems[Math.floor(Math.random() * availableProblems.length)];
}

function loadPracticeProblem() {
    try {
        const topicEl = document.getElementById('topicSelect');
        const diffEl = document.getElementById('difficultySelect');
        const problemContainer = document.getElementById('problemContainer');

        if (!problemContainer) {
            console.error('Missing #problemContainer element');
            return;
        }

        const topic = topicEl ? topicEl.value : '';
        const difficulty = diffEl ? diffEl.value : '';

        let availableProblems = [];
        if (topic && problems[topic]) {
            availableProblems = problems[topic];
        } else {
            Object.values(problems).forEach(arr => availableProblems.push(...arr));
        }

        if (difficulty) {
            availableProblems = availableProblems.filter(p => p.difficulty === difficulty);
        }

        // Filter out weak spots if any are selected
        const hasWeakSpots = Object.values(appData.weakSpots).some(v => v);
        if (hasWeakSpots) {
            const selectedTopics = Object.keys(appData.weakSpots).filter(t => appData.weakSpots[t]);
            availableProblems = availableProblems.filter(p => selectedTopics.includes(getCurrentProblemTopic(p)));
        }

        // Filter out questions shown today
        const today = new Date().toDateString();
        availableProblems = availableProblems.filter(p => {
            try {
                const questionKey = JSON.stringify(p);
                const lastShown = appData.questionHistory[questionKey];
                return !lastShown || lastShown !== today;
            } catch (e) {
                return true;
            }
        });

        const answerArea = problemContainer.querySelector('.answer-area');
        const questionEl = document.getElementById('problemQuestion');
        const diffBadge = document.getElementById('difficultyBadge');

        if (availableProblems.length === 0) {
            if (questionEl) questionEl.textContent = '🎉 You\'ve practiced all available problems today! Come back tomorrow for more, or try a different topic/difficulty.';
            if (diffBadge) diffBadge.textContent = 'ALL DONE';
            if (answerArea) answerArea.style.display = 'none';
            return;
        }

        appData.currentProblem = availableProblems[Math.floor(Math.random() * availableProblems.length)];

        // Track that this question was shown today
        try {
            const questionKey = JSON.stringify(appData.currentProblem);
            appData.questionHistory[questionKey] = today;
        } catch (e) {
            console.warn('Failed to stringify problem for history', e);
        }

        if (answerArea) answerArea.style.display = 'flex';
        if (questionEl) questionEl.textContent = appData.currentProblem.question;
        if (diffBadge) {
            diffBadge.textContent = appData.currentProblem.difficulty.toUpperCase();
            diffBadge.className = `difficulty ${appData.currentProblem.difficulty}`;
        }

        const answerInput = document.getElementById('answerInput');
        const feedback = document.getElementById('feedback');
        const stepExplanation = document.getElementById('stepExplanation');

        if (answerInput) answerInput.value = '';
        if (feedback) feedback.className = 'feedback hidden';
        if (stepExplanation) stepExplanation.classList.add('hidden');

        saveData();
    } catch (err) {
        console.error('Error in loadPracticeProblem:', err);
        // surface error in-page
        try {
            let box = document.getElementById('jsErrorConsole');
            if (!box) {
                box = document.createElement('div');
                box.id = 'jsErrorConsole';
                box.style.position = 'fixed';
                box.style.right = '12px';
                box.style.bottom = '12px';
                box.style.background = 'rgba(255,255,255,0.95)';
                box.style.border = '2px solid #d33';
                box.style.padding = '10px';
                box.style.zIndex = 99999;
                box.style.maxWidth = '420px';
                box.style.fontSize = '13px';
                box.style.color = '#000';
                box.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                document.body.appendChild(box);
            }
            box.textContent = `Error in loadPracticeProblem: ${err.message}`;
            box.style.display = 'block';
        } catch (e) {}
    }
}

function submitAnswer() {
    const input = document.getElementById('answerInput').value.trim();
    const correct = appData.currentProblem.correct.toLowerCase();
    const userAnswer = input.toLowerCase();
    
    const feedback = document.getElementById('feedback');
    const isCorrect = userAnswer === correct;
    
    if (isCorrect) {
        feedback.textContent = '✓ Correct! Well done!';
        feedback.className = 'feedback correct';
        appData.stats.correctAnswers++;
        appData.stats.currentStreak++;
        if (appData.stats.currentStreak > appData.stats.bestStreak) {
            appData.stats.bestStreak = appData.stats.currentStreak;
        }
    } else {
        feedback.textContent = `✗ Incorrect. The correct answer is: ${appData.currentProblem.correct}`;
        feedback.className = 'feedback incorrect';
        appData.stats.currentStreak = 0;
    }
    
    appData.stats.totalProblems++;
    const topic = document.getElementById('topicSelect').value || 'algebra';
    if (appData.stats.topicStats[topic]) {
        appData.stats.topicStats[topic].solved++;
        if (isCorrect) appData.stats.topicStats[topic].correct++;
    }
    
    feedback.classList.remove('hidden');
    checkAchievements();
    saveData();
    updateStats();
}

function showSolution() {
    const steps = appData.currentProblem.steps;
    const stepsHtml = steps.map((step, i) => `<li>${step}</li>`).join('');
    document.getElementById('steps').innerHTML = stepsHtml;
    document.getElementById('stepExplanation').classList.remove('hidden');
}

function handleKeyPress(e) {
    if (e.key === 'Enter') submitAnswer();
}

// Quiz Functions
function startQuiz() {
    const length = parseInt(document.getElementById('quizLength').value);
    const difficulty = document.getElementById('quizDifficulty').value;
    
    appData.quizState.questions = generateQuizQuestions(length, difficulty);
    appData.quizState.currentIndex = 0;
    appData.quizState.userAnswers = [];
    appData.quizState.active = true;
    appData.quizState.startTime = Date.now();
    
    document.querySelector('.quiz-setup').classList.add('hidden');
    document.getElementById('quizContainer').classList.remove('hidden');
    document.getElementById('quizResults').classList.add('hidden');
    
    displayQuizQuestion();
    startTimer();
}

function generateQuizQuestions(length, difficulty) {
    const questions = [];
    const allProblems = Object.values(problems).flat();
    
    let filtered = allProblems;
    if (difficulty !== 'mixed') {
        filtered = allProblems.filter(p => p.difficulty === difficulty);
    }
    
    for (let i = 0; i < length && filtered.length > 0; i++) {
        const idx = Math.floor(Math.random() * filtered.length);
        questions.push(filtered[idx]);
        filtered.splice(idx, 1);
    }
    
    return questions;
}

function displayQuizQuestion() {
    const q = appData.quizState.questions[appData.quizState.currentIndex];
    const progress = appData.quizState.currentIndex + 1;
    const total = appData.quizState.questions.length;
    
    document.getElementById('quizProgress').textContent = `${progress} / ${total}`;
    document.getElementById('progressFill').style.width = `${(progress / total) * 100}%`;
    document.getElementById('quizQuestion').textContent = q.question;
    
    const optionsHtml = generateMultipleChoice(q.correct);
    document.getElementById('quizOptions').innerHTML = optionsHtml.map((opt, i) => 
        `<div class="option" onclick="selectOption(${i})">${opt}</div>`
    ).join('');
}

function generateMultipleChoice(correct) {
    const options = [correct];
    while (options.length < 4) {
        const fake = Math.floor(Math.random() * 100).toString();
        if (!options.includes(fake)) options.push(fake);
    }
    return options.sort(() => Math.random() - 0.5);
}

function selectOption(index) {
    const options = document.querySelectorAll('.option');
    const selected = options[index].textContent;
    appData.quizState.userAnswers.push(selected);
    
    const correct = appData.quizState.questions[appData.quizState.currentIndex].correct;
    if (selected === correct) {
        options[index].classList.add('correct');
    } else {
        options[index].classList.add('incorrect');
        const correctIndex = Array.from(options).findIndex(opt => opt.textContent === correct);
        options[correctIndex].classList.add('correct');
    }
    
    document.querySelectorAll('.option').forEach(opt => opt.style.pointerEvents = 'none');
}

function nextQuizQuestion() {
    appData.quizState.currentIndex++;
    
    if (appData.quizState.currentIndex < appData.quizState.questions.length) {
        displayQuizQuestion();
    } else {
        endQuiz();
    }
}

let timerInterval = null;

function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - appData.quizState.startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        document.getElementById('timer').textContent = 
            `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);
}

function endQuiz() {
    clearInterval(timerInterval);
    appData.quizState.active = false;
    
    const correct = appData.quizState.userAnswers.filter((ans, i) => 
        ans === appData.quizState.questions[i].correct
    ).length;
    
    const total = appData.quizState.questions.length;
    const elapsed = Math.floor((Date.now() - appData.quizState.startTime) / 1000);
    
    appData.stats.quizzesCompleted++;
    appData.stats.totalProblems += total;
    appData.stats.correctAnswers += correct;
    saveData();
    
    document.getElementById('quizContainer').classList.add('hidden');
    document.getElementById('quizResults').classList.remove('hidden');
    document.getElementById('quizScore').textContent = `${correct}/${total}`;
    document.getElementById('quizAccuracy').textContent = Math.round((correct/total)*100) + '%';
    document.getElementById('quizTime').textContent = 
        `${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}`;
    
    updateStats();
}

// Weak Spots Functions
function toggleWeakSpotsMenu() {
    const menu = document.getElementById('weakSpotsMenu');
    menu.classList.toggle('hidden');
    
    if (!menu.classList.contains('hidden')) {
        // Update checkboxes to reflect current weak spots
        for (const topic of Object.keys(appData.weakSpots)) {
            const checkbox = document.getElementById(`ws-${topic}`);
            if (checkbox) {
                checkbox.checked = appData.weakSpots[topic];
            }
        }
    }
}

function updateWeakSpots() {
    for (const topic of Object.keys(appData.weakSpots)) {
        const checkbox = document.getElementById(`ws-${topic}`);
        if (checkbox) {
            appData.weakSpots[topic] = checkbox.checked;
        }
    }
    saveData();
    loadPracticeProblem();
}

function clearWeakSpots() {
    for (const topic of Object.keys(appData.weakSpots)) {
        appData.weakSpots[topic] = false;
        const checkbox = document.getElementById(`ws-${topic}`);
        if (checkbox) {
            checkbox.checked = false;
        }
    }
    saveData();
    loadPracticeProblem();
}

function getCurrentProblemTopic(problem) {
    // Find which topic this problem belongs to
    for (const [topic, questionList] of Object.entries(problems)) {
        if (questionList.includes(problem)) {
            return topic;
        }
    }
    return '';
}

function retakeQuiz() {
    document.querySelector('.quiz-setup').classList.remove('hidden');
    document.getElementById('quizResults').classList.add('hidden');
}

// Topics
function showTopicDetail(topicId) {
    const detail = topicDetails[topicId];
    document.getElementById('topicDetail').classList.remove('hidden');
    document.getElementById('topicContent').innerHTML = `
        <h2>${detail.title}</h2>
        ${detail.content}
        <button class="btn-secondary" onclick="hidTopicDetail()" style="margin-top: 1rem;">Back</button>
    `;
    document.querySelectorAll('.topic-card').forEach(c => c.style.display = 'none');
}

function hidTopicDetail() {
    document.getElementById('topicDetail').classList.add('hidden');
    document.querySelectorAll('.topic-card').forEach(c => c.style.display = 'block');
}

// Progress
function updateProgressDisplay() {
    const stats = appData.stats.topicStats;
    
    let bestTopic = 'N/A';
    let bestScore = 0;
    for (const [topic, data] of Object.entries(stats)) {
        if (data.solved > 0) {
            const accuracy = (data.correct / data.solved) * 100;
            if (accuracy > bestScore) {
                bestScore = accuracy;
                bestTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
            }
        }
    }
    
    document.getElementById('bestTopic').textContent = bestTopic;
    displayAchievements();
}

function clearProgress() {
    if (confirm('Are you sure? This will clear all your progress data.')) {
        appData = {
            stats: {
                totalProblems: 0,
                correctAnswers: 0,
                bestStreak: 0,
                currentStreak: 0,
                topicStats: {
                    algebra: { solved: 0, correct: 0 },
                    geometry: { solved: 0, correct: 0 },
                    ratio: { solved: 0, correct: 0 },
                    statistics: { solved: 0, correct: 0 },
                    fractions: { solved: 0, correct: 0 },
                    percentages: { solved: 0, correct: 0 }
                },
                quizzesCompleted: 0,
                gamesPlayed: 0
            },
            currentProblem: null,
            quizState: {
                active: false,
                questions: [],
                currentIndex: 0,
                startTime: null,
                userAnswers: []
            },
            achievements: {
                'first-solve': { name: 'First Steps', desc: 'Solve your first problem', unlocked: false, icon: '👣' },
                'ten-solved': { name: 'Getting Started', desc: 'Solve 10 problems', unlocked: false, icon: '🎯' },
                'fifty-solved': { name: 'Math Master', desc: 'Solve 50 problems', unlocked: false, icon: '🧠' },
                'perfect-quiz': { name: 'Quiz Champion', desc: 'Get 100% on a quiz', unlocked: false, icon: '🏆' },
                'streak-five': { name: 'On Fire!', desc: 'Get 5 correct in a row', unlocked: false, icon: '🔥' },
                'play-game': { name: 'Game Master', desc: 'Play your first game', unlocked: false, icon: '🎮' },
                'all-topics': { name: 'Polymath', desc: 'Practice all topics', unlocked: false, icon: '🌟' }
            }
        };
        saveData();
        updateStats();
        alert('All data cleared!');
    }
}

// Achievements System
function checkAchievements() {
    const a = appData.achievements;
    
    if (appData.stats.totalProblems === 1) a['first-solve'].unlocked = true;
    if (appData.stats.totalProblems >= 10) a['ten-solved'].unlocked = true;
    if (appData.stats.totalProblems >= 50) a['fifty-solved'].unlocked = true;
    if (appData.stats.bestStreak >= 5) a['streak-five'].unlocked = true;
    if (appData.stats.gamesPlayed >= 1) a['play-game'].unlocked = true;
    
    const topics = Object.values(appData.stats.topicStats);
    if (topics.every(t => t.solved > 0)) a['all-topics'].unlocked = true;
}

function displayAchievements() {
    const grid = document.getElementById('achievementsGrid');
    const achievements = appData.achievements;
    
    let html = '';
    for (const [key, achievement] of Object.entries(achievements)) {
        const unlocked = achievement.unlocked ? 'unlocked' : 'locked';
        html += `
            <div class="achievement ${unlocked}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            </div>
        `;
    }
    grid.innerHTML = html;
}

// Games Functions
function startGame(gameType) {
    document.querySelectorAll('.games-grid').forEach(g => g.classList.add('hidden'));
    document.getElementById('gameContainer').classList.remove('hidden');
    appData.stats.gamesPlayed++;
    checkAchievements();
    saveData();
    
    if (gameType === 'mathbingo') startMathBingo();
    else if (gameType === 'speedround') startSpeedRound();
    else if (gameType === 'numberchallenge') startNumberChallenge();
    else if (gameType === 'memorymath') startMemoryMath();
}

function exitGame() {
    document.getElementById('gameContainer').classList.add('hidden');
    switchSection('games');
}

// Math Bingo Game
function startMathBingo() {
    const numbers = Array.from({length: 25}, () => Math.floor(Math.random() * 50) + 1);
    const allProblems = Object.values(problems).flat().filter(p => p.difficulty !== 'hard');
    
    let html = `<h3>🎲 Math Bingo</h3><p>Solve the problem and mark off the answer on your card!</p>`;
    html += `<div class="bingo-grid">`;
    
    for (let i = 0; i < 25; i++) {
        const isFree = i === 12;
        html += `<div class="bingo-cell ${isFree ? 'free' : ''}" onclick="toggleBingoCell(this)">${isFree ? '★' : numbers[i]}</div>`;
    }
    html += `</div>`;
    html += `<div id="bingoQuestion" style="font-size: 1.2rem; margin: 1rem 0; padding: 1rem; background: #f0f4ff; border-radius: 8px;"></div>`;
    html += `<button class="btn-primary" onclick="nextBingoProblem()">Next Problem</button>`;
    html += `<div id="bingoScore" style="margin-top: 1rem; font-size: 1.1rem;"></div>`;
    
    document.getElementById('gameContent').innerHTML = html;
    window.bingoProblems = allProblems;
    window.bingoScore = 0;
    nextBingoProblem();
}

function toggleBingoCell(cell) {
    cell.classList.toggle('marked');
}

function nextBingoProblem() {
    const problem = window.bingoProblems[Math.floor(Math.random() * window.bingoProblems.length)];
    document.getElementById('bingoQuestion').textContent = problem.question;
    document.getElementById('bingoScore').textContent = `Problems solved: ${++window.bingoScore}`;
}

// Speed Round Game
function startSpeedRound() {
    const allProblems = Object.values(problems).flat().filter(p => p.difficulty === 'easy');
    
    let html = `<h3>⚡ Speed Round - 60 Seconds!</h3>`;
    html += `<div class="speed-display">`;
    html += `<div class="speed-timer" id="speedTimer">60</div>`;
    html += `<div id="speedQuestion" style="font-size: 1.1rem; margin: 1rem 0; padding: 1rem; background: #f0f4ff; border-radius: 8px;"></div>`;
    html += `<input type="text" id="speedAnswer" placeholder="Enter answer" onkeypress="handleSpeedRoundKey(event)" style="padding: 0.75rem; border: 2px solid var(--primary-color); border-radius: 8px; font-size: 1rem; width: 100%; max-width: 300px;">`;
    html += `<button class="btn-primary" onclick="submitSpeedAnswer()" style="margin-left: 0.5rem;">Submit</button>`;
    html += `<div class="speed-score">Correct: <span id="speedScore">0</span></div>`;
    html += `</div>`;
    
    document.getElementById('gameContent').innerHTML = html;
    
    window.speedProblems = allProblems;
    window.speedScore = 0;
    window.speedTimeLeft = 60;
    
    nextSpeedProblem();
    
    window.speedInterval = setInterval(() => {
        window.speedTimeLeft--;
        document.getElementById('speedTimer').textContent = window.speedTimeLeft;
        if (window.speedTimeLeft <= 0) {
            clearInterval(window.speedInterval);
            endSpeedRound();
        }
    }, 1000);
}

function nextSpeedProblem() {
    const problem = window.speedProblems[Math.floor(Math.random() * window.speedProblems.length)];
    window.currentSpeedProblem = problem;
    document.getElementById('speedQuestion').textContent = problem.question;
    document.getElementById('speedAnswer').value = '';
    document.getElementById('speedAnswer').focus();
}

function handleSpeedRoundKey(e) {
    if (e.key === 'Enter') submitSpeedAnswer();
}

function submitSpeedAnswer() {
    const answer = document.getElementById('speedAnswer').value.trim().toLowerCase();
    if (answer === window.currentSpeedProblem.correct.toLowerCase()) {
        window.speedScore++;
        document.getElementById('speedScore').textContent = window.speedScore;
    }
    nextSpeedProblem();
}

function endSpeedRound() {
    document.getElementById('gameContent').innerHTML = `
        <h3>⚡ Round Over!</h3>
        <div style="text-align: center; margin: 2rem 0;">
            <div style="font-size: 2.5rem; font-weight: bold; color: var(--primary-color); margin: 1rem 0;">
                You solved: ${window.speedScore} problems!
            </div>
            <button class="btn-primary" onclick="exitGame()">Back to Games</button>
        </div>
    `;
}

// Number Challenge Game
function startNumberChallenge() {
    const targetNumber = Math.floor(Math.random() * 50) + 1;
    
    let html = `<h3>🔢 Number Challenge</h3>`;
    html += `<p>I'm thinking of a number between 1 and 50. Solve the clues to find it!</p>`;
    html += `<div style="padding: 1.5rem; background: var(--bg-color); border-radius: 8px; margin: 1rem 0;">`;
    html += `<div id="clue1">Clue 1: It's greater than ${targetNumber - 15}</div>`;
    html += `<div id="clue2" style="margin-top: 0.5rem;">Clue 2: It's less than ${targetNumber + 15}</div>`;
    html += `<div id="clue3" style="margin-top: 0.5rem;">Clue 3: It's ${targetNumber % 2 === 0 ? 'even' : 'odd'}</div>`;
    html += `</div>`;
    html += `<input type="number" id="guessInput" placeholder="Your guess" min="1" max="50" data-target="${targetNumber}" onkeypress="handleGuessKey(event)">`;
    html += `<button class="btn-primary" onclick="submitGuess(${targetNumber})">Guess</button>`;
    html += `<div id="guessResult" style="margin-top: 1rem; font-size: 1.1rem;"></div>`;
    
    document.getElementById('gameContent').innerHTML = html;
    // store fallback target globally for key handlers
    window._numberChallengeTarget = targetNumber;
    document.getElementById('guessInput').focus();
}

function handleGuessKey(e) {
    if (e.key === 'Enter') {
        // Prefer data-target on the input, then global fallback
        const target = parseInt(e.target.getAttribute('data-target') || e.target.dataset.target || window._numberChallengeTarget);
        submitGuess(target);
    }
}

function submitGuess(target) {
    const guess = parseInt(document.getElementById('guessInput').value);
    const result = document.getElementById('guessResult');
    
    if (guess === target) {
        result.textContent = '🎉 Correct! You found the number!';
        result.style.color = 'var(--success-color)';
        document.getElementById('guessInput').disabled = true;
    } else if (guess < target) {
        result.textContent = '📈 Too low! Try higher.';
        result.style.color = 'var(--warning-color)';
    } else {
        result.textContent = '📉 Too high! Try lower.';
        result.style.color = 'var(--warning-color)';
    }
}

// Memory Math Game
function startMemoryMath() {
    const allProblems = Object.values(problems).flat().filter(p => p.difficulty !== 'hard').slice(0, 6);
    const cards = [];
    
    allProblems.forEach(problem => {
        cards.push({ type: 'question', content: problem.question, answer: problem.correct });
        cards.push({ type: 'answer', content: problem.correct, question: problem.question });
    });
    
    cards.sort(() => Math.random() - 0.5);
    
    let html = `<h3>🧠 Memory Math</h3><p>Match questions with their answers!</p>`;
    html += `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1rem 0;">`;
    
    cards.forEach((card, i) => {
        html += `<button class="memory-card" onclick="flipCard(${i})" id="card-${i}">?</button>`;
    });
    
    html += `</div><div id="memoryScore" style="text-align: center; font-size: 1.1rem; margin: 1rem 0;">Matched: 0/6</div>`;
    html += `<button class="btn-secondary" onclick="exitGame()">Back</button>`;
    
    document.getElementById('gameContent').innerHTML = html;
    window.memoryCards = cards;
    window.flipped = [];
    window.matched = 0;
}

function flipCard(index) {
    if (window.flipped.length >= 2 || window.flipped.includes(index)) return;
    
    window.flipped.push(index);
    const card = document.getElementById(`card-${index}`);
    const content = window.memoryCards[index].content;
    card.textContent = content;
    card.disabled = true;
    
    if (window.flipped.length === 2) {
        const [idx1, idx2] = window.flipped;
        const card1 = window.memoryCards[idx1];
        const card2 = window.memoryCards[idx2];
        
        if ((card1.type === 'question' && card2.answer === card1.content) ||
            (card2.type === 'question' && card1.answer === card2.content)) {
            window.matched++;
            document.getElementById('memoryScore').textContent = `Matched: ${window.matched}/6`;
            window.flipped = [];
        } else {
            setTimeout(() => {
                document.getElementById(`card-${idx1}`).textContent = '?';
                document.getElementById(`card-${idx2}`).textContent = '?';
                window.flipped = [];
            }, 1500);
        }
    }
}

// Past Papers Functions
function loadPastPaperQuestion() {
    let availablePapers = [];
    
    if (appData.currentPastPaperFilter) {
        availablePapers = pastPapers[appData.currentPastPaperFilter] || [];
    } else {
        Object.values(pastPapers).forEach(arr => availablePapers.push(...arr));
    }
    
    if (availablePapers.length === 0) {
        document.getElementById('ppQuestion').textContent = 'No past paper questions available for this filter.';
        document.getElementById('ppDifficultyBadge').textContent = '';
        document.getElementById('ppFeedback').className = 'feedback hidden';
        document.getElementById('ppStepExplanation').classList.add('hidden');
        return;
    }
    
    appData.currentPastPaper = availablePapers[Math.floor(Math.random() * availablePapers.length)];
    
    document.getElementById('ppQuestion').textContent = appData.currentPastPaper.question;
    document.getElementById('ppDifficultyBadge').textContent = appData.currentPastPaper.difficulty.toUpperCase();
    document.getElementById('ppDifficultyBadge').className = `difficulty ${appData.currentPastPaper.difficulty}`;
    
    document.getElementById('ppAnswerInput').value = '';
    document.getElementById('ppFeedback').className = 'feedback hidden';
    document.getElementById('ppStepExplanation').classList.add('hidden');
}

function filterPastPapers(filter, evt) {
    appData.currentPastPaperFilter = filter;

    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

    // Prefer the event target when available (onclick handlers may not provide it),
    // otherwise try to find the button whose onclick contains the filter value.
    if (evt && evt.target) {
        evt.target.classList.add('active');
    } else {
        const btn = Array.from(document.querySelectorAll('.filter-btn')).find(b => {
            const attr = b.getAttribute('onclick') || '';
            return attr.includes(`'${filter}'`) || attr.includes(`"${filter}"`);
        });
        if (btn) btn.classList.add('active');
    }

    loadPastPaperQuestion();
}

function submitPastPaperAnswer() {
    const input = document.getElementById('ppAnswerInput').value.trim();
    const correct = appData.currentPastPaper.correct.toLowerCase();
    const userAnswer = input.toLowerCase();
    
    const feedback = document.getElementById('ppFeedback');
    const isCorrect = userAnswer === correct;
    
    if (isCorrect) {
        feedback.textContent = '✓ Correct! Well done!';
        feedback.className = 'feedback correct';
    } else {
        feedback.textContent = `✗ Incorrect. The correct answer is: ${appData.currentPastPaper.correct}`;
        feedback.className = 'feedback incorrect';
    }
    
    feedback.classList.remove('hidden');
}

function showPastPaperSolution() {
    const steps = appData.currentPastPaper.steps;
    const stepsHtml = steps.map((step, i) => `<li>${step}</li>`).join('');
    document.getElementById('ppSteps').innerHTML = stepsHtml;
    document.getElementById('ppStepExplanation').classList.remove('hidden');
}

function handleKeyPressPP(e) {
    if (e.key === 'Enter') submitPastPaperAnswer();
}

// Start the app
// Debug: capture button clicks to help diagnose broken handlers

(function(){
    const names = ['switchSection','toggleWeakSpotsMenu','clearWeakSpots','submitAnswer','showSolution','loadPracticeProblem','startQuiz','nextQuizQuestion','endQuiz','retakeQuiz','showTopicDetail','hidTopicDetail','startGame','exitGame','filterPastPapers','loadPastPaperQuestion','submitPastPaperAnswer','showPastPaperSolution','nextBingoProblem','handleKeyPress','handleKeyPressPP','loadPracticeProblem'];
    names.forEach(n => {
        try {
            const fn = eval(n);
            if (typeof fn === 'function') window[n] = fn;
        } catch (e) {
            // ignore
        }
    });
})();

// Ensure key handlers are available globally and attach final fallbacks on load
window.loadPracticeProblem = window.loadPracticeProblem || loadPracticeProblem;
window.addEventListener('load', () => {
    try {
        // Re-expose functions in case earlier exposure missed them
        if (typeof loadPracticeProblem === 'function') window.loadPracticeProblem = loadPracticeProblem;
        if (typeof nextQuizQuestion === 'function') window.nextQuizQuestion = nextQuizQuestion;
        if (typeof loadPastPaperQuestion === 'function') window.loadPastPaperQuestion = loadPastPaperQuestion;

        // Final attempt to attach Next buttons
        const pBtn = document.getElementById('practiceNextBtn');
        if (pBtn && !pBtn.__attached) {
            pBtn.addEventListener('click', loadPracticeProblem);
            pBtn.__attached = true;
        }
        const qBtn = document.getElementById('quizNextBtn');
        if (qBtn && !qBtn.__attached) {
            qBtn.addEventListener('click', nextQuizQuestion);
            qBtn.__attached = true;
        }
        const ppBtn = document.getElementById('pastNextBtn');
        if (ppBtn && !ppBtn.__attached) {
            ppBtn.addEventListener('click', loadPastPaperQuestion);
            ppBtn.__attached = true;
        }
    } catch (e) { console.warn('Final onload fallback failed', e); }

    init();
});
