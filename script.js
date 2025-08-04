document.addEventListener('DOMContentLoaded', () => {

    // --- State and DOM Elements ---
    let currentPageIndex = 0;
    const pages = document.querySelectorAll('.page');
    const totalPages = pages.length;

    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const pageIndicator = document.getElementById('page-indicator');

    const tabButtons = document.querySelectorAll('.tab-btn');
    const quizContainers = document.querySelectorAll('.quiz-section');
    const revealButtons = document.querySelectorAll('.reveal-btn');

    // --- Page Navigation Logic ---
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') {
            leftMove();
        } else if (event.key === 'ArrowLeft') {
            rightMove();
        } if (!event.shiftKey || (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft')) {
            return;
        }
    });

    function showPage(index) {
        pages.forEach((page, i) => {
            page.classList.toggle('active', i === index);
            if (i === index) {
                // Restore last active tab for this page, or default to first
                const content = page.querySelector('.content');
                if (content) {
                    const tabId = page.dataset.activeTab || content.querySelector('.tab-btn').dataset.tab;
                    // Deactivate all tabs
                    content.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                    content.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
                    // Activate saved/default tab
                    const btn = content.querySelector(`.tab-btn[data-tab="${tabId}"]`);
                    const tab = content.querySelector(`#${tabId}`);
                    if (btn && tab) {
                        btn.classList.add('active');
                        tab.classList.add('active');
                    }
                }
            }
        });

        currentPageIndex = index;
        updateNavButtons();

        // Update the URL without reloading the page
        const url = new URL(window.location);
        url.searchParams.set('page', index + 1); // 1-based page number
        window.history.replaceState({}, '', url);
    }

    function updateNavButtons() {
        pageIndicator.textContent = `Page ${currentPageIndex + 1} / ${totalPages}`;
        prevBtn.disabled = currentPageIndex === 0;
        nextBtn.disabled = currentPageIndex === totalPages - 1;
    }

    nextBtn.addEventListener('click', () => leftMove());

    prevBtn.addEventListener('click', () => rightMove());

    function leftMove() {
        if (currentPageIndex < totalPages - 1) {
            showPage(currentPageIndex + 1);
        }
    }

    function rightMove() {
        if (currentPageIndex > 0) {
            showPage(currentPageIndex - 1);
        }
    }

    // --- Tab Switching Logic ---
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentTabContainer = button.closest('.content');
            const tabId = button.dataset.tab;

            // Deactivate all tabs within the same container
            currentTabContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            currentTabContainer.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            // Activate the clicked tab
            button.classList.add('active');
            currentTabContainer.querySelector(`#${tabId}`).classList.add('active');

            // Save the active tab for this page
            const page = button.closest('.page');
            if (page) {
                page.dataset.activeTab = tabId;
            }
        });
    });

    // --- Modular Quiz Logic ---
    quizContainers.forEach(quiz => {
        // Attach event to every quiz-options block inside this quiz
        quiz.querySelectorAll('.quiz-options').forEach(optionsContainer => {
            optionsContainer.addEventListener('click', (event) => {
                const selectedOption = event.target.closest('.quiz-option');
                if (!selectedOption) return;

                const question = selectedOption.closest('.quiz-question');
                if (question.classList.contains('answered')) return;

                question.classList.add('answered');

                const isCorrect = selectedOption.hasAttribute('data-correct');
                handleAnswer(quiz, selectedOption, isCorrect);
            });
        });
    });

    function handleAnswer(quiz, selectedOption, isCorrect) {
        // Update quiz state from data attributes
        let score = parseInt(quiz.dataset.score, 10);
        let answered = parseInt(quiz.dataset.answered, 10);

        quiz.dataset.answered = answered + 1;

        const options = selectedOption.parentElement.querySelectorAll('.quiz-option');
        options.forEach(opt => {
            if (opt.hasAttribute('data-correct')) {
                opt.classList.add('correct');
            }
        });

        if (isCorrect) {
            quiz.dataset.score = score + 1;
        } else {
            selectedOption.classList.add('wrong');
        }

        updateScoreDisplay(quiz);
    }

    function updateScoreDisplay(quiz) {
        const score = quiz.dataset.score;
        const total = quiz.dataset.total;
        const answered = quiz.dataset.answered;

        const scoreDisplay = quiz.querySelector('.score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = `Score: ${score}/${total}`;
        }

        // Check for quiz completion messages (for regular quizzes)
        if (scoreDisplay && answered == total) {
            const percentage = (score / total) * 100;
            let message = '';
            if (percentage >= 80) message = '🎉 Excellent! You\'re ready!';
            else if (percentage >= 60) message = '👍 Good job! Review the topics you missed.';
            else message = '📚 Keep studying! Review all sections again.';

            setTimeout(() => {
                scoreDisplay.innerHTML += `<br><span style="font-size: 0.8em;">${message}</span>`;
            }, 500);
        }

        // Handle feedback for agent-style challenges
        const feedbackEl = quiz.querySelector('.feedback');
        if (feedbackEl) {
            feedbackEl.style.display = 'block';
        }
    }

    // --- "Reveal Answer" Button Logic ---
    revealButtons.forEach(button => {
        button.addEventListener('click', () => {
            const feedbackEl = button.nextElementSibling;
            if (feedbackEl && feedbackEl.classList.contains('feedback')) {
                feedbackEl.style.display = 'block';
            }
        });
    });


    // --- Initial Load ---
    const params = new URLSearchParams(window.location.search);
    const pageParam = parseInt(params.get('page'), 10);
    if (pageParam && pageParam > 0 && pageParam <= totalPages) {
        showPage(pageParam - 1); // 0-based index
    } else {
        showPage(0);
    }
});