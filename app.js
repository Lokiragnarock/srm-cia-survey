// ==================== CONFIGURATION ====================
const CONFIG = {
    // Google Apps Script Web App URL (to be set after deployment)
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwF7uhM8DcqfWJZkaXsPPBqYRs1orUmwfB3YNN-2E11k6MI4hFR1MF8q7gAEuTItYTL/exec',

    // For testing, we can use sample data from a local JSON file
    USE_SAMPLE_DATA: false,
    SAMPLE_DATA_FILE: 'sample-data.json'
};

// ==================== STATE MANAGEMENT ====================
const state = {
    surveyConfig: [],
    currentQuestionId: null,
    currentQuestionIndex: 0,
    responses: {},
    history: [],
    totalQuestions: 0,
    pathTaken: []
};

// ==================== DOM ELEMENTS ====================
const elements = {
    loadingScreen: document.getElementById('loadingScreen'),
    questionWrapper: document.getElementById('questionWrapper'),
    thankYouScreen: document.getElementById('thankYouScreen'),
    progressBar: document.getElementById('progressBar'),
    questionNumber: document.getElementById('questionNumber'),
    questionText: document.getElementById('questionText'),
    imageContainer: document.getElementById('imageContainer'),
    questionImage: document.getElementById('questionImage'),
    optionsContainer: document.getElementById('optionsContainer'),
    backBtn: document.getElementById('backBtn'),
    nextBtn: document.getElementById('nextBtn')
};

// ==================== INITIALIZATION ====================
async function init() {
    try {
        elements.loadingScreen.style.display = 'flex';

        // Load survey configuration
        await loadSurveyConfig();

        // Start survey from first question
        if (state.surveyConfig.length > 0) {
            state.currentQuestionId = state.surveyConfig[0].q_id;
            state.totalQuestions = estimateTotalQuestions();
            showQuestion(state.currentQuestionId);
        } else {
            throw new Error('No survey questions found');
        }

        elements.loadingScreen.style.display = 'none';
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to load survey. Please refresh the page.');
    }
}

// ==================== DATA LOADING ====================
async function loadSurveyConfig() {
    if (CONFIG.USE_SAMPLE_DATA) {
        // Load from local JSON file for testing
        const response = await fetch(CONFIG.SAMPLE_DATA_FILE);
        state.surveyConfig = await response.json();
    } else {
        // Load from Google Apps Script
        const response = await fetch(CONFIG.APPS_SCRIPT_URL + '?action=getConfig');
        const data = await response.json();
        // API now returns formatted JSON objects, so we use it directly
        state.surveyConfig = data;
    }
}

function parseSheetData(rawData) {
    // Convert Google Sheets array data to objects
    const headers = rawData[0];
    return rawData.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index] || '';
        });
        return obj;
    });
}

// ==================== QUESTION DISPLAY ====================
function showQuestion(questionId) {
    const question = state.surveyConfig.find(q => q.q_id === questionId);

    if (!question) {
        console.error('Question not found:', questionId);
        return;
    }

    // HANDLE HIDDEN/SYSTEM NODES (Auto-advance)
    // If it's a randomizer, pick the next path immediately and don't show UI
    if (question.type === 'randomizer') {
        const nextId = getNextQuestion(question, '');
        showQuestion(nextId);
        return;
    }

    // Update state
    state.currentQuestionId = questionId;
    state.currentQuestionIndex++;

    // Update progress bar
    updateProgress();

    // Update question number
    elements.questionNumber.textContent = `Question ${state.currentQuestionIndex}`;

    // Update question text
    elements.questionText.innerHTML = question.question_text;

    // Handle image if present
    if (question.image_url && question.image_url !== 'null' && question.image_url.trim()) {
        elements.imageContainer.style.display = 'block';
        elements.questionImage.src = question.image_url;
    } else {
        elements.imageContainer.style.display = 'none';
    }

    // Render options
    renderOptions(question);

    // Update navigation buttons
    updateNavigationButtons();

    // Add animation
    animateQuestion();
}

function renderOptions(question) {
    elements.optionsContainer.innerHTML = '';

    if (question.type === 'radio' && question.options) {
        const options = question.options.split('|').map(opt => opt.trim());

        options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.style.setProperty('--index', index);

            // Check if this option was previously selected
            if (state.responses[question.q_id] === option) {
                button.classList.add('selected');
                elements.nextBtn.disabled = false;
            }

            button.addEventListener('click', () => selectOption(question.q_id, option, button));

            elements.optionsContainer.appendChild(button);
        });
    }
}

function selectOption(questionId, answer, button) {
    // Remove 'selected' class from all options
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Add 'selected' class to clicked option
    button.classList.add('selected');

    // Save response
    state.responses[questionId] = answer;

    // Enable next button
    elements.nextBtn.disabled = false;

    // Add subtle haptic feedback (if on mobile)
    if (window.navigator.vibrate) {
        window.navigator.vibrate(10);
    }
}

