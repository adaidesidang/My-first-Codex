const screens = {
  homePage: document.querySelector("#homePage"),
  invitePage: document.querySelector("#invitePage"),
  devicePage: document.querySelector("#devicePage"),
  gameMenuPage: document.querySelector("#gameMenuPage"),
  levelSelectPage: document.querySelector("#levelSelectPage"),
  skinsPage: document.querySelector("#skinsPage"),
  countdownPage: document.querySelector("#countdownPage"),
  gamePage: document.querySelector("#gamePage"),
  resultPage: document.querySelector("#resultPage"),
  leaderboardPage: document.querySelector("#leaderboardPage"),
  creditsPage: document.querySelector("#creditsPage"),
};

const historyStack = ["homePage"];
const canvas = document.querySelector("#gameCanvas");
const context = canvas.getContext("2d");
const scoreValue = document.querySelector("#scoreValue");
const pelletProgress = document.querySelector("#pelletProgress");
const powerProgress = document.querySelector("#powerProgress");
const ghostCountValue = document.querySelector("#ghostCountValue");
const ghostEffects = document.querySelector("#ghostEffects");
const gameModeLabel = document.querySelector("#gameModeLabel");
const statusText = document.querySelector("#gameStatus");
const resetButton = document.querySelector("#resetButton");
const exitGameButton = document.querySelector("#exitGameButton");
const patchNotesButton = document.querySelector("#patchNotesButton");
const patchModal = document.querySelector("#patchModal");
const patchCloseButton = document.querySelector("#patchCloseButton");
const patchScroll = document.querySelector(".patch-scroll");
const mobileAbilityButton = document.querySelector("#mobileAbilityButton");
const mobilePowerCount = document.querySelector("#mobilePowerCount");
const storyStartButton = document.querySelector("#storyStartButton");
const leaderboardList = document.querySelector("#leaderboardList");
const countdownNumber = document.querySelector("#countdownNumber");
const countdownMode = document.querySelector("#countdownMode");
const resultKicker = document.querySelector("#resultKicker");
const resultTitle = document.querySelector("#resultTitle");
const resultSummary = document.querySelector("#resultSummary");
const resultActions = document.querySelector("#resultActions");
const resultStage = document.querySelector("#resultStage");
const levelCards = document.querySelectorAll("[data-ghost-select]");
const deviceButtons = document.querySelectorAll("[data-device]");
const moveButtons = document.querySelectorAll("[data-move]");
const skinCards = document.querySelectorAll("[data-skin]");

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const mapPadding = 28;
const pacmanDelay = 211;
const ghostDelay = 235;
const basePhasedDuration = 7000;
const powerRange = 7;
const powerBeanColor = "#1d8cff";
const ghostColors = ["blue", "red", "yellow"];
const ghostColorValues = {
  blue: "#4db8ff",
  red: "#f07167",
  yellow: "#ffd166",
};
const skinColorValues = {
  red: "#ff4d6d",
  orange: "#ff9f1c",
  yellow: "#e4c16f",
  green: "#7bd88f",
  cyan: "#43e8d8",
  blue: "#4db8ff",
  purple: "#b983ff",
};

let currentMap = null;
let currentMapIndex = 0;
let tileSize = 32;
let offsetX = 0;
let offsetY = 0;
let pellets = new Set();
let powerPellets = new Set();
let totalPellets = 0;
let totalPowerPellets = 0;
let powerInventory = 0;
let powerUsed = 0;
let laserEffects = [];
let score = 0;
let gameRunning = false;
let animationId = null;
let lastFrameTime = 0;
let pacmanTimer = 0;
let ghostTimer = 0;
let pacman = null;
let ghosts = [];
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let currentGhostCount = 1;
let currentRunType = "Story";
let storyLevel = 1;
let threeGhostStreak = 0;
let threeGhostDifficulty = 0;
let selectedGhostCount = null;
let selectedDeviceChoice = null;
let selectedDevice = localStorage.getItem("miniPacDevice") || "desktop";
let selectedSkin = localStorage.getItem("miniPacSkin") || "yellow";

const mapDecks = {
  1: createDeck(1),
  2: createDeck(2),
  3: createDeck(3),
};
const mapPools = {
  1: shuffle([...Array(10).keys()]),
  2: shuffle([...Array(10).keys()]),
  3: shuffle([...Array(10).keys()]),
};

function showScreen(screenId, addToHistory = true) {
  if (screenId !== "gamePage" && gameRunning) {
    pauseGame("Paused. Return to the maze when you are ready.");
  }

  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[screenId].classList.add("active");

  if (addToHistory && historyStack[historyStack.length - 1] !== screenId) {
    historyStack.push(screenId);
  }

  if (screenId === "leaderboardPage") {
    renderLeaderboard();
  }

  if (screenId === "devicePage") {
    selectedDeviceChoice = null;
    deviceButtons.forEach((button) => button.classList.remove("selected"));
  }

  if (screenId === "gamePage") {
    drawGame();
  }
}

function goBack() {
  if (historyStack.length <= 1) {
    showScreen("homePage", false);
    return;
  }

  historyStack.pop();
  showScreen(historyStack[historyStack.length - 1], false);
}

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.go);
  });
});

