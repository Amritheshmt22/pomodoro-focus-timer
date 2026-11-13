const MODES = {
  focus: {
    label: "Focus time",
    minutes: 25,
    startText: "Start focus",
    doneText: "Focus session complete"
  },
  short: {
    label: "Short break",
    minutes: 5,
    startText: "Start break",
    doneText: "Short break complete"
  },
  long: {
    label: "Long break",
    minutes: 15,
    startText: "Start long break",
    doneText: "Long break complete"
  }
};

const RING_LENGTH = 603.19;
const STORAGE_KEY = "pomodoro-focus-stats";

const modeButtons = Array.from(document.querySelectorAll(".mode-button"));
const modeLabel = document.getElementById("modeLabel");
const timeDisplay = document.getElementById("timeDisplay");
const timerStatus = document.getElementById("timerStatus");
const startPauseButton = document.getElementById("startPauseButton");
const resetButton = document.getElementById("resetButton");
const skipButton = document.getElementById("skipButton");
const ringProgress = document.getElementById("ringProgress");
const cycleDots = document.getElementById("cycleDots");
const sessionCount = document.getElementById("sessionCount");
const focusMinutes = document.getElementById("focusMinutes");
const cycleText = document.getElementById("cycleText");

let currentMode = "focus";
let remainingSeconds = MODES.focus.minutes * 60;
let timerId = null;
let cyclePosition = 1;
let stats = loadStats();

function loadStats() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      sessions: Number(saved?.sessions) || 0,
      minutes: Number(saved?.minutes) || 0
    };
  } catch (error) {
    return { sessions: 0, minutes: 0 };
  }
}

function saveStats() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function totalSeconds(mode = currentMode) {
  return MODES[mode].minutes * 60;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function renderCycleDots() {
  cycleDots.innerHTML = "";
  for (let index = 1; index <= 4; index += 1) {
    const dot = document.createElement("span");
    dot.className = index < cyclePosition ? "cycle-dot complete" : "cycle-dot";
    dot.setAttribute("aria-label", index < cyclePosition ? `Focus ${index} complete` : `Focus ${index} pending`);
    cycleDots.appendChild(dot);
  }
  cycleText.textContent = `${cyclePosition} of 4`;
}

function renderStats() {
  sessionCount.textContent = String(stats.sessions);
  focusMinutes.textContent = String(stats.minutes);
}

function render() {
  const mode = MODES[currentMode];
  const elapsedRatio = 1 - remainingSeconds / totalSeconds();
  modeLabel.textContent = mode.label;
  timeDisplay.textContent = formatTime(remainingSeconds);
  startPauseButton.textContent = timerId ? "Pause" : mode.startText;
  ringProgress.style.strokeDashoffset = String(RING_LENGTH * (1 - elapsedRatio));
  document.title = `${formatTime(remainingSeconds)} - ${mode.label}`;
  renderCycleDots();
  renderStats();
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function switchMode(nextMode, statusText = "Ready to start") {
  stopTimer();
  currentMode = nextMode;
  remainingSeconds = totalSeconds(nextMode);
  timerStatus.textContent = statusText;
  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === nextMode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  render();
}

function completeCurrentMode() {
  stopTimer();
  const finishedMode = currentMode;
  timerStatus.textContent = MODES[finishedMode].doneText;

  if (finishedMode === "focus") {
    stats.sessions += 1;
    stats.minutes += MODES.focus.minutes;
    saveStats();
    cyclePosition = cyclePosition === 4 ? 1 : cyclePosition + 1;
    const nextMode = cyclePosition === 1 ? "long" : "short";
    switchMode(nextMode, "Break is ready when you are");
    return;
  }

  switchMode("focus", "Ready for the next focus session");
}

function tick() {
  remainingSeconds -= 1;
  if (remainingSeconds <= 0) {
    remainingSeconds = 0;
    render();
    completeCurrentMode();
    return;
  }
  render();
}

function startOrPause() {
  if (timerId) {
    stopTimer();
    timerStatus.textContent = "Paused";
    render();
    return;
  }

  if (remainingSeconds === 0) {
    remainingSeconds = totalSeconds();
  }

  timerStatus.textContent = currentMode === "focus" ? "Focusing" : "Taking a break";
  timerId = setInterval(tick, 1000);
  render();
}

function resetCurrentMode() {
  stopTimer();
  remainingSeconds = totalSeconds();
  timerStatus.textContent = "Ready to start";
  render();
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => switchMode(button.dataset.mode));
});
startPauseButton.addEventListener("click", startOrPause);
resetButton.addEventListener("click", resetCurrentMode);
function skipCurrentMode() {
  stopTimer();
  if (currentMode === "focus") {
    const nextMode = cyclePosition === 4 ? "long" : "short";
    switchMode(nextMode, "Skipped to break");
    return;
  }
  switchMode("focus", "Skipped to focus");
}

skipButton.addEventListener("click", skipCurrentMode);

window.pomodoroTimer = {
  getState() {
    return {
      mode: currentMode,
      remainingSeconds,
      running: Boolean(timerId),
      cyclePosition,
      sessions: stats.sessions,
      minutes: stats.minutes
    };
  },
  setRemainingSeconds(seconds) {
    remainingSeconds = Math.max(0, Math.min(totalSeconds(), Number(seconds) || 0));
    render();
  }
};

render();
