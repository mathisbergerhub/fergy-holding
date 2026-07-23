const PAGE_EXPIRY = Date.parse("2026-08-06T23:59:59+02:00");

const questions = [
  {
    question: "Dans quelle r\u00e9gion se trouve l'agence de Saint-Priest ?",
    answers: [
      "Occitanie",
      "Auvergne-Rh\u00f4ne-Alpes",
      "Bourgogne-Franche-Comt\u00e9",
    ],
    correct: 1,
  },
  {
    question: "Montpellier se situe dans quelle r\u00e9gion ?",
    answers: [
      "Nouvelle-Aquitaine",
      "Provence-Alpes-C\u00f4te d'Azur",
      "Occitanie",
    ],
    correct: 2,
  },
  {
    question: "Quelle est la r\u00e9gion de M\u00e2con ?",
    answers: [
      "Bourgogne-Franche-Comt\u00e9",
      "Grand Est",
      "Auvergne-Rh\u00f4ne-Alpes",
    ],
    correct: 0,
  },
  {
    question: "Grenoble appartient \u00e0 quelle r\u00e9gion ?",
    answers: [
      "Occitanie",
      "Auvergne-Rh\u00f4ne-Alpes",
      "Bourgogne-Franche-Comt\u00e9",
    ],
    correct: 1,
  },
  {
    question: "Dans quelle r\u00e9gion se trouve Chalon-sur-Sa\u00f4ne ?",
    answers: [
      "Centre-Val de Loire",
      "Auvergne-Rh\u00f4ne-Alpes",
      "Bourgogne-Franche-Comt\u00e9",
    ],
    correct: 2,
  },
];

const pageContent = document.querySelector("#page-content");
const questionNumber = document.querySelector("[data-question-number]");
const progressBar = document.querySelector("[data-progress-bar]");
const questionText = document.querySelector("[data-question-text]");
const answerList = document.querySelector("[data-answer-list]");
const questionPanel = document.querySelector("[data-quiz-question]");
const quizActions = document.querySelector(".quiz__actions");
const nextButton = document.querySelector("[data-next-question]");
const skipButton = document.querySelector("[data-skip-quiz]");
const resultPanel = document.querySelector("[data-quiz-result]");
const scoreNode = document.querySelector("[data-score]");
const scoreMessage = document.querySelector("[data-score-message]");
const showVideosButton = document.querySelector("[data-show-videos]");
const videos = document.querySelector("[data-videos]");

let currentQuestion = 0;
let selectedAnswer = null;
let score = 0;

function showExpiredPage() {
  document.title = "Page expir\u00e9e | Fergy Holding";
  document.body.dataset.expired = "true";

  pageContent.className = "expired";
  pageContent.innerHTML = `
    <div class="expired__content">
      <img src="../assets/fergy-holding-logo.svg" alt="Fergy Holding">
      <h1>Cette page temporaire a expir\u00e9.</h1>
      <p>Les souvenirs de la pl\u00e9ni\u00e8re 2025 ne sont plus disponibles depuis cette adresse.</p>
    </div>
  `;
}

function checkExpiry() {
  if (Date.now() >= PAGE_EXPIRY) {
    showExpiredPage();
    return true;
  }

  return false;
}

function renderQuestion() {
  const item = questions[currentQuestion];

  selectedAnswer = null;
  questionNumber.textContent = String(currentQuestion + 1);
  progressBar.dataset.progress = String(currentQuestion + 1);
  questionText.textContent = item.question;
  answerList.replaceChildren();
  nextButton.disabled = true;
  nextButton.textContent =
    currentQuestion === questions.length - 1
      ? "Voir mon score"
      : "Valider la r\u00e9ponse";

  item.answers.forEach((answer, index) => {
    const button = document.createElement("button");

    button.className = "quiz__answer";
    button.type = "button";
    button.textContent = answer;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => selectAnswer(button, index));
    answerList.append(button);
  });
}

function selectAnswer(button, index) {
  answerList.querySelectorAll(".quiz__answer").forEach((answer) => {
    const isSelected = answer === button;

    answer.classList.toggle("is-selected", isSelected);
    answer.setAttribute("aria-pressed", String(isSelected));
  });

  selectedAnswer = index;
  nextButton.disabled = false;
}

function finishQuiz() {
  questionPanel.hidden = true;
  quizActions.hidden = true;
  resultPanel.hidden = false;
  scoreNode.textContent = `${score}/${questions.length}`;

  if (score === questions.length) {
    scoreMessage.textContent =
      "Parfait, la carte de nos agences n'a plus aucun secret pour vous.";
  } else if (score >= 3) {
    scoreMessage.textContent =
      "Bien jou\u00e9, vous connaissez d\u00e9j\u00e0 tr\u00e8s bien le terrain.";
  } else {
    scoreMessage.textContent =
      "Pas grave, l'essentiel \u00e9tait de participer. Les vid\u00e9os sont d\u00e9bloqu\u00e9es.";
  }

  showVideosButton.focus();
}

function revealVideos() {
  videos.hidden = false;
  videos.scrollIntoView({ behavior: "smooth", block: "start" });
}

function skipQuiz() {
  questionPanel.hidden = true;
  quizActions.hidden = true;
  resultPanel.hidden = false;
  scoreNode.textContent = "Acc\u00e8s direct";
  scoreMessage.textContent = "Les Fast & Curious sont pr\u00eats \u00e0 \u00eatre t\u00e9l\u00e9charg\u00e9s.";
  revealVideos();
}

if (!checkExpiry()) {
  renderQuestion();

  nextButton.addEventListener("click", () => {
    if (selectedAnswer === null) {
      return;
    }

    if (selectedAnswer === questions[currentQuestion].correct) {
      score += 1;
    }

    if (currentQuestion === questions.length - 1) {
      finishQuiz();
      return;
    }

    currentQuestion += 1;
    renderQuestion();
  });

  skipButton.addEventListener("click", skipQuiz);
  showVideosButton.addEventListener("click", revealVideos);
  window.setInterval(checkExpiry, 60_000);
}