document.querySelectorAll("[data-back]").forEach((button) => {
  button.addEventListener("click", goBack);
});

deviceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const device = button.dataset.device;

    if (selectedDeviceChoice === device && button.classList.contains("selected")) {
      setDeviceMode(device);
      showScreen("gameMenuPage");
      return;
    }

    selectedDeviceChoice = device;
    deviceButtons.forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
  });
});

storyStartButton.addEventListener("click", () => {
  storyLevel = 1;
  startCountdown(1, "Story");
});

levelCards.forEach((card) => {
  card.addEventListener("click", () => {
    const ghostCount = Number(card.dataset.ghostSelect);

    if (selectedGhostCount === ghostCount && card.classList.contains("selected")) {
      startCountdown(ghostCount, "Manual");
      return;
    }

    selectedGhostCount = ghostCount;
    levelCards.forEach((item) => item.classList.remove("selected"));
    card.classList.add("selected");
  });
});

resetButton.addEventListener("click", () => {
  startCountdown(currentGhostCount, currentRunType);
});

exitGameButton.addEventListener("click", () => {
  pauseGame("Exited to the arcade menu.");
  historyStack.length = 0;
  historyStack.push("homePage", "invitePage", "gameMenuPage");
  showScreen("gameMenuPage", false);
});

patchNotesButton.addEventListener("click", () => {
  patchModal.classList.add("active");
  patchModal.setAttribute("aria-hidden", "false");
  patchScroll.scrollTop = 0;
});

patchCloseButton.addEventListener("click", () => {
  patchModal.classList.remove("active");
  patchModal.setAttribute("aria-hidden", "true");
});

patchModal.addEventListener("click", (event) => {
  if (event.target === patchModal) {
    patchModal.classList.remove("active");
    patchModal.setAttribute("aria-hidden", "true");
  }
});

mobileAbilityButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  usePowerBean();
});

moveButtons.forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    setDirectionFromName(button.dataset.move);
  });
});

skinCards.forEach((card) => {
  card.addEventListener("click", () => {
    setSkin(card.dataset.skin);
  });
});

function setDeviceMode(device) {
  selectedDevice = device;
  localStorage.setItem("miniPacDevice", device);
  document.body.classList.toggle("mobile-mode", device === "mobile");
  document.body.classList.toggle("desktop-mode", device !== "mobile");
}

function setSkin(skin) {
  selectedSkin = skin;
  localStorage.setItem("miniPacSkin", skin);
  skinCards.forEach((card) => card.classList.toggle("selected", card.dataset.skin === skin));
  drawGame();
}

function setDirectionFromName(name) {
  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  if (directions[name]) {
    nextDirection = directions[name];
  }
}

function startCountdown(ghostCount, runType) {
  pauseGame();
  currentGhostCount = ghostCount;
  currentRunType = runType;
  countdownMode.textContent = `${runType} / ${ghostCount} ${ghostCount === 1 ? "Ghost" : "Ghosts"}`;
  showScreen("countdownPage");

  let number = 3;
  countdownNumber.textContent = number;
  const timer = setInterval(() => {
    number -= 1;
    if (number > 0) {
      countdownNumber.textContent = number;
      return;
    }

    clearInterval(timer);
    countdownNumber.textContent = "Go";
    setTimeout(() => {
      prepareGame(ghostCount, runType);
      if (historyStack[historyStack.length - 1] === "countdownPage") {
        historyStack.pop();
      }
      showScreen("gamePage");
      startGameLoop();
    }, 520);
  }, 780);
}

function prepareGame(ghostCount, runType) {
  currentGhostCount = ghostCount;
  currentRunType = runType;
  if (ghostCount === 3) {
    threeGhostStreak += 1;
    threeGhostDifficulty = Math.min(Math.max(0, threeGhostStreak - 1) * 0.045, 0.18);
  } else {
    threeGhostStreak = 0;
    threeGhostDifficulty = 0;
  }
  currentMapIndex = drawMapIndex(ghostCount);
  currentMap = mapDecks[ghostCount][currentMapIndex];
  tileSize = Math.min(
    (canvasWidth - mapPadding * 2) / currentMap.cols,
    (canvasHeight - mapPadding * 2) / currentMap.rows
  );
  offsetX = (canvasWidth - currentMap.cols * tileSize) / 2;
  offsetY = (canvasHeight - currentMap.rows * tileSize) / 2;

  pellets = new Set();
  powerPellets = new Set();
  laserEffects = [];
  totalPellets = 0;
  totalPowerPellets = 0;
  powerInventory = 0;
  powerUsed = 0;
  score = 0;
  gameRunning = false;
  pacman = { ...currentMap.playerStart, mouth: 0 };
  direction = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };
  pacmanTimer = 0;
  ghostTimer = 0;
  ghosts = currentMap.ghostStarts.slice(0, ghostCount).map((start, index) => ({
    ...start,
    index,
    color: ghostColors[index],
    direction: { x: index % 2 === 0 ? -1 : 1, y: 0 },
    memory: [],
    timer: 0,
    phasedUntil: 0,
    pressureDumbUntil: 0,
    wobble: 0,
  }));

  currentMap.rowsData.forEach((row, y) => {
    row.split("").forEach((tile, x) => {
      if (tile === "." && shouldPlacePellet(x, y)) {
        pellets.add(`${x},${y}`);
      }
    });
  });
  placePowerBeans();
  totalPellets = pellets.size;
  totalPowerPellets = powerPellets.size;

  updateScore();
  ghostCountValue.textContent = ghostCount;
  gameModeLabel.textContent = `${runType} / Map ${currentMapIndex + 1} / ${ghostCount} ${ghostCount === 1 ? "Ghost" : "Ghosts"}`;
  statusText.textContent = selectedDevice === "mobile"
    ? "Use the arrows. Center button spends a power bean."
    : "Use arrow keys or WASD. Press X to spend a power bean.";
  drawGame();
}

