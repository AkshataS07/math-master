/* ---------- STATE ---------- */
let mode = "";
let currentLevel = 1;
let currentScore = 0;
let attempts = 0;
let correct = 0;
let questions = [];
let current = null;
let selectedTable = null;

let startTime, timerInterval;

/* ---------- DOM ---------- */
const menu = document.getElementById("menu");
const tablesMenu = document.getElementById("tablesMenu");
const play = document.getElementById("play");

const levelEl = document.getElementById("level");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const feedbackEl = document.getElementById("feedback");
const mascotEl = document.getElementById("mascot");
const tableGrid = document.getElementById("tableGrid");

/* ---------- FRACTIONS ---------- */
const fractionAnswers = {
  2:["50","50%"],3:["33.33","33 1/3"],4:["25"],5:["20"],
  6:["16.66","16 2/3"],7:["14.28","14 2/7"],
  8:["12.5","12 1/2"],9:["11.11","11 1/9"],
  10:["10"],11:["9.09","9 1/11"],12:["8.33","8 1/3"],
  13:["7.69","7 9/13"],14:["7.14","7 1/7"],
  15:["6.66","6 2/3"],16:["6.25","6 1/4"],
  17:["5.88","5 15/17"],18:["5.55","5 5/9"],
  19:["5.26","5 5/19"],20:["5"]
};

/* ---------- START GAME ---------- */
function startGame(m) {
  mode = m;
  currentLevel = 1;
  resetStats();

  menu.classList.add("hidden");
  play.classList.remove("hidden");

  startLevel();
}

/* ---------- TABLES ---------- */
function openTablesMenu() {
  menu.classList.add("hidden");
  tablesMenu.classList.remove("hidden");
  tableGrid.innerHTML = "";

  for (let i = 5; i <= 30; i++) {
    const b = document.createElement("button");
    b.innerText = i;
    b.onclick = () => startSingleTable(i);
    tableGrid.appendChild(b);
  }
}

function startSingleTable(n) {
  mode = "singleTable";
  selectedTable = n;
  currentLevel = 1;
  resetStats();

  tablesMenu.classList.add("hidden");
  play.classList.remove("hidden");

  startLevel();
}

function startMixedTables() {
  mode = "mixedTables";
  currentLevel = 1;
  resetStats();

  tablesMenu.classList.add("hidden");
  play.classList.remove("hidden");

  startLevel();
}

/* ---------- RESET ---------- */
function resetStats() {
  currentScore = 0;
  attempts = 0;
  correct = 0;
}

/* ---------- LEVEL ---------- */
function startLevel() {
  updateHeader();
  loadQuestions();
  nextQuestion();
}

function updateHeader() {
  if (mode === "singleTable") {
    levelEl.innerText = `Table ${selectedTable} – Level ${currentLevel}`;
  } else if (mode === "mixedTables") {
    levelEl.innerText = `Tables Master`;
  } else {
    levelEl.innerText = `Level ${currentLevel}`;
  }

  scoreEl.innerText = `⭐ ${currentScore}`;
}

/* ---------- QUESTIONS ---------- */
function loadQuestions() {
  questions = [];

  if (mode === "square")
    for (let i = 1; i <= 40; i++) questions.push(i);

  if (mode === "cube")
    for (let i = 1; i <= 25; i++) questions.push(i);

  if (mode === "fraction")
    for (let i = 2; i <= 20; i++) questions.push(i);

  if (mode === "singleTable")
    for (let m = 1; m <= 10; m++) questions.push([selectedTable, m]);

  if (mode === "mixedTables")
    for (let t = 5; t <= 30; t++)
      for (let m = 1; m <= 10; m++) questions.push([t, m]);

  if (mode === "addition" || mode === "subtraction")
    questions = Array(20).fill(0);

  questions.sort(() => Math.random() - 0.5);
}

/* ---------- NEXT QUESTION ---------- */
function nextQuestion() {
  clearInterval(timerInterval);

  if (questions.length === 0) {
    if (
      (mode !== "mixedTables") &&
      currentLevel < 3
    ) {
      currentLevel++;
      startLevel();
    } else {
      endGame();
    }
    return;
  }

  current = questions.pop();

  if (mode === "square") questionEl.innerText = `${current}² = ?`;
  if (mode === "cube") questionEl.innerText = `${current}³ = ?`;
  if (mode === "fraction") questionEl.innerText = `1 / ${current} = ? %`;

  if (mode === "singleTable" || mode === "mixedTables")
    questionEl.innerText = `${current[0]} × ${current[1]} = ?`;

  if (mode === "addition" || mode === "subtraction") {
    let a = rand(), b = rand();
    if (mode === "subtraction") [a,b] = [Math.max(a,b), Math.min(a,b)];
    current = [a,b];
    questionEl.innerText = `${a} ${mode==="addition"?"+":"−"} ${b} = ?`;
  }

  answerEl.value = "";
  answerEl.focus();
  startTimer();
}

/* ---------- TIMER ---------- */
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    timerEl.innerText =
      `⏱ ${((Date.now()-startTime)/1000).toFixed(1)}s`;
  }, 100);
}

/* ---------- CHECK ---------- */
function checkAnswer() {
  clearInterval(timerInterval);
  attempts++;
  const time = ((Date.now()-startTime)/1000).toFixed(2);

  let correctAns;

  if (mode === "square") correctAns = current ** 2;
  if (mode === "cube") correctAns = current ** 3;
  if (mode === "singleTable" || mode === "mixedTables")
    correctAns = current[0] * current[1];
  if (mode === "addition") correctAns = current[0] + current[1];
  if (mode === "subtraction") correctAns = current[0] - current[1];

  if (mode === "fraction") {
    const input = answerEl.value.replace("%","").trim();
    if (fractionAnswers[current].some(v => v.replace("%","") === input))
      return success(time);
    return fail(fractionAnswers[current].join(" , ")+" %", time);
  }

  answerEl.value == correctAns ? success(time) : fail(correctAns, time);
}

/* ---------- FEEDBACK ---------- */
function success(time) {
  correct++;
  currentScore += 10;
  feedbackEl.innerText = `✅ Correct | ⏱ ${time}s`;
  mascotEl.innerText = "😄";
  scoreEl.innerText = `⭐ ${currentScore}`;
  setTimeout(nextQuestion, 900);
}

function fail(ans, time) {
  feedbackEl.innerText = `❌ ${ans} | ⏱ ${time}s`;
  mascotEl.innerText = "😵";
  setTimeout(nextQuestion, 1100);
}

/* ---------- END ---------- */
function endGame() {
  questionEl.innerText = "🏆 LEVEL COMPLETE";
  feedbackEl.innerText =
    `Correct: ${correct}/${attempts} | Accuracy: ${Math.round((correct/attempts)*100)}%`;
}

/* ---------- BACK ---------- */
function goBack() {
  clearInterval(timerInterval);
  play.classList.add("hidden");
  tablesMenu.classList.add("hidden");
  menu.classList.remove("hidden");
  mascotEl.innerText = "🐼";
}

/* ---------- UTILITY ---------- */
function rand() {
  return Math.floor(Math.random() * Math.pow(10, Math.floor(Math.random()*4)+1));
}
