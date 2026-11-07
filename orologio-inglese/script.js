"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clampHour = (hour) => ((Number(hour) - 1 + 12) % 12) + 1;
const pad = (value) => String(value).padStart(2, "0");
const timeKey = (hour, minute) => `${clampHour(hour)}:${Number(minute)}`;
const shuffle = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const hourWords = ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"];
const italianHours = ["dodici", "una", "due", "tre", "quattro", "cinque", "sei", "sette", "otto", "nove", "dieci", "undici"];
const smallNumbers = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];

function numberWord(number) {
  if (number < 20) return smallNumbers[number];
  if (number === 20) return "twenty";
  return `twenty-${smallNumbers[number - 20]}`;
}

function englishTime(hour, minute) {
  const h = clampHour(hour);
  const m = ((Number(minute) % 60) + 60) % 60;
  const current = hourWords[h % 12];
  const next = hourWords[clampHour(h + 1) % 12];
  if (m === 0) return `It's ${current} o'clock`;
  if (m === 15) return `It's quarter past ${current}`;
  if (m === 30) return `It's half past ${current}`;
  if (m === 45) return `It's quarter to ${next}`;
  if (m < 30) {
    const unit = m % 5 === 0 ? "" : ` ${m === 1 ? "minute" : "minutes"}`;
    return `It's ${numberWord(m)}${unit} past ${current}`;
  }
  const remaining = 60 - m;
  const unit = remaining % 5 === 0 ? "" : ` ${remaining === 1 ? "minute" : "minutes"}`;
  return `It's ${numberWord(remaining)}${unit} to ${next}`;
}

function italianTime(hour, minute) {
  const h = clampHour(hour);
  const m = ((Number(minute) % 60) + 60) % 60;
  const current = italianHours[h % 12];
  const nextHour = clampHour(h + 1);
  const next = italianHours[nextHour % 12];
  const prefix = h === 1 ? "È l'" : "Sono le ";
  const nextPrefix = nextHour === 1 ? "È l'" : "Sono le ";
  if (m === 0) return `${prefix}${current}`;
  if (m === 15) return `${prefix}${current} e un quarto`;
  if (m === 30) return `${prefix}${current} e mezza`;
  if (m === 45) return `${nextPrefix}${next} meno un quarto`;
  if (m < 30) return `${prefix}${current} e ${m}`;
  return `${nextPrefix}${next} meno ${60 - m}`;
}

function digitalTime(hour, minute) {
  return `${pad(clampHour(hour))}:${pad(minute)}`;
}

let totalStars = Number(localStorage.getItem("clockQuestStars") || 0);
const totalStarsNode = $("#totalStars");
totalStarsNode.textContent = totalStars;

function addStars(amount = 1) {
  totalStars += amount;
  localStorage.setItem("clockQuestStars", String(totalStars));
  totalStarsNode.textContent = totalStars;
}

let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    showToast("La sintesi vocale non è disponibile in questo browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/^It's/, "It is"));
  utterance.lang = "en-GB";
  utterance.rate = 0.84;
  utterance.pitch = 1.04;
  window.speechSynthesis.speak(utterance);
}

function launchConfetti() {
  const host = $("#confetti");
  host.innerHTML = "";
  const colors = ["#ff7fa2", "#ffd767", "#66d7b4", "#5db6eb", "#7d69ee"];
  for (let i = 0; i < 55; i += 1) {
    const piece = document.createElement("i");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--drift", `${Math.round(Math.random() * 180 - 90)}px`);
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;
    host.appendChild(piece);
  }
  setTimeout(() => { host.innerHTML = ""; }, 3800);
}

function setRoute(route) {
  $$(".page").forEach((page) => {
    const active = page.dataset.page === route;
    page.hidden = !active;
    page.classList.toggle("active", active);
  });
  $$(".nav-link").forEach((link) => {
    const active = (route === "quiz" && link.dataset.level === String(quizState.level)) || link.dataset.route === route;
    link.classList.toggle("active", active);
  });
  $("#mainNav").classList.remove("open");
  $("#menuToggle").setAttribute("aria-expanded", "false");
  const page = $(`[data-page="${route}"]`);
  if (page) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    page.focus({ preventScroll: true });
  }
}