function startGameLoop() {
  gameRunning = true;
  lastFrameTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
}

function pauseGame(message = "") {
  gameRunning = false;
  cancelAnimationFrame(animationId);
  if (message) {
    statusText.textContent = message;
  }
}

function updateScore() {
  scoreValue.textContent = score;
  pelletProgress.textContent = `Beans ${totalPellets - pellets.size} / ${totalPellets}`;
  powerProgress.textContent = `Power ${powerInventory - powerUsed} / ${powerPellets.size} left`;
  mobilePowerCount.textContent = powerInventory - powerUsed;
  mobileAbilityButton.classList.toggle("ready", powerInventory - powerUsed > 0);
  renderGhostEffects();
}

function shouldPlacePellet(x, y) {
  const nearPlayer = Math.abs(x - currentMap.playerStart.x) + Math.abs(y - currentMap.playerStart.y) < 4;
  const nearGhost = currentMap.ghostStarts.some((start) => Math.abs(x - start.x) + Math.abs(y - start.y) < 3);

  if (nearPlayer || nearGhost) {
    return false;
  }

  const openNeighbors = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ].filter((move) => isOpen(x + move.x, y + move.y)).length;

  return openNeighbors >= 2 && (x + y + currentMapIndex) % 2 === 0;
}

function drawMapIndex(ghostCount) {
  if (mapPools[ghostCount].length === 0) {
    mapPools[ghostCount] = shuffle([...Array(10).keys()]);
  }
  return mapPools[ghostCount].pop();
}

function canMove(position, moveDirection) {
  const nextX = position.x + moveDirection.x;
  const nextY = position.y + moveDirection.y;
  return currentMap.rowsData[nextY] && currentMap.rowsData[nextY][nextX] !== "#";
}

function isOpen(x, y) {
  return currentMap.rowsData[y] && currentMap.rowsData[y][x] !== "#";
}

function movePacman() {
  if (canMove(pacman, nextDirection)) {
    direction = nextDirection;
  }

  if (canMove(pacman, direction)) {
    pacman.x += direction.x;
    pacman.y += direction.y;
  }

  const key = `${pacman.x},${pacman.y}`;
  if (pellets.has(key)) {
    pellets.delete(key);
    score += 10;
    updateScore();
  }

  if (powerPellets.has(key)) {
    powerPellets.delete(key);
    powerInventory += 1;
    score += 25;
    statusText.textContent = selectedDevice === "mobile" ? "Power bean ready. Tap the center button." : "Power bean ready. Press X near a ghost.";
    updateScore();
  }
}

function placePowerBeans() {
  const target = currentGhostCount === 1
    ? (Math.random() < 0.5 ? 1 : 0)
    : currentGhostCount === 2
    ? (Math.random() < 0.22 ? 2 : 1)
    : (Math.random() < 0.2 ? 3 : 2);

  if (target === 0) {
    return;
  }

  const deadEnds = [];
  currentMap.rowsData.forEach((row, y) => {
    row.split("").forEach((tile, x) => {
      if (tile !== ".") {
        return;
      }

      const openNeighbors = getOpenDirections({ x, y });
      const awayFromActors = Math.abs(x - pacman.x) + Math.abs(y - pacman.y) > 4
        && ghosts.every((ghost) => Math.abs(x - ghost.x) + Math.abs(y - ghost.y) > 4);
      if (openNeighbors.length === 1 && awayFromActors) {
        deadEnds.push({ x, y });
      }
    });
  });

  shuffle(deadEnds).slice(0, target).forEach((cell) => {
    const key = `${cell.x},${cell.y}`;
    powerPellets.add(key);
  });
}

function getOpenDirections(position) {
  return [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ].filter((option) => canMove(position, option));
}

