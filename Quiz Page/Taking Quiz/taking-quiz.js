console.log("Script loaded successfully");

class QuizApp {
  constructor() {
    this.currentQuestionIndex = 0;
    this.questions = [];
    this.userAnswers = [];
    this.score = 0;
    this.courseName = "";
    this.showingFeedback = false;
  }

  init() {
    this.getCourseFromURL();
    this.loadQuizData();
    this.setupEventListeners();
  }

  getCourseFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    this.courseId = urlParams.get("course") || "1";
  }

  async loadQuizData() {
    try {
      const response = await fetch(`../quiz-data/course${this.courseId}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.questions = data.questions;
      this.courseName = data.courseName;
      this.displayQuestion();
      this.updateUI();
    } catch (error) {
      console.error("Error loading quiz data:", error);
      document.getElementById("question-text").textContent =
        "Error loading quiz. Please try again.";
    }
  }

  displayQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.showResults();
      return;
    }

    const question = this.questions[this.currentQuestionIndex];
    const questionElement = document.getElementById("question-text");
    const optionsContainer = document.getElementById("options-container");
    const feedbackElement = document.getElementById("feedback");

    questionElement.textContent = question.question;
    feedbackElement.textContent = "";
    feedbackElement.className = "feedback";

    optionsContainer.innerHTML = "";
    question.options.forEach((option, index) => {
      const optionElement = document.createElement("div");
      optionElement.className = "option";
      optionElement.textContent = option;
      optionElement.dataset.index = index;
      optionElement.addEventListener("click", () => this.selectOption(index));
      optionsContainer.appendChild(optionElement);
    });

    // If user has already answered this question, show the feedback
    const previousAnswer = this.userAnswers[this.currentQuestionIndex];
    if (previousAnswer !== undefined) {
      this.showingFeedback = true;
      // Show feedback without incrementing score (already done)
      this.displayFeedback(previousAnswer);
    } else {
      this.showingFeedback = false;
    }

    this.updateUI();
  }

  displayFeedback(selectedIndex) {
    const question = this.questions[this.currentQuestionIndex];
    const correctIndex = question.correct;
    const feedbackElement = document.getElementById("feedback");
    const options = document.querySelectorAll(".option");

    if (selectedIndex === correctIndex) {
      feedbackElement.textContent = "Correct!";
      feedbackElement.classList.add("correct");
    } else {
      feedbackElement.textContent = `Incorrect. The correct answer is: ${question.options[correctIndex]}`;
      feedbackElement.classList.add("incorrect");
    }

    // Highlight correct and selected options
    options.forEach((option, index) => {
      if (index === correctIndex) {
        option.classList.add("correct");
      } else if (index === selectedIndex && selectedIndex !== correctIndex) {
        option.classList.add("incorrect");
      }
      option.style.pointerEvents = "none";
    });
  }

  selectOption(selectedIndex) {
    if (this.showingFeedback) return;

    const question = this.questions[this.currentQuestionIndex];
    const correctIndex = question.correct;
    const feedbackElement = document.getElementById("feedback");
    const options = document.querySelectorAll(".option");

    // Only update score if this is the first time answering this question
    if (this.userAnswers[this.currentQuestionIndex] === undefined) {
      this.userAnswers[this.currentQuestionIndex] = selectedIndex;
      if (selectedIndex === correctIndex) {
        this.score++;
      }
    }

    if (selectedIndex === correctIndex) {
      feedbackElement.textContent = "Correct!";
      feedbackElement.classList.add("correct");
    } else {
      feedbackElement.textContent = `Incorrect. The correct answer is: ${question.options[correctIndex]}`;
      feedbackElement.classList.add("incorrect");
    }

    // Highlight correct and selected options
    options.forEach((option, index) => {
      if (index === correctIndex) {
        option.classList.add("correct");
      } else if (index === selectedIndex && selectedIndex !== correctIndex) {
        option.classList.add("incorrect");
      }
      option.style.pointerEvents = "none";
    });

    this.showingFeedback = true;
    this.updateUI(); // Update button states after selection
  }

  showResults() {
    const quizContainer = document.querySelector(".quiz-container");
    const percentage = Math.round((this.score / this.questions.length) * 100);

    quizContainer.innerHTML = `
      <div class="results">
        <h2>Quiz Completed!</h2>
        <p>Course: ${this.courseName}</p>
        <p>Score: ${this.score}/${this.questions.length}</p>
        <p>Percentage: ${percentage}%</p>
        <button onclick="location.reload()">Take Quiz Again</button>
      </div>
    `;
  }

  updateUI() {
    const courseTitle = document.getElementById("course-title");
    const questionCounter = document.getElementById("question-counter");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const submitBtn = document.getElementById("submit-btn");

    courseTitle.textContent = this.courseName || "Loading Quiz...";
    questionCounter.textContent = `Question ${
      this.currentQuestionIndex + 1
    } of ${this.questions.length}`;

    // Update button states
    prevBtn.disabled = this.currentQuestionIndex === 0;
    nextBtn.disabled =
      this.currentQuestionIndex === this.questions.length - 1 &&
      !this.showingFeedback;
    submitBtn.disabled = this.questions.length === 0;
  }

  setupEventListeners() {
    // Navigation buttons
    document.getElementById("prev-btn").addEventListener("click", () => {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
        this.showingFeedback = false; // Reset feedback state
        this.displayQuestion();
      }
    });

    document.getElementById("next-btn").addEventListener("click", () => {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        this.showingFeedback = false; // Reset feedback state
        this.displayQuestion();
      } else if (
        this.currentQuestionIndex === this.questions.length - 1 &&
        this.showingFeedback
      ) {
        // If on last question and feedback is showing, show results
        this.showResults();
      }
    });

    document.getElementById("submit-btn").addEventListener("click", () => {
      this.showResults();
    });
  }
}

// Initialize the quiz when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const quizApp = new QuizApp();
  quizApp.init();
});

// Sidebar functions for mobile navigation
const navbar = document.getElementById("sidebar");
function openSidebar() {
  navbar.classList.add("show");
}
function closebar() {
  navbar.classList.remove("show");
}