function createClock(host, hour, minute, options = {}) {
  const settings = { interactive: false, showNumbers: true, onChange: null, ...options };
  let currentHour = clampHour(hour);
  let currentMinute = Number(minute) % 60;
  let selectedHand = "hour";
  let dragging = null;

  host.innerHTML = "";
  host.classList.add(options.className || "clock-large");
  host.setAttribute("role", settings.interactive ? "group" : "img");
  host.setAttribute("aria-label", `${digitalTime(currentHour, currentMinute)}: ${englishTime(currentHour, currentMinute)}`);

  for (let tick = 0; tick < 60; tick += 1) {
    const mark = document.createElement("i");
    mark.className = `clock-tick${tick % 5 === 0 ? " major" : ""}`;
    mark.style.transform = `translateX(-50%) rotate(${tick * 6}deg)`;
    host.appendChild(mark);
  }

  if (settings.showNumbers) {
    for (let number = 1; number <= 12; number += 1) {
      const node = document.createElement(settings.interactive ? "button" : "span");
      node.className = "clock-number";
      node.textContent = number;
      const radians = (number * 30 * Math.PI) / 180;
      node.style.left = `${50 + 39.5 * Math.sin(radians)}%`;
      node.style.top = `${50 - 39.5 * Math.cos(radians)}%`;
      if (settings.interactive) {
        node.type = "button";
        node.setAttribute("aria-label", `Numero ${number}`);
        node.addEventListener("click", () => {
          if (selectedHand === "hour") currentHour = number;
          else currentMinute = (number % 12) * 5;
          update();
          notify();
        });
      }
      host.appendChild(node);
    }
  }

  const hourHand = document.createElement("i");
  hourHand.className = "clock-hand hour";
  hourHand.setAttribute("aria-hidden", "true");
  const minuteHand = document.createElement("i");
  minuteHand.className = "clock-hand minute";
  minuteHand.setAttribute("aria-hidden", "true");
  const center = document.createElement("i");
  center.className = "clock-center";
  host.append(hourHand, minuteHand, center);

  function update() {
    hourHand.style.transform = `rotate(${(currentHour % 12) * 30 + currentMinute * 0.5}deg)`;
    minuteHand.style.transform = `rotate(${currentMinute * 6}deg)`;
    hourHand.classList.toggle("active", settings.interactive && selectedHand === "hour");
    minuteHand.classList.toggle("active", settings.interactive && selectedHand === "minute");
    host.setAttribute("aria-label", `${digitalTime(currentHour, currentMinute)}: ${englishTime(currentHour, currentMinute)}`);
  }

  function notify() {
    if (typeof settings.onChange === "function") settings.onChange(currentHour, currentMinute, selectedHand);
  }

  function angleFromPointer(event) {
    const rect = host.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    return (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
  }

  function moveHand(event) {
    if (!dragging) return;
    event.preventDefault();
    const angle = angleFromPointer(event);
    if (dragging === "minute") currentMinute = Math.round(angle / 6) % 60;
    else currentHour = Math.round(angle / 30) || 12;
    selectedHand = dragging;
    update();
    notify();
  }

  if (settings.interactive) {
    [hourHand, minuteHand].forEach((hand) => {
      const handName = hand === hourHand ? "hour" : "minute";
      hand.style.cursor = "grab";
      hand.addEventListener("pointerdown", (event) => {
        dragging = handName;
        selectedHand = handName;
        hand.setPointerCapture?.(event.pointerId);
        update();
        notify();
      });
      hand.addEventListener("pointermove", moveHand);
      hand.addEventListener("pointerup", () => { dragging = null; });
      hand.addEventListener("pointercancel", () => { dragging = null; });
    });
  }

  update();
  return {
    setTime(nextHour, nextMinute) {
      currentHour = clampHour(nextHour);
      currentMinute = ((Number(nextMinute) % 60) + 60) % 60;
      update();
    },
    getTime() { return { hour: currentHour, minute: currentMinute }; },
    setSelected(hand) { selectedHand = hand; update(); notify(); },
    getSelected() { return selectedHand; }
  };
}

let studyClock;
let studyTranslationVisible = true;
const examples = [[3, 0], [6, 30], [9, 15], [2, 45], [4, 10], [7, 20], [1, 50], [5, 35]];

function updateStudy(hour, minute, selectedHand = studyClock?.getSelected() || "hour") {
  $("#digitalTime").textContent = digitalTime(hour, minute);
  $("#englishTime").textContent = englishTime(hour, minute);
  $("#italianTime").textContent = studyTranslationVisible ? italianTime(hour, minute) : "Traduzione nascosta";
  $("#activeHandLabel").textContent = selectedHand === "hour" ? "Sposto le ore" : "Sposto i minuti";
  $("#selectHour").classList.toggle("active", selectedHand === "hour");
  $("#selectMinute").classList.toggle("active", selectedHand === "minute");
  $("#selectHour").setAttribute("aria-pressed", String(selectedHand === "hour"));
  $("#selectMinute").setAttribute("aria-pressed", String(selectedHand === "minute"));
}

function initStudy() {
  studyClock = createClock($("#studyClock"), 3, 0, { interactive: true, onChange: updateStudy });
  $("#exampleTimes").innerHTML = examples.map(([hour, minute]) => `<button class="time-chip" type="button" data-example-hour="${hour}" data-example-minute="${minute}">${digitalTime(hour, minute)}</button>`).join("");

  const rules = [
    { icon: "🕛", title: "O'clock", note: "Minuti = 00", formula: "It's [ORA] o'clock", time: [3, 0], color: "#5db6eb" },
    { icon: "🕧", title: "Half past", note: "Minuti = 30", formula: "It's half past [ORA]", time: [2, 30], color: "#66d7b4" },
    { icon: "🕒", title: "Quarter past / to", note: "Minuti = 15 oppure 45", formula: "quarter past [ORA] • quarter to [ORA+1]", time: [4, 45], color: "#ffd05b" },
    { icon: "➡️", title: "Past", note: "Da 1 a 29 minuti", formula: "It's [MINUTI] past [ORA]", time: [6, 20], color: "#ff9d57" },
    { icon: "⬅️", title: "To", note: "Da 31 a 59 minuti", formula: "It's [60−MIN] to [ORA+1]", time: [8, 50], color: "#ff7fa2" }
  ];
  $("#ruleGrid").innerHTML = rules.map((rule) => {
    const [hour, minute] = rule.time;
    return `<article class="rule-card" style="--rule-color:${rule.color}">
      <span class="rule-icon" aria-hidden="true">${rule.icon}</span>
      <h3>${rule.title}</h3><p>${rule.note}</p>
      <div class="formula">${rule.formula}</div>
      <button class="example-speak" type="button" data-speak="${englishTime(hour, minute)}">🔊 ${englishTime(hour, minute)}</button>
      <p class="rule-translation">${italianTime(hour, minute)}</p>
    </article>`;
  }).join("");
  updateStudy(3, 0, "hour");
}

const levelConfig = {
  1: { title: "O'clock & Half past", description: "Ore esatte e mezze ore: scegli la frase o l'orologio corretto.", minutes: [0, 30], color: "#e6b227" },
  2: { title: "Quarter past & Quarter to", description: "Aggiungiamo i quarti. Ricorda: “to” usa l'ora successiva!", minutes: [0, 15, 30, 45], color: "#745de2" },
  3: { title: "Past & To", description: "Tutti gli orari ogni cinque minuti: la sfida completa.", minutes: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], color: "#2cad83" }
};