function moveGhost(ghost) {
  const options = getOpenDirections(ghost);

  if (options.length === 0) {
    return;
  }

  const phased = isGhostPhased(ghost);
  const pressured = ghost.pressureDumbUntil > performance.now();
  const reverse = { x: -ghost.direction.x, y: -ghost.direction.y };
  const forwardWorks = canMove(ghost, ghost.direction);
  const filtered = options.filter((option) => option.x !== reverse.x || option.y !== reverse.y);
  const choices = filtered.length > 0 ? filtered : options;
  const lineChase = !pressured && !phased ? getLineChaseDirection(ghost, choices) : null;
  const shouldChoose = Boolean(lineChase) || pressured || !forwardWorks || choices.length > 1 && Math.random() < (phased ? 0.7 : 0.42);

  if (shouldChoose) {
    const ranked = choices
      .map((option) => ({ option, distance: ghostDistance(ghost.x + option.x, ghost.y + option.y) }))
      .sort((a, b) => a.distance - b.distance);

    if (pressured) {
      ghost.direction = Math.random() < 0.68
        ? ranked[ranked.length - 1].option
        : choices[Math.floor(Math.random() * choices.length)];
    } else if (phased) {
      ghost.direction = Math.random() < 0.46
        ? ranked[ranked.length - 1].option
        : ranked[0].option;
      ghost.wobble += 1;
    } else if (lineChase && Math.random() < 0.86 + threeGhostDifficulty) {
      ghost.direction = lineChase;
    } else if (Math.random() < 0.58) {
      ghost.direction = ranked[0].option;
    } else {
      ghost.direction = choices[Math.floor(Math.random() * choices.length)];
    }
  }

  ghost.x += ghost.direction.x;
  ghost.y += ghost.direction.y;

  const key = `${ghost.x},${ghost.y}`;
  ghost.memory.push(key);
  if (ghost.memory.length > 5) {
    ghost.memory.shift();
  }

  if (ghost.memory.filter((value) => value === key).length >= 3) {
    ghost.direction = choices[Math.floor(Math.random() * choices.length)];
  }
}

function getGhostMoveDelay(ghost) {
  if (isGhostPhased(ghost)) {
    return ghostDelay / 0.3;
  }

  if (currentGhostCount === 3) {
    return ghostDelay / 0.9;
  }

  return ghostDelay;
}

function getLineChaseDirection(ghost, choices) {
  if (currentGhostCount !== 3) {
    return null;
  }

  const sameColumn = ghost.x === pacman.x;
  const sameRow = ghost.y === pacman.y;
  if (!sameColumn && !sameRow) {
    return null;
  }

  const directionToPacman = sameColumn
    ? { x: 0, y: Math.sign(pacman.y - ghost.y) }
    : { x: Math.sign(pacman.x - ghost.x), y: 0 };

  if (directionToPacman.x === 0 && directionToPacman.y === 0) {
    return null;
  }

  const distance = sameColumn ? Math.abs(pacman.y - ghost.y) : Math.abs(pacman.x - ghost.x);
  for (let step = 1; step < distance; step += 1) {
    const x = ghost.x + directionToPacman.x * step;
    const y = ghost.y + directionToPacman.y * step;
    if (!isOpen(x, y)) {
      return null;
    }
  }

  return choices.find((choice) => choice.x === directionToPacman.x && choice.y === directionToPacman.y) || null;
}

function ghostDistance(x, y) {
  return Math.abs(x - pacman.x) + Math.abs(y - pacman.y);
}

function isGhostPhased(ghost) {
  return ghost.phasedUntil > performance.now();
}

function getPhasedDuration() {
  if (currentGhostCount === 3) {
    return basePhasedDuration + 1000;
  }

  if (currentGhostCount === 2) {
    return basePhasedDuration + 500;
  }

  return basePhasedDuration;
}

function usePowerBean() {
  if (!gameRunning || powerInventory - powerUsed <= 0) {
    return;
  }

  const target = findPowerTarget();
  if (!target) {
    statusText.textContent = "No ghost is in a clear power line.";
    return;
  }

  const now = performance.now();
  if (isGhostPhased(target)) {
    return;
  }

  powerUsed += 1;
  const duration = getPhasedDuration();
  target.phaseDuration = duration;
  target.phasedUntil = now + duration;
  target.timer = 0;
  target.wobble = 0;
  laserEffects.push({
    from: { x: pacman.x, y: pacman.y },
    to: { x: target.x, y: target.y },
    startedAt: now,
  });
  statusText.textContent = `${target.color[0].toUpperCase()}${target.color.slice(1)} ghost phased for ${duration / 1000}s.`;
  updateScore();
}

function findPowerTarget() {
  const candidates = ghosts
    .filter((ghost) => !isGhostPhased(ghost))
    .map((ghost) => ({ ghost, distance: lineDistanceToGhost(ghost) }))
    .filter((item) => item.distance > 0 && item.distance <= powerRange)
    .sort((a, b) => a.distance - b.distance);

  return candidates[0] ? candidates[0].ghost : null;
}

function lineDistanceToGhost(ghost) {
  const sameColumn = ghost.x === pacman.x;
  const sameRow = ghost.y === pacman.y;

  if (!sameColumn && !sameRow) {
    return Infinity;
  }

  const step = sameColumn
    ? { x: 0, y: Math.sign(ghost.y - pacman.y) }
    : { x: Math.sign(ghost.x - pacman.x), y: 0 };

  if (step.x === 0 && step.y === 0) {
    return 0;
  }

  for (let distance = 1; distance <= powerRange; distance += 1) {
    const x = pacman.x + step.x * distance;
    const y = pacman.y + step.y * distance;
    if (!isOpen(x, y)) {
      return Infinity;
    }
    if (ghost.x === x && ghost.y === y) {
      return distance;
    }
  }

  return Infinity;
}

function checkCollision() {
  return ghosts.some((ghost) => ghost.x === pacman.x && ghost.y === pacman.y && !isGhostPhased(ghost));
}

