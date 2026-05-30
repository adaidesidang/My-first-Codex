const screens = {
  homePage: document.querySelector("#homePage"),
  invitePage: document.querySelector("#invitePage"),
  gameMenuPage: document.querySelector("#gameMenuPage"),
  levelSelectPage: document.querySelector("#levelSelectPage"),
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
const ghostCountValue = document.querySelector("#ghostCountValue");
const gameModeLabel = document.querySelector("#gameModeLabel");
const statusText = document.querySelector("#gameStatus");
const resetButton = document.querySelector("#resetButton");
const exitGameButton = document.querySelector("#exitGameButton");
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

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const mapPadding = 28;
const pacmanDelay = 211;
const ghostDelay = 235;
const ghostColors = ["blue", "red", "yellow"];
const ghostColorValues = {
  blue: "#4db8ff",
  red: "#f07167",
  yellow: "#ffd166",
};

let currentMap = null;
let currentMapIndex = 0;
let tileSize = 32;
let offsetX = 0;
let offsetY = 0;
let pellets = new Set();
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
let selectedGhostCount = null;

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
  currentMapIndex = drawMapIndex(ghostCount);
  currentMap = mapDecks[ghostCount][currentMapIndex];
  tileSize = Math.min(
    (canvasWidth - mapPadding * 2) / currentMap.cols,
    (canvasHeight - mapPadding * 2) / currentMap.rows
  );
  offsetX = (canvasWidth - currentMap.cols * tileSize) / 2;
  offsetY = (canvasHeight - currentMap.rows * tileSize) / 2;

  pellets = new Set();
  score = 0;
  gameRunning = false;
  pacman = { ...currentMap.playerStart, mouth: 0 };
  direction = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };
  pacmanTimer = 0;
  ghostTimer = 0;
  ghosts = currentMap.ghostStarts.slice(0, ghostCount).map((start, index) => ({
    ...start,
    color: ghostColors[index],
    direction: { x: index % 2 === 0 ? -1 : 1, y: 0 },
    memory: [],
  }));

  currentMap.rowsData.forEach((row, y) => {
    row.split("").forEach((tile, x) => {
      if (tile === "." && shouldPlacePellet(x, y)) {
        pellets.add(`${x},${y}`);
      }
    });
  });

  updateScore();
  ghostCountValue.textContent = ghostCount;
  gameModeLabel.textContent = `${runType} / Map ${currentMapIndex + 1} / ${ghostCount} ${ghostCount === 1 ? "Ghost" : "Ghosts"}`;
  statusText.textContent = "Use arrow keys or WASD. Clear every pearl.";
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
}

function moveGhosts() {
  ghosts.forEach((ghost) => {
    const options = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ].filter((option) => canMove(ghost, option));

    if (options.length === 0) {
      return;
    }

    const reverse = { x: -ghost.direction.x, y: -ghost.direction.y };
    const forwardWorks = canMove(ghost, ghost.direction);
    const filtered = options.filter((option) => option.x !== reverse.x || option.y !== reverse.y);
    const choices = filtered.length > 0 ? filtered : options;
    const shouldChoose = !forwardWorks || choices.length > 1 && Math.random() < 0.42;

    if (shouldChoose) {
      const ranked = choices
        .map((option) => ({ option, distance: ghostDistance(ghost.x + option.x, ghost.y + option.y) }))
        .sort((a, b) => a.distance - b.distance);

      if (Math.random() < 0.58) {
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
      const escape = choices[Math.floor(Math.random() * choices.length)];
      ghost.direction = escape;
    }
  });
}

function ghostDistance(x, y) {
  return Math.abs(x - pacman.x) + Math.abs(y - pacman.y);
}

function checkCollision() {
  return ghosts.some((ghost) => ghost.x === pacman.x && ghost.y === pacman.y);
}

function gameLoop(timestamp) {
  if (!gameRunning) {
    return;
  }

  const delta = timestamp - lastFrameTime;
  lastFrameTime = timestamp;
  pacmanTimer += delta;
  ghostTimer += delta;

  if (pacmanTimer >= pacmanDelay) {
    pacmanTimer = 0;
    movePacman();
    pacman.mouth += 0.28;
  }

  if (ghostTimer >= ghostDelay) {
    ghostTimer = 0;
    moveGhosts();
  }

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
  gradient.addColorStop(0, "#07131d");
  gradient.addColorStop(0.55, "#071f2b");
  gradient.addColorStop(1, "#05070c");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "rgba(100, 210, 200, 0.08)";
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
        context.strokeStyle = "rgba(100, 210, 200, 0.38)";
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
    context.shadowColor = "rgba(248, 244, 235, 0.8)";
    context.shadowBlur = 8;
    context.arc(cellCenterX(x), cellCenterY(y), Math.max(2.2, tileSize * 0.12), 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
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
  context.fillStyle = "#e4c16f";
  context.shadowColor = "rgba(228, 193, 111, 0.65)";
  context.shadowBlur = 16;
  context.fill();
  context.shadowBlur = 0;
  context.restore();
}

function drawGhost(ghost) {
  const width = tileSize * 0.62;
  const height = tileSize * 0.72;
  const left = cellCenterX(ghost.x) - width / 2;
  const top = cellCenterY(ghost.y) - height / 2;

  context.fillStyle = ghostColorValues[ghost.color];
  context.shadowColor = ghostColorValues[ghost.color];
  context.shadowBlur = 14;
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
  context.shadowBlur = 0;

  context.fillStyle = "#061014";
  context.beginPath();
  context.arc(left + width * 0.34, top + height * 0.42, Math.max(1.6, tileSize * 0.05), 0, Math.PI * 2);
  context.arc(left + width * 0.64, top + height * 0.42, Math.max(1.6, tileSize * 0.05), 0, Math.PI * 2);
  context.fill();
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
prepareGame(1, "Story");