const quizState = { level: 1, mode: "clock", index: 0, score: 0, answered: false, question: null, total: 10 };

function randomTime(level = quizState.level) {
  const minutes = levelConfig[level].minutes;
  return { hour: 1 + Math.floor(Math.random() * 12), minute: minutes[Math.floor(Math.random() * minutes.length)] };
}

function uniqueTimes(correct, level, count = 4) {
  const results = [correct];
  let attempts = 0;
  while (results.length < count && attempts < 200) {
    attempts += 1;
    const candidate = randomTime(level);
    if (!results.some((item) => timeKey(item.hour, item.minute) === timeKey(candidate.hour, candidate.minute)) &&
        !results.some((item) => englishTime(item.hour, item.minute) === englishTime(candidate.hour, candidate.minute))) {
      results.push(candidate);
    }
  }
  return shuffle(results);
}

function updateBestScore() {
  const best = localStorage.getItem(`clockQuestBest${quizState.level}`);
  $("#bestScore").textContent = best === null ? "—" : `${best}/${quizState.total}`;
}

function startQuiz(level, keepMode = true) {
  quizState.level = Number(level);
  if (!keepMode) quizState.mode = "clock";
  quizState.index = 0;
  quizState.score = 0;
  quizState.answered = false;
  const config = levelConfig[quizState.level];
  $("#quizKicker").textContent = `LIVELLO ${quizState.level}`;
  $("#quizTitle").textContent = config.title;
  $("#quizDescription").textContent = config.description;
  $("#quizScore").textContent = "0";
  $("#quizAnswered").textContent = "0";
  $$("[data-quiz-mode]").forEach((button) => button.classList.toggle("active", button.dataset.quizMode === quizState.mode));
  $("#resultsCard").hidden = true;
  $("#quizCard").hidden = false;
  $("#nextLevel").hidden = quizState.level === 3;
  updateBestScore();
  setRoute("quiz");
  renderQuestion();
}