function softenHeavyPressure() {
  if (currentGhostCount !== 3 || ghosts.length < 3) {
    return;
  }

  const now = performance.now();
  if (ghosts.some((ghost) => ghost.pressureDumbUntil > now)) {
    return;
  }

  const closeGhosts = ghosts.filter((ghost) => ghostDistance(ghost.x, ghost.y) <= 5 && !isGhostPhased(ghost));
  if (closeGhosts.length === 3 && Math.random() < 0.035) {
    const chosen = closeGhosts[Math.floor(Math.random() * closeGhosts.length)];
    chosen.pressureDumbUntil = now + 1800;
  }
}

function gameLoop(timestamp) {
  if (!gameRunning) {
    return;
  }

  const delta = timestamp - lastFrameTime;
  lastFrameTime = timestamp;
  pacmanTimer += delta;

  if (pacmanTimer >= pacmanDelay) {
    pacmanTimer = 0;
    movePacman();
    pacman.mouth += 0.28;
  }

  ghosts.forEach((ghost) => {
    ghost.timer += delta;
    const delay = getGhostMoveDelay(ghost);
    if (ghost.timer >= delay) {
      ghost.timer = 0;
      moveGhost(ghost);
    }
  });
  softenHeavyPressure();

  laserEffects = laserEffects.filter((effect) => timestamp - effect.startedAt < 420);
  renderGhostEffects();

  if (checkCollision()) {
    finishGame(false);
    return;
  }

  if (pellets.size === 0) {
    finishGame(true);
    return;
  }

  drawGame();
  animationId = requestAnimationFrame(gameLoop);
}

function finishGame(won) {
  pauseGame();
  saveLeaderboardScore(score, won);
  showResult(won);
}

function showResult(won) {
  resultKicker.textContent = won ? "Victory" : "Game Over";
  resultTitle.textContent = won ? "Beautiful run." : "The tide took this one.";
  resultSummary.textContent = `${score} points · ${currentRunType} · ${currentGhostCount} ${currentGhostCount === 1 ? "Ghost" : "Ghosts"}`;
  renderResultStage(won);
  resultActions.innerHTML = "";

  const mainButton = document.createElement("button");
  mainButton.className = "ghost-button";
  mainButton.type = "button";
  mainButton.textContent = "Back to Main Page";
  mainButton.addEventListener("click", () => {
    historyStack.length = 0;
    historyStack.push("homePage", "invitePage", "gameMenuPage");
    showScreen("gameMenuPage", false);
  });
  resultActions.appendChild(mainButton);

  const nextButton = document.createElement("button");
  nextButton.className = "primary-button";
  nextButton.type = "button";

  if (won) {
    nextButton.textContent = "Continue to Next Level";
    nextButton.addEventListener("click", () => {
      if (currentRunType === "Story") {
        storyLevel += 1;
        startCountdown(Math.min(storyLevel, 3), "Story");
      } else {
        startCountdown(currentGhostCount, "Manual");
      }
    });
  } else {
    nextButton.textContent = "Restart";
    nextButton.addEventListener("click", () => {
      startCountdown(currentGhostCount, currentRunType);
    });
  }

  resultActions.appendChild(nextButton);
  showScreen("resultPage");
}

function renderResultStage(won) {
  resultStage.innerHTML = "";
  const pac = document.createElement("span");
  pac.className = "runner result-pac";
  pac.style.left = won ? "18%" : "30%";
  pac.style.background = `conic-gradient(from 36deg, transparent 0deg 74deg, ${skinColorValues[selectedSkin]} 75deg 360deg)`;
  pac.style.boxShadow = `0 0 26px ${skinColorValues[selectedSkin]}`;
  resultStage.appendChild(pac);

  ghosts.forEach((ghost, index) => {
    const item = document.createElement("span");
    item.className = `runner result-ghost ${ghost.color}`;
    item.style.left = `${48 + index * 9}%`;
    item.style.animationDelay = `${index * 0.12}s`;
    resultStage.appendChild(item);
  });
}

function drawGame() {
  if (!currentMap) {
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  drawOcean();
  drawMaze();
  drawPellets();
  drawPowerPellets();
  drawLaserEffects();
  drawPacman();
  ghosts.forEach(drawGhost);
}

function cellCenterX(x) {
  return offsetX + x * tileSize + tileSize / 2;
}

function cellCenterY(y) {
  return offsetY + y * tileSize + tileSize / 2;
}

function drawOcean() {
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#07172b");
  gradient.addColorStop(0.46, "#063c52");
  gradient.addColorStop(0.78, "#121032");
  gradient.addColorStop(1, "#080711");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "rgba(67, 232, 216, 0.18)";
  context.lineWidth = 2;
  for (let y = 34; y < canvas.height; y += 56) {
    context.beginPath();
    context.moveTo(0, y);
    for (let x = 0; x <= canvas.width; x += 28) {
      context.lineTo(x, y + Math.sin((x + y) / 34) * 5);
    }
    context.stroke();
  }
}

function drawMaze() {
  currentMap.rowsData.forEach((row, y) => {
    row.split("").forEach((tile, x) => {
      if (tile === "#") {
        const left = offsetX + x * tileSize;
        const top = offsetY + y * tileSize;
        const inset = Math.max(2, tileSize * 0.08);
        context.fillStyle = "rgba(10, 20, 31, 0.92)";
        context.fillRect(left + inset, top + inset, tileSize - inset * 2, tileSize - inset * 2);
        context.strokeStyle = "rgba(67, 232, 216, 0.68)";
        context.lineWidth = Math.max(1, tileSize * 0.045);
        context.strokeRect(left + inset * 1.6, top + inset * 1.6, tileSize - inset * 3.2, tileSize - inset * 3.2);
      }
    });
  });
}

function drawPellets() {
  pellets.forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    context.beginPath();
    context.fillStyle = "#f8f4eb";
    context.shadowColor = "rgba(67, 232, 216, 0.95)";
    context.shadowBlur = 10;
    context.arc(cellCenterX(x), cellCenterY(y), Math.max(2.2, tileSize * 0.12), 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
  });
}

