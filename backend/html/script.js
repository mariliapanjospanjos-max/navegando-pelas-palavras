// Estado do jogo
let currentModule = "";
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let answered = false;

// Cronômetro
let startTime = null;
let timerInterval = null;
let totalTime = 0;

// Sons locais (pasta audio)
const soundCorrect = new Audio("audio/acerto.mp3");
const soundWrong = new Audio("audio/erro.mp3");
const soundAlegria = new Audio("audio/alegria.mp3");
const soundLamento = new Audio("audio/lamento.mp3");

// Iniciar cronômetro
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    totalTime = elapsed;

    // Atualizar display do tempo na tela
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = (seconds % 60).toString().padStart(2, "0");
    const displayMinutes = minutes.toString().padStart(2, "0");

    const timerElement = document.getElementById("timer-display");
    if (timerElement) {
      timerElement.textContent = `${displayMinutes}:${displaySeconds}`;
    }
  }, 1000);
}

// Parar cronômetro
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Formatar tempo para exibição
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  if (minutes > 0) {
    return `${minutes} min ${remainingSeconds} seg`;
  } else {
    return `${seconds} segundos`;
  }
}

// Dar inicio ao quiz
async function startQuiz(module) {
  currentModule = module;
  currentQuestionIndex = 0;
  score = 0;
  answered = false;
  totalTime = 0;

  // Iniciar cronômetro
  startTimer();

  try {
    const response = await fetch(
      `http://localhost:5000/api/questions?module=${module}`,
    );
    const allQuestions = await response.json();
    questions = allQuestions.slice(0, 5);

    if (questions.length === 0) {
      alert(
        "❌ Nenhuma questão encontrada para este módulo. Verifique se o backend está rodando!",
      );
      stopTimer();
      return;
    }

    document.getElementById("home-screen").style.display = "none";
    document.getElementById("quiz-screen").style.display = "block";
    document.getElementById("results-screen").style.display = "none";

    loadQuestion();
  } catch (error) {
    console.error("Erro:", error);
    alert(
      "❌ Erro ao carregar questões. Verifique se o backend está rodando em http://localhost:5000",
    );
    stopTimer();
  }
}

// Carregar questão
function loadQuestion() {
  if (currentQuestionIndex >= questions.length) {
    stopTimer(); // Parar cronômetro quando terminar
    showResults();
    return;
  }

  const question = questions[currentQuestionIndex];

  // Atualizar UI
  document.getElementById("current-q").textContent = currentQuestionIndex + 1;
  document.getElementById("total-q").textContent = questions.length;
  document.getElementById("question-text").textContent = question.question;

  // Calcular progresso
  const progress = Math.round((currentQuestionIndex / questions.length) * 100);
  document.getElementById("progress-bar").style.width = `${progress}%`;

  // Limpar opções
  const container = document.getElementById("options-container");
  container.innerHTML = "";

  // Adicionar opções
  question.options.forEach((option, index) => {
    const div = document.createElement("div");
    div.className = "option";
    div.textContent = option;
    div.dataset.index = index;
    div.onclick = () => answerQuestion(index);
    container.appendChild(div);
  });

  // Resetar estado
  answered = false;
  document.getElementById("next-btn").disabled = true;
}

// Responder questão
function answerQuestion(index) {
  if (answered) return;

  answered = true;
  const question = questions[currentQuestionIndex];
  const options = document.querySelectorAll(".option");

  // Desabilitar opções
  options.forEach((opt) => (opt.style.pointerEvents = "none"));

  // Marcar resposta
  options[index].classList.add("selected");

  if (index === question.correctAnswer) {
    // ✅ Resposta certa: Som de acerto + Serpentinas
    options[index].classList.add("correct");
    score++;

    // Tocar som de acerto
    soundCorrect.currentTime = 0;
    soundCorrect.play();

    // Serpentinas
    createConfetti();
  } else {
    // ❌ Resposta errada: Som de erro (sem serpentinas)
    options[index].classList.add("wrong");
    options[question.correctAnswer].classList.add("correct");

    // Tocar som de erro
    soundWrong.currentTime = 0;
    soundWrong.play();
  }

  // Habilitar próximo após 1.5s
  setTimeout(() => {
    document.getElementById("next-btn").disabled = false;
  }, 1500);
}

// Próxima questão
function nextQuestion() {
  currentQuestionIndex++;
  loadQuestion();
}