function renderQuestion() {
  quizState.answered = false;
  const correct = randomTime();
  const actualMode = quizState.mode === "mixed" ? (Math.random() < 0.5 ? "clock" : "phrase") : quizState.mode;
  quizState.question = { ...correct, actualMode };
  const options = uniqueTimes(correct, quizState.level);
  $("#questionCount").textContent = `DOMANDA ${quizState.index + 1} DI ${quizState.total}`;
  $("#quizProgress").style.width = `${((quizState.index + 1) / quizState.total) * 100}%`;
  $("#quizFeedback").textContent = "";
  $("#quizFeedback").className = "quiz-feedback";
  $("#nextQuestion").hidden = true;

  const visual = $("#questionVisual");
  const answerHost = $("#answerOptions");
  if (actualMode === "clock") {
    $("#questionPrompt").textContent = "Che ora indica l'orologio?";
    visual.innerHTML = '<div class="clock-large" id="questionClock"></div>';
    createClock($("#questionClock"), correct.hour, correct.minute);
    answerHost.innerHTML = options.map((time) => `<button type="button" class="answer-option" data-answer="${timeKey(time.hour, time.minute)}">${englishTime(time.hour, time.minute)}</button>`).join("");
  } else {
    $("#questionPrompt").textContent = "Quale orologio mostra questa frase?";
    visual.innerHTML = `<div class="phrase-prompt"><span>LEGGI E OSSERVA</span>${englishTime(correct.hour, correct.minute)}<button type="button" class="icon-button" data-speak="${englishTime(correct.hour, correct.minute)}" aria-label="Ascolta la frase">🔊 Ascolta</button></div>`;
    answerHost.innerHTML = options.map((time, index) => `<button type="button" class="answer-option" data-answer="${timeKey(time.hour, time.minute)}" aria-label="Opzione ${index + 1}: ${digitalTime(time.hour, time.minute)}"><span class="mini-clock" data-mini-hour="${time.hour}" data-mini-minute="${time.minute}"></span></button>`).join("");
    $$("[data-mini-hour]", answerHost).forEach((clock) => createClock(clock, Number(clock.dataset.miniHour), Number(clock.dataset.miniMinute), { className: "mini-clock" }));
  }

  $$(".answer-option", answerHost).forEach((button) => button.addEventListener("click", () => answerQuestion(button)));
}

function answerQuestion(button) {
  if (quizState.answered) return;
  quizState.answered = true;
  const correctKey = timeKey(quizState.question.hour, quizState.question.minute);
  const isCorrect = button.dataset.answer === correctKey;
  $$(".answer-option", $("#answerOptions")).forEach((option) => {
    option.disabled = true;
    if (option.dataset.answer === correctKey) option.classList.add("correct");
  });
  if (!isCorrect) button.classList.add("wrong");
  if (isCorrect) {
    quizState.score += 1;
    addStars(1);
    $("#quizFeedback").textContent = "Excellent! Risposta corretta. ⭐";
    $("#quizFeedback").classList.add("good");
  } else {
    $("#quizFeedback").textContent = `Quasi! La risposta era: ${englishTime(quizState.question.hour, quizState.question.minute)}.`;
    $("#quizFeedback").classList.add("bad");
  }
  $("#quizScore").textContent = quizState.score;
  $("#quizAnswered").textContent = quizState.index + 1;
  $("#nextQuestion").textContent = quizState.index === quizState.total - 1 ? "Scopri il risultato →" : "Prossima domanda →";
  $("#nextQuestion").hidden = false;
}