function drawPowerPellets() {
  const pulse = 0.75 + Math.sin(performance.now() / 180) * 0.25;
  powerPellets.forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    context.save();
    context.translate(cellCenterX(x), cellCenterY(y));
    context.beginPath();
    context.fillStyle = powerBeanColor;
    context.shadowColor = "rgba(29, 140, 255, 0.95)";
    context.shadowBlur = 20;
    context.arc(0, 0, Math.max(3.4, tileSize * 0.17) * pulse, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.strokeStyle = "rgba(190, 233, 255, 0.7)";
    context.lineWidth = Math.max(1, tileSize * 0.035);
    context.arc(0, 0, Math.max(5, tileSize * 0.27), 0, Math.PI * 2);
    context.stroke();
    context.restore();
  });
  context.shadowBlur = 0;
}

function drawLaserEffects() {
  const now = performance.now();
  laserEffects.forEach((effect) => {
    const age = now - effect.startedAt;
    const opacity = Math.max(0, 1 - age / 420);
    context.save();
    context.strokeStyle = `rgba(116, 219, 255, ${0.34 * opacity})`;
    context.lineWidth = Math.max(2, tileSize * 0.08);
    context.shadowColor = "rgba(29, 140, 255, 0.65)";
    context.shadowBlur = 16;
    context.setLineDash([tileSize * 0.22, tileSize * 0.18]);
    context.lineDashOffset = -age / 18;
    context.beginPath();
    context.moveTo(cellCenterX(effect.from.x), cellCenterY(effect.from.y));
    context.lineTo(cellCenterX(effect.to.x), cellCenterY(effect.to.y));
    context.stroke();
    context.restore();
  });
}

function drawPacman() {
  const radius = tileSize * 0.38;
  const mouth = 0.22 + Math.abs(Math.sin(pacman.mouth)) * 0.18;
  const angle = Math.atan2(direction.y, direction.x || 1);

  context.save();
  context.translate(cellCenterX(pacman.x), cellCenterY(pacman.y));
  context.rotate(angle);
  context.beginPath();
  context.moveTo(0, 0);
  context.arc(0, 0, radius, mouth, Math.PI * 2 - mouth);
  context.closePath();
  context.fillStyle = skinColorValues[selectedSkin];
  context.shadowColor = skinColorValues[selectedSkin];
  context.shadowBlur = 18;
  context.fill();
  context.shadowBlur = 0;
  context.restore();
}