// Mostrar resultados
function showResults() {
  document.getElementById("quiz-screen").style.display = "none";
  document.getElementById("results-screen").style.display = "block";

  const total = questions.length;
  const percentage = Math.round((score / total) * 100);
  const timeTaken = formatTime(totalTime);

  // Atualizar UI
  document.getElementById("correct-count").textContent = score;
  document.getElementById("total-count").textContent = total;
  document.getElementById("final-score").textContent = `${percentage}%`;

  // Mostrar tempo nos resultados
  document.getElementById("time-taken").textContent = timeTaken;

  // Estrelas e mensagem
  const starsEl = document.getElementById("stars");
  const messageEl = document.getElementById("result-message");

  // ✨ Para quem acertou TUDO: Chuva ESPECIAL (100%)
  if (score === questions.length) {
    starsEl.textContent = "⭐⭐⭐⭐⭐";
    messageEl.textContent = "🌟 EXCELENTE! VOCÊ ACERTOU TUDO! 🎉";
    messageEl.className = "message excelente";
    createFullConfetti(); // Chuva ESPECIAL de serpentinas

    // Tocar som de alegria
    soundAlegria.currentTime = 0;
    soundAlegria.play();
  } else if (percentage >= 80) {
    starsEl.textContent = "⭐⭐⭐⭐⭐";
    messageEl.textContent = "🌟 Excelente! Você arrasou!";
    messageEl.className = "message excelente";

    // Tocar som de alegria
    soundAlegria.currentTime = 0;
    soundAlegria.play();
  } else if (percentage >= 60) {
    starsEl.textContent = "⭐⭐⭐⭐";
    messageEl.textContent = "👍 Muito bom! Continue praticando!";
    messageEl.className = "message bom";

    // Tocar som de alegria
    soundAlegria.currentTime = 0;
    soundAlegria.play();
  } else if (percentage >= 50) {
    starsEl.textContent = "⭐⭐⭐";
    messageEl.textContent = "💪 Você está aprendendo! Continue tentando!";
    messageEl.className = "message aprendendo";

    // Tocar som de alegria (mesmo sendo 50%)
    soundAlegria.currentTime = 0;
    soundAlegria.play();
  } else {
    starsEl.textContent = "⭐⭐";
    messageEl.textContent = "😔 Quase lá! Tente novamente!";
    messageEl.className = "message aprendendo";

    // Tocar som de lamento (menos de 50%)
    soundLamento.currentTime = 0;
    soundLamento.play();
  }
}

// Serpentinas para respostas certas
async function createConfetti() {
  const confetti = await loadConfettiLibrary();
  if (confetti) {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#FF6B35", "#00A896", "#2196F3", "#FFC107", "#9C27B0"],
    });
  }
}

// Para quem acertou TUDO: Chuva ESPECIAL (100%)
async function createFullConfetti() {
  const confetti = await loadConfettiLibrary();
  if (confetti) {
    // Primeira onda
    confetti({
      particleCount: 100,
      spread: 120,
      origin: { y: 0.6 },
      colors: [
        "#FF6B35",
        "#00A896",
        "#2196F3",
        "#FFC107",
        "#9C27B0",
        "#4CAF50",
      ],
    });

    // Segunda onda (com delay)
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.6 },
        colors: [
          "#FF6B35",
          "#00A896",
          "#2196F3",
          "#FFC107",
          "#9C27B0",
          "#4CAF50",
        ],
      });
    }, 400);

    // Terceira onda (com delay)
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.6 },
        colors: [
          "#FF6B35",
          "#00A896",
          "#2196F3",
          "#FFC107",
          "#9C27B0",
          "#4CAF50",
        ],
      });
    }, 800);
  }
}

// Carregar biblioteca de confetes
function loadConfettiLibrary() {
  return new Promise((resolve) => {
    if (window.confetti) {
      resolve(window.confetti);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
    script.onload = () => resolve(window.confetti);
    document.head.appendChild(script);
  });
}

// Salvar e reiniciar
function saveAndRestart() {
  const name = document.getElementById("student-name").value.trim() || "Aluno";

  // Enviar para backend com tempo
  fetch("http://localhost:5000/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      module: currentModule,
      score,
      total: questions.length,
      time: totalTime, // Incluir tempo no salvamento
    }),
  }).catch((err) => console.log("Erro ao salvar:", err));

  alert(
    `🏆 Parabéns, ${name}!\nSua pontuação foi salva!\n\nContinue estudando português! 📚`,
  );
  goHome();
}

// Voltar para início
function goHome() {
  document.getElementById("home-screen").style.display = "block";
  document.getElementById("quiz-screen").style.display = "none";
  document.getElementById("results-screen").style.display = "none";
  currentModule = "";
  questions = [];
  currentQuestionIndex = 0;
  score = 0;
  stopTimer();
}

// Mensagem de início
setTimeout(() => {
  alert(
    "✨ BEM-VINDO ÀS PALAVRINHAS MÁGICAS!\n\n✅ Escolha um módulo\n✅ Responda 5 questões\n✅ Ganhe serpentinas a cada acerto!\n✅ Veja sua pontuação e tempo no final\n\n👉 Divirta-se aprendendo! 😊",
  );
}, 800);