function finishQuiz() {
  const oldBest = Number(localStorage.getItem(`clockQuestBest${quizState.level}`) || -1);
  if (quizState.score > oldBest) localStorage.setItem(`clockQuestBest${quizState.level}`, String(quizState.score));
  $("#quizCard").hidden = true;
  $("#resultsCard").hidden = false;
  $("#finalScore").textContent = `${quizState.score}/${quizState.total}`;
  const ratio = quizState.score / quizState.total;
  let title = "Continua ad allenarti!";
  let text = "Ogni tentativo ti rende più sicura. Riascolta le regole e riprova.";
  let medal = "💪";
  if (ratio >= 0.9) { title = "Time champion!"; text = "Risultato fantastico: sai leggere e dire l'ora con grande sicurezza."; medal = "🏆"; launchConfetti(); }
  else if (ratio >= 0.7) { title = "Bravissima!"; text = "Ottimo risultato. Un altro giro e sarai imbattibile!"; medal = "🥇"; }
  else if (ratio >= 0.5) { title = "Buon lavoro!"; text = "La strada è quella giusta: ripassa le regole che ti hanno creato dubbi."; medal = "⭐"; }
  $("#resultTitle").textContent = title;
  $("#resultText").textContent = text;
  $("#resultMedal").textContent = medal;
  updateBestScore();
}

let bingoState = { level: 3, cells: [], called: new Set(), deck: [], last: null, won: false };

function generateBingo() {
  bingoState.level = Number($("#bingoDifficulty").value);
  const chosen = [];
  while (chosen.length < 9) {
    const candidate = randomTime(bingoState.level);
    if (!chosen.some((time) => timeKey(time.hour, time.minute) === timeKey(candidate.hour, candidate.minute))) chosen.push(candidate);
  }
  bingoState.cells = chosen;
  bingoState.called = new Set();
  bingoState.deck = shuffle(chosen);
  bingoState.last = null;
  bingoState.won = false;
  $("#calledPhrase").textContent = "Premi il pulsante per cominciare!";
  $("#calledTranslation").textContent = "";
  $("#repeatCall").disabled = true;
  $("#bingoMessage").textContent = "";
  $("#calledHistory").innerHTML = '<p class="empty-history">Nessun orario chiamato.</p>';
  createClock($("#callerClock"), 12, 0, { className: "caller-clock-face" });
  renderBingoCells();
}

function renderBingoCells() {
  $("#bingoGrid").innerHTML = bingoState.cells.map((time, index) => `<button class="bingo-cell" type="button" data-bingo-index="${index}" data-time-key="${timeKey(time.hour, time.minute)}">
    <strong>${digitalTime(time.hour, time.minute)}</strong><small>${englishTime(time.hour, time.minute).replace("It's ", "")}</small>
  </button>`).join("");
}

function callBingoTime() {
  if (bingoState.won) {
    showToast("Hai già fatto BINGO! Crea una nuova scheda per continuare.");
    return;
  }
  if (!bingoState.deck.length) {
    showToast("Tutti gli orari sono stati chiamati. Controlla la scheda!");
    return;
  }
  const next = bingoState.deck.pop();
  bingoState.last = next;
  bingoState.called.add(timeKey(next.hour, next.minute));
  $("#calledPhrase").textContent = englishTime(next.hour, next.minute);
  $("#calledTranslation").textContent = italianTime(next.hour, next.minute);
  $("#repeatCall").disabled = false;
  createClock($("#callerClock"), next.hour, next.minute, { className: "caller-clock-face" });
  speak(englishTime(next.hour, next.minute));
  const history = $("#calledHistory");
  history.querySelector(".empty-history")?.remove();
  const item = document.createElement("span");
  item.className = "history-item";
  item.textContent = digitalTime(next.hour, next.minute);
  history.prepend(item);
}

function markBingoCell(button) {
  const key = button.dataset.timeKey;
  if (!bingoState.called.has(key)) {
    $("#bingoMessage").textContent = "Questo orario non è ancora stato chiamato. Ascolta bene! 👂";
    button.animate?.([{ transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }], { duration: 220 });
    return;
  }
  button.classList.toggle("marked");
  $("#bingoMessage").textContent = button.classList.contains("marked") ? "Casella segnata! Continua così. ✓" : "Casella deselezionata.";
  checkBingo();
}