function drawGhost(ghost) {
  const width = tileSize * 0.62;
  const height = tileSize * 0.72;
  const left = cellCenterX(ghost.x) - width / 2;
  const top = cellCenterY(ghost.y) - height / 2;
  const phased = isGhostPhased(ghost);

  context.save();
  context.globalAlpha = phased ? 0.52 : 1;
  context.fillStyle = phased ? "rgba(238, 248, 255, 0.48)" : ghostColorValues[ghost.color];
  context.shadowColor = ghostColorValues[ghost.color];
  context.shadowBlur = phased ? 26 : 14;
  context.beginPath();
  context.arc(left + width / 2, top + width / 2, width / 2, Math.PI, 0);
  context.lineTo(left + width, top + height);
  context.lineTo(left + width * 0.75, top + height * 0.82);
  context.lineTo(left + width * 0.5, top + height);
  context.lineTo(left + width * 0.25, top + height * 0.82);
  context.lineTo(left, top + height);
  context.lineTo(left, top + width / 2);
  context.closePath();
  context.fill();

  if (phased) {
    context.setLineDash([tileSize * 0.14, tileSize * 0.11]);
    context.lineDashOffset = -performance.now() / 70;
    context.strokeStyle = "rgba(238, 248, 255, 0.8)";
    context.lineWidth = Math.max(1, tileSize * 0.05);
    context.stroke();
    context.setLineDash([]);
    drawDizzyHalo(left + width / 2, top - height * 0.12, width * 0.46);
  }

  context.shadowBlur = 0;

  context.fillStyle = "#061014";
  if (phased) {
    drawDizzyEye(left + width * 0.34, top + height * 0.42, Math.max(2.5, tileSize * 0.07));
    drawDizzyEye(left + width * 0.64, top + height * 0.42, Math.max(2.5, tileSize * 0.07));
  } else {
    context.beginPath();
    context.arc(left + width * 0.34, top + height * 0.42, Math.max(1.6, tileSize * 0.05), 0, Math.PI * 2);
    context.arc(left + width * 0.64, top + height * 0.42, Math.max(1.6, tileSize * 0.05), 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function drawDizzyHalo(x, y, radius) {
  context.save();
  const pulse = 0.86 + Math.sin(performance.now() / 180) * 0.14;
  context.strokeStyle = "rgba(228, 193, 111, 0.94)";
  context.shadowColor = "rgba(228, 193, 111, 0.72)";
  context.shadowBlur = 12;
  context.lineWidth = Math.max(1, tileSize * 0.04);
  context.beginPath();
  context.ellipse(x, y + Math.sin(performance.now() / 180) * 1.6, radius * pulse, radius * 0.34, 0, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function drawDizzyEye(x, y, radius) {
  context.save();
  context.strokeStyle = "#061014";
  context.lineWidth = Math.max(1, radius * 0.42);
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 1.75);
  context.stroke();
  context.restore();
}

function saveLeaderboardScore(finalScore, won) {
  const scores = getLeaderboardScores();
  scores.push({
    score: finalScore,
    result: won ? "Victory" : "Game Over",
    runType: currentRunType,
    ghosts: currentGhostCount,
    map: currentMapIndex + 1,
    time: new Date().toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    savedAt: Date.now(),
  });

  scores.sort((a, b) => b.score - a.score || b.savedAt - a.savedAt);
  localStorage.setItem("miniPacLeaderboardV2", JSON.stringify(scores.slice(0, 8)));
}

function getLeaderboardScores() {
  return JSON.parse(localStorage.getItem("miniPacLeaderboardV2") || "[]");
}

function renderLeaderboard() {
  const scores = getLeaderboardScores();
  leaderboardList.innerHTML = "";

  if (scores.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-board";
    empty.textContent = "No scores yet. Start the first run.";
    leaderboardList.appendChild(empty);
    return;
  }

  scores.forEach((savedScore, index) => {
    const entry = document.createElement("article");
    entry.className = "leaderboard-entry";
    entry.innerHTML = `
      <div class="rank">${String(index + 1).padStart(2, "0")}</div>
      <div>
        <div class="entry-score">${savedScore.score} pts</div>
        <div class="entry-meta">${savedScore.runType} · ${savedScore.ghosts} ${savedScore.ghosts === 1 ? "Ghost" : "Ghosts"} · ${savedScore.result} · Map ${savedScore.map}</div>
      </div>
      <div class="entry-time">${savedScore.time}</div>
    `;
    leaderboardList.appendChild(entry);
  });
}

function renderGhostEffects() {
  ghostEffects.innerHTML = "";
  const now = performance.now();
  ghosts
    .filter((ghost) => ghost.phasedUntil > now)
    .forEach((ghost) => {
      const remainingMs = Math.max(0, ghost.phasedUntil - now);
      const remaining = Math.ceil(remainingMs / 1000);
      const duration = ghost.phaseDuration || basePhasedDuration;
      const percent = Math.max(0, Math.min(100, remainingMs / duration * 100));
      const item = document.createElement("div");
      item.className = "ghost-effect";
      item.innerHTML = `
        <span class="effect-ghost ${ghost.color}"></span>
        <b>${remaining}s</b>
        <i><span style="width:${percent}%"></span></i>
      `;
      ghostEffects.appendChild(item);
    });
}

document.addEventListener("keydown", (event) => {
  const keyMap = {
    ArrowUp: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    W: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    S: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    A: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
    D: { x: 1, y: 0 },
  };

  if (keyMap[event.key]) {
    event.preventDefault();
    nextDirection = keyMap[event.key];
  }

  if (event.key === "x" || event.key === "X") {
    event.preventDefault();
    usePowerBean();
  }
});

function createDeck(ghostCount) {
  return Array.from({ length: 10 }, (_, index) => createMaze(ghostCount, index));
}

function createMaze(ghostCount, seed) {
  const sizes = {
    1: { cols: 20, rows: 15 },
    2: { cols: 24, rows: 18 },
    3: { cols: 28, rows: 21 },
  };
  const { cols, rows } = sizes[ghostCount];
  const random = seededRandom(ghostCount * 100 + seed + 7);
  const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => "#"));

  carveClassicMaze(grid, random);
  addPacmanLoops(grid, random, ghostCount);
  addCenterPocket(grid, ghostCount);

  const playerStart = { x: 1, y: 1 };
  const ghostStarts = [
    nearestOpen(grid, cols - 2, rows - 2),
    nearestOpen(grid, cols - 2, 1),
    nearestOpen(grid, 1, rows - 2),
  ];

  clearArea(grid, playerStart.x, playerStart.y, 2, 2);
  ghostStarts.forEach((start) => {
    clearArea(grid, start.x - 1, start.y - 1, 2, 2);
    carvePath(grid, playerStart, start);
  });

  const reachable = floodFill(grid, playerStart);
  for (let y = 1; y < rows - 1; y += 1) {
    for (let x = 1; x < cols - 1; x += 1) {
      if (grid[y][x] === "." && !reachable.has(`${x},${y}`)) {
        grid[y][x] = "#";
      }
    }
  }

  ghostStarts.forEach((start) => {
    if (grid[start.y][start.x] === "#") {
      grid[start.y][start.x] = ".";
    }
  });

  return {
    cols,
    rows,
    rowsData: grid.map((row) => row.join("")),
    playerStart,
    ghostStarts,
  };
}

function carveClassicMaze(grid, random) {
  const rows = grid.length;
  const cols = grid[0].length;
  const stack = [{ x: 1, y: 1 }];
  grid[1][1] = ".";

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const directions = shuffleWithRandom([
      { x: 2, y: 0 },
      { x: -2, y: 0 },
      { x: 0, y: 2 },
      { x: 0, y: -2 },
    ], random);
    const nextDirection = directions.find((direction) => {
      const nextX = current.x + direction.x;
      const nextY = current.y + direction.y;
      return nextX > 0 && nextY > 0 && nextX < cols - 1 && nextY < rows - 1 && grid[nextY][nextX] === "#";
    });

    if (!nextDirection) {
      stack.pop();
      continue;
    }

    const nextX = current.x + nextDirection.x;
    const nextY = current.y + nextDirection.y;
    grid[current.y + nextDirection.y / 2][current.x + nextDirection.x / 2] = ".";
    grid[nextY][nextX] = ".";
    stack.push({ x: nextX, y: nextY });
  }
}

function addPacmanLoops(grid, random, ghostCount) {
  const rows = grid.length;
  const cols = grid[0].length;
  const openings = ghostCount === 1 ? 10 : ghostCount === 2 ? 16 : 22;

  for (let i = 0; i < openings; i += 1) {
    const x = 2 + Math.floor(random() * (cols - 4));
    const y = 2 + Math.floor(random() * (rows - 4));
    const horizontalBridge = grid[y][x - 1] === "." && grid[y][x + 1] === ".";
    const verticalBridge = grid[y - 1][x] === "." && grid[y + 1][x] === ".";

    if (grid[y][x] === "#" && (horizontalBridge || verticalBridge)) {
      grid[y][x] = ".";
    }
  }
}

function addCenterPocket(grid, ghostCount) {
  const centerX = Math.floor(grid[0].length / 2) - 1;
  const centerY = Math.floor(grid.length / 2) - 1;
  const width = ghostCount === 1 ? 2 : 3;
  const height = ghostCount === 3 ? 3 : 2;
  clearArea(grid, centerX, centerY, width, height);
}

function nearestOpen(grid, targetX, targetY) {
  const rows = grid.length;
  const cols = grid[0].length;
  let best = { x: 1, y: 1 };
  let bestDistance = Infinity;

  for (let y = 1; y < rows - 1; y += 1) {
    for (let x = 1; x < cols - 1; x += 1) {
      if (grid[y][x] !== ".") {
        continue;
      }

      const distance = Math.abs(x - targetX) + Math.abs(y - targetY);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = { x, y };
      }
    }
  }

  return best;
}