// ==================== NAVIGATION ====================
function goToNextQuestion() {
    const currentQuestion = state.surveyConfig.find(q => q.q_id === state.currentQuestionId);
    const userAnswer = state.responses[state.currentQuestionId];

    if (!userAnswer && currentQuestion.type !== 'image') {
        alert('Please select an option');
        return;
    }

    // For image slides, record a default 'VIEWED' action if no response exists
    const recordedAnswer = userAnswer || 'VIEWED';

    // Add current question to history
    state.history.push(state.currentQuestionId);
    state.pathTaken.push(`${state.currentQuestionId}: ${recordedAnswer}`);

    // Get next question ID using branch logic
    const nextQuestionId = getNextQuestion(currentQuestion, recordedAnswer);

    if (nextQuestionId === 'submit') {
        submitSurvey();
    } else {
        showQuestion(nextQuestionId);
    }
}

function goToPreviousQuestion() {
    if (state.history.length === 0) return;

    // Remove last entry from history
    const previousQuestionId = state.history.pop();
    state.pathTaken.pop();

    // Decrement question index
    state.currentQuestionIndex--;

    // Show previous question
    showQuestion(previousQuestionId);
}

// ==================== BRANCH LOGIC PARSER ====================
/**
 * Implements the "Semantic + Default" branching logic
 * Based on the AI agent's protocol
 */
function getNextQuestion(currentQuestion, userAnswer) {
    const logic = currentQuestion.branch_logic;

    if (!logic || logic === 'null' || !logic.trim()) {
        return 'submit';
    }

    // CASE 1: Linear / Default (most common)
    if (logic.startsWith('default:')) {
        return logic.split(':')[1].trim();
    }

    // CASE 2: Randomizer (A/B Testing)
    if (logic.startsWith('random:')) {
        const targets = logic.split(':')[1].split('|').map(t => t.trim());
        return targets[Math.floor(Math.random() * targets.length)];
    }

    // CASE 3: Conditional Branching (Text Matching)
    // Example: "Manager: q_path_a | Team Lead: q_path_b | IC: q_path_c"
    const rules = logic.split('|');

    for (const rule of rules) {
        if (!rule.includes(':')) continue;

        const [trigger, target] = rule.split(':').map(s => s.trim());

        // Use 'includes' for flexible matching (handles whitespace issues)
        if (userAnswer.includes(trigger) || trigger.includes(userAnswer)) {
            return target;
        }
    }

    // Fallback: if no match found, go to submit
    console.warn('No matching branch found, defaulting to submit:', {
        question: currentQuestion.q_id,
        answer: userAnswer,
        logic: logic
    });
    return 'submit';
}

// ==================== SUBMISSION ====================
async function submitSurvey() {
    try {
        elements.loadingScreen.style.display = 'flex';

        const submissionData = {
            timestamp: new Date().toISOString(),
            responses: state.responses,
            pathTaken: state.pathTaken.join(' → ')
        };

        if (CONFIG.USE_SAMPLE_DATA) {
            // In demo mode, just log to console
            console.log('Survey Response:', submissionData);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
            // Submit to Google Apps Script
            await fetch(CONFIG.APPS_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData)
            });
        }

        // Show thank you screen
        elements.loadingScreen.style.display = 'none';
        elements.questionWrapper.style.display = 'none';
        elements.thankYouScreen.style.display = 'flex';

    } catch (error) {
        console.error('Submission error:', error);
        alert('Failed to submit survey. Please try again.');
        elements.loadingScreen.style.display = 'none';
    }
}

// ==================== UI HELPERS ====================
function updateProgress() {
    const progress = (state.currentQuestionIndex / state.totalQuestions) * 100;
    elements.progressBar.style.width = `${Math.min(progress, 100)}%`;
}

function updateNavigationButtons() {
    // Show back button if not on first question
    if (state.history.length > 0) {
        elements.backBtn.style.display = 'flex';
    } else {
        elements.backBtn.style.display = 'none';
    }

    // Update next button text
    const currentQuestion = state.surveyConfig.find(q => q.q_id === state.currentQuestionId);
    const userAnswer = state.responses[state.currentQuestionId];

    if (userAnswer && currentQuestion) {
        const nextId = getNextQuestion(currentQuestion, userAnswer);
        if (nextId === 'submit') {
            elements.nextBtn.innerHTML = `
                Submit
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        } else {
            elements.nextBtn.innerHTML = `
                Next
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        }
    }

    // Disable next button initially, unless it's an informational image slide
    if (currentQuestion && currentQuestion.type === 'image') {
        elements.nextBtn.disabled = false;
    } else {
        elements.nextBtn.disabled = !state.responses[state.currentQuestionId];
    }
}

function animateQuestion() {
    const container = elements.questionWrapper;
    container.style.animation = 'none';
    setTimeout(() => {
        container.style.animation = '';
    }, 10);
}

function estimateTotalQuestions() {
    // Estimate based on average path length
    // This is approximate since branching means different users see different questions
    return Math.ceil(state.surveyConfig.length * 0.7);
}

// ==================== EVENT LISTENERS ====================
elements.nextBtn.addEventListener('click', goToNextQuestion);
elements.backBtn.addEventListener('click', goToPreviousQuestion);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !elements.nextBtn.disabled) {
        goToNextQuestion();
    }
    if (e.key === 'Backspace' && state.history.length > 0) {
        e.preventDefault();
        goToPreviousQuestion();
    }
});

// ==================== START APPLICATION ====================
init();