function checkBingo() {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const buttons = $$(".bingo-cell");
  const winner = lines.find((line) => line.every((index) => buttons[index]?.classList.contains("marked")));
  if (!winner || bingoState.won) return;
  bingoState.won = true;
  winner.forEach((index) => buttons[index].classList.add("winning"));
  $("#bingoMessage").textContent = "🎉 BINGO! Tre orari in fila: missione compiuta!";
  addStars(5);
  launchConfetti();
  speak("Bingo! Great job!");
}

function initEvents() {
  document.addEventListener("click", (event) => {
    const routeButton = event.target.closest("[data-route]");
    if (routeButton) {
      event.preventDefault();
      setRoute(routeButton.dataset.route);
      return;
    }
    const levelButton = event.target.closest("[data-level]");
    if (levelButton) {
      startQuiz(Number(levelButton.dataset.level));
      return;
    }
    const speakButton = event.target.closest("[data-speak]");
    if (speakButton) speak(speakButton.dataset.speak);
  });

  $("#menuToggle").addEventListener("click", () => {
    const nav = $("#mainNav");
    const open = nav.classList.toggle("open");
    $("#menuToggle").setAttribute("aria-expanded", String(open));
  });

  $("#selectHour").addEventListener("click", () => studyClock.setSelected("hour"));
  $("#selectMinute").addEventListener("click", () => studyClock.setSelected("minute"));
  $("#timeMinus").addEventListener("click", () => {
    const time = studyClock.getTime();
    if (studyClock.getSelected() === "hour") studyClock.setTime(time.hour - 1, time.minute);
    else studyClock.setTime(time.hour, (time.minute + 55) % 60);
    updateStudy(studyClock.getTime().hour, studyClock.getTime().minute);
  });
  $("#timePlus").addEventListener("click", () => {
    const time = studyClock.getTime();
    if (studyClock.getSelected() === "hour") studyClock.setTime(time.hour + 1, time.minute);
    else studyClock.setTime(time.hour, (time.minute + 5) % 60);
    updateStudy(studyClock.getTime().hour, studyClock.getTime().minute);
  });
  $("#speakTime").addEventListener("click", () => {
    const time = studyClock.getTime();
    speak(englishTime(time.hour, time.minute));
  });
  $("#toggleTranslation").addEventListener("click", (event) => {
    studyTranslationVisible = !studyTranslationVisible;
    event.currentTarget.setAttribute("aria-pressed", String(studyTranslationVisible));
    const time = studyClock.getTime();
    updateStudy(time.hour, time.minute);
  });
  $("#exampleTimes").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-example-hour]");
    if (!chip) return;
    studyClock.setTime(Number(chip.dataset.exampleHour), Number(chip.dataset.exampleMinute));
    updateStudy(Number(chip.dataset.exampleHour), Number(chip.dataset.exampleMinute));
  });

  $$("[data-quiz-mode]").forEach((button) => button.addEventListener("click", () => {
    quizState.mode = button.dataset.quizMode;
    startQuiz(quizState.level);
  }));
  $("#nextQuestion").addEventListener("click", () => {
    if (quizState.index >= quizState.total - 1) finishQuiz();
    else { quizState.index += 1; renderQuestion(); }
  });
  $("#replayQuiz").addEventListener("click", () => startQuiz(quizState.level));
  $("#nextLevel").addEventListener("click", () => startQuiz(Math.min(3, quizState.level + 1), false));

  $("#callTime").addEventListener("click", callBingoTime);
  $("#repeatCall").addEventListener("click", () => {
    if (bingoState.last) speak(englishTime(bingoState.last.hour, bingoState.last.minute));
  });
  $("#newBingo").addEventListener("click", generateBingo);
  $("#bingoDifficulty").addEventListener("change", generateBingo);
  $("#printBingo").addEventListener("click", () => window.print());
  $("#bingoGrid").addEventListener("click", (event) => {
    const cell = event.target.closest(".bingo-cell");
    if (cell) markBingoCell(cell);
  });

  $("#resetProgress").addEventListener("click", () => {
    if (!window.confirm("Vuoi davvero azzerare stelle e migliori risultati?")) return;
    Object.keys(localStorage).filter((key) => key.startsWith("clockQuest")).forEach((key) => localStorage.removeItem(key));
    totalStars = 0;
    totalStarsNode.textContent = "0";
    showToast("Progressi azzerati.");
  });
}

initStudy();
generateBingo();
initEvents();
setRoute("home");