function carvePath(grid, from, to) {
  const horizontalFirst = (from.x + from.y + to.x + to.y) % 2 === 0;
  const carveHorizontal = () => {
    const start = Math.min(from.x, to.x);
    const end = Math.max(from.x, to.x);
    for (let x = start; x <= end; x += 1) {
      grid[from.y][x] = ".";
    }
  };
  const carveVertical = () => {
    const start = Math.min(from.y, to.y);
    const end = Math.max(from.y, to.y);
    for (let y = start; y <= end; y += 1) {
      grid[y][to.x] = ".";
    }
  };

  if (horizontalFirst) {
    carveHorizontal();
    carveVertical();
  } else {
    carveVertical();
    carveHorizontal();
  }
}

function seededRandom(seed) {
  let value = seed;
  return function () {
    value = value * 16807 % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function shuffleWithRandom(items, random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function placeWall(grid, x, y, width, height) {
  for (let yy = y; yy < y + height && yy < grid.length - 1; yy += 1) {
    for (let xx = x; xx < x + width && xx < grid[0].length - 1; xx += 1) {
      if (xx > 0 && yy > 0) {
        grid[yy][xx] = "#";
      }
    }
  }
}

function clearArea(grid, x, y, width, height) {
  for (let yy = Math.max(1, y); yy < Math.min(grid.length - 1, y + height); yy += 1) {
    for (let xx = Math.max(1, x); xx < Math.min(grid[0].length - 1, x + width); xx += 1) {
      grid[yy][xx] = ".";
    }
  }
}

function floodFill(grid, start) {
  const visited = new Set();
  const queue = [start];

  while (queue.length > 0) {
    const current = queue.shift();
    const key = `${current.x},${current.y}`;
    if (visited.has(key) || grid[current.y][current.x] === "#") {
      continue;
    }

    visited.add(key);
    [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ].forEach((move) => {
      const next = { x: current.x + move.x, y: current.y + move.y };
      if (grid[next.y] && grid[next.y][next.x] !== "#") {
        queue.push(next);
      }
    });
  }

  return visited;
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

renderLeaderboard();
setDeviceMode(selectedDevice);
setSkin(selectedSkin);
prepareGame(1, "Story");
