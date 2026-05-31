const screens = {
  homePage: document.querySelector("#homePage"),
  invitePage: document.querySelector("#invitePage"),
  devicePage: document.querySelector("#devicePage"),
  orientationPage: document.querySelector("#orientationPage"),
  gameMenuPage: document.querySelector("#gameMenuPage"),
  versusRolePage: document.querySelector("#versusRolePage"),
  versusSkinPage: document.querySelector("#versusSkinPage"),
  versusSetupPage: document.querySelector("#versusSetupPage"),
  roleSelectPage: document.querySelector("#roleSelectPage"),
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
const gameTimer = document.querySelector("#gameTimer");
const teleportWarning = document.querySelector("#teleportWarning");
const statusText = document.querySelector("#gameStatus");
const resetButton = document.querySelector("#resetButton");
const exitGameButton = document.querySelector("#exitGameButton");
const patchNotesButton = document.querySelector("#patchNotesButton");
const patchModal = document.querySelector("#patchModal");
const patchCloseButton = document.querySelector("#patchCloseButton");
const patchScroll = document.querySelector(".patch-scroll");
const languageToggle = document.querySelector("#languageToggle");
const mobileAbilityButton = document.querySelector("#mobileAbilityButton");
const mobileAbilityButtons = document.querySelectorAll("[data-mobile-ability]");
const mobilePowerCount = document.querySelector("#mobilePowerCount");
const storyStartButton = document.querySelector("#storyStartButton");
const selectModeButton = document.querySelector("#selectModeButton");
const leaderboardList = document.querySelector("#leaderboardList");
const leaderboardModeButtons = document.querySelectorAll("[data-leaderboard-mode]");
const countdownNumber = document.querySelector("#countdownNumber");
const countdownMode = document.querySelector("#countdownMode");
const resultKicker = document.querySelector("#resultKicker");
const resultTitle = document.querySelector("#resultTitle");
const resultSummary = document.querySelector("#resultSummary");
const resultActions = document.querySelector("#resultActions");
const resultStage = document.querySelector("#resultStage");
const levelCards = document.querySelectorAll("[data-ghost-select]");
const roleCards = document.querySelectorAll("[data-role-select]");
const deviceButtons = document.querySelectorAll("[data-device]");
const orientationButtons = document.querySelectorAll("[data-orientation-choice]");
const moveButtons = document.querySelectorAll("[data-move]");
const skinCards = document.querySelectorAll("[data-skin]");
const ghostSkinCards = document.querySelectorAll("[data-ghost-skin]");
const versusRoleButtons = document.querySelectorAll("[data-versus-role]");
const versusSkinGrids = document.querySelectorAll("[data-versus-skin-grid]");
const versusGhostButtons = document.querySelectorAll("[data-versus-ghosts]");
const versusRuleButtons = document.querySelectorAll("[data-versus-rules]");
const versusStepButtons = document.querySelectorAll("[data-step]");
const versusStartButton = document.querySelector("#versusStartButton");
const versusPowerValue = document.querySelector("#versusPowerValue");
const versusFlashValue = document.querySelector("#versusFlashValue");
const versusPortalValue = document.querySelector("#versusPortalValue");
const versusTimeValue = document.querySelector("#versusTimeValue");

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const mapPadding = 28;
const pacmanDelay = 211;
const ghostDelay = 235;
const basePhasedDuration = 7000;
const powerRange = 7;
const powerBeanColor = "#1d8cff";
const flashColor = "#f6d365";
const ghostColors = ["blue", "red", "yellow"];
const ghostColorValues = {
  blue: "#4db8ff",
  red: "#f07167",
  orange: "#ff9f1c",
  yellow: "#ffd166",
  green: "#7bd88f",
  cyan: "#43e8d8",
  purple: "#b983ff",
  violet: "#e879f9",
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
let aiPowerPellets = new Set();
let versusFlashPellets = new Set();
let wormholes = [];
let totalPellets = 0;
let totalPowerPellets = 0;
let powerInventory = 0;
let powerUsed = 0;
let laserEffects = [];
let flashEffects = [];
let teleportEffects = [];
let score = 0;
let gameStartTime = 0;
let elapsedTime = 0;
let ghostTimeLimit = 180000;
let leaderboardMode = "pac";
let gameRunning = false;
let animationId = null;
let lastFrameTime = 0;
let pacmanTimer = 0;
let ghostTimer = 0;
let ghostStationaryMs = 0;
let ghostLastPosition = null;
let pacman = null;
let ghosts = [];
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let pacRecentPositions = [];
let currentGhostCount = 1;
let currentRunType = "Story";
let currentRole = "pac";
let versusMode = false;
let pendingRunType = "Story";
let storyLevel = 1;
let threeGhostStreak = 0;
let threeGhostDifficulty = 0;
let selectedGhostCount = null;
let selectedRoleChoice = null;
let selectedDeviceChoice = null;
let selectedDevice = localStorage.getItem("miniPacDevice") || "desktop";
let selectedMobileOrientation = localStorage.getItem("miniPacOrientation") || "auto";
let selectedOrientationChoice = null;
let currentLanguage = localStorage.getItem("miniPacLanguage") || "en";
let selectedSkin = localStorage.getItem("miniPacSkin") || "yellow";
let selectedGhostSkin = localStorage.getItem("miniPacGhostSkin") || "blue";
const versus = {
  turn: "p1",
  selected: { p1: null, p2: null },
  players: {
    p1: { role: null, skin: "blue", confirmedRole: false, confirmedSkin: false },
    p2: { role: null, skin: "red", confirmedRole: false, confirmedSkin: false },
  },
  ghostCount: 1,
  rulesMode: "default",
  settings: { power: 2, flash: 1, portal: 1, time: 3 },
  pacPlayer: "p1",
  ghostPlayer: "p2",
  pacDirection: { x: 0, y: 0 },
  pacNextDirection: { x: 0, y: 0 },
  ghostNextDirection: { x: -1, y: 0 },
  p1Score: 0,
  p2Score: 0,
  pacPower: 0,
  pacPowerUsed: 0,
  ghostFlash: 0,
  ghostFlashUsed: 0,
};

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

const translations = {
  ".home-card .eyebrow": { en: "Bonjour / Hello / 你好", zh: "Bonjour / Hello / 你好" },
  ".home-card h1 span:nth-child(1)": { en: "My", zh: "我的" },
  ".home-card h1 span:nth-child(2)": { en: "First", zh: "第一个" },
  ".home-card h1 span:nth-child(3)": { en: "Website", zh: "网站" },
  ".summary": { en: "A quiet digital space for ideas, code, and small beginnings.", zh: "一个安静的数字空间，用来放想法、代码和小小的开始。" },
  ".note": { en: "Built with clarity. Styled with calm.", zh: "清晰地构建，安静地呈现。" },
  "[data-go='invitePage']": { en: "Enter", zh: "进入" },
  "#invitePage .eyebrow": { en: "A small detour", zh: "一段小小的绕路" },
  "#invitePage h2": { en: "Do you want to play a little game?", zh: "想玩一个小游戏吗？" },
  "#invitePage .panel-text": { en: "Un petit jeu by the sea, made for one quiet glowing screen.", zh: "一个海边小游戏，为一块安静发光的屏幕而做。" },
  "#devicePage .eyebrow": { en: "Before the arcade", zh: "进入游戏厅前" },
  "#devicePage .splash-main": { en: "Choose your device.", zh: "选择你的设备。" },
  "#devicePage .version-splash": { en: "v4.0 chinese language", zh: "v4.0新语言：中文" },
  "#devicePage .panel-text": { en: "Click once to frame a device. Click it again to enter the arcade.", zh: "单击选择设备，再点一次进入游戏厅。" },
  "[data-device='desktop'] strong": { en: "Desktop", zh: "电脑端" },
  "[data-device='mobile'] strong": { en: "Mobile", zh: "移动端" },
  "#orientationPage .eyebrow": { en: "Mobile layout", zh: "移动端布局" },
  "#orientationPage h2": { en: "Landscape / Portrait", zh: "横屏 / 竖屏" },
  "#orientationPage .panel-text": { en: "Pick the layout you want to use on mobile. This manual choice stays stable even if browser detection is imperfect.", zh: "选择移动端游玩布局。即使浏览器横竖屏检测不稳定，手动选择也会保持生效。" },
  "[data-orientation-choice='landscape'] strong": { en: "Landscape", zh: "横屏" },
  "[data-orientation-choice='portrait'] strong": { en: "Portrait", zh: "竖屏" },
  ".landscape-sketch em": { en: "Game", zh: "游戏内容" },
  ".portrait-sketch em": { en: "Solo / Duo", zh: "单人 / 双人" },
  "#gameMenuPage .eyebrow": { en: "Seaside arcade", zh: "海边游戏厅" },
  "#gameMenuPage .version-splash": { en: "v4.0 chinese language", zh: "v4.0新语言：中文" },
  "#storyStartButton": { en: "Start Game", zh: "开始游戏" },
  "[data-go='versusRolePage']": { en: "Local Versus", zh: "本地双人" },
  "[data-go='leaderboardPage']": { en: "Leaderboard", zh: "排行榜" },
  "#selectModeButton": { en: "Select Level", zh: "选择关卡" },
  "[data-go='skinsPage']": { en: "Skins", zh: "皮肤" },
  "[data-go='creditsPage']": { en: "Credits", zh: "制作名单" },
  ".lower-back": { en: "Back", zh: "返回" },
  "#versusRolePage .eyebrow": { en: "Local versus", zh: "本地双人" },
  "#versusRolePage h2": { en: "Roles", zh: "角色" },
  "#versusRolePage .panel-text": { en: "Player 1 chooses first. Click once to frame, click again to lock.", zh: "玩家 1 先选。单击出现选框，再点一次锁定。" },
  "#versusP1RolePanel .player-tag": { en: "Player 1", zh: "玩家 1" },
  "#versusP2RolePanel .player-tag": { en: "Player 2", zh: "玩家 2" },
  "[data-versus-role='pac'] strong": { en: "Pac", zh: "吃豆人" },
  "[data-versus-role='ghost'] strong": { en: "Ghost", zh: "幽灵" },
  "[data-versus-role='random'] strong": { en: "Random", zh: "随机" },
  "#versusSkinPage .eyebrow": { en: "Local versus", zh: "本地双人" },
  "#versusSkinPage h2": { en: "Choose Skins", zh: "选择皮肤" },
  "#versusSkinPage .panel-text": { en: "Both players lock a skin before setup.", zh: "两位玩家都锁定皮肤后进入地图设置。" },
  "#versusP1SkinPanel .player-tag": { en: "Player 1", zh: "玩家 1" },
  "#versusP2SkinPanel .player-tag": { en: "Player 2", zh: "玩家 2" },
  "#versusSetupPage .eyebrow": { en: "Local versus", zh: "本地双人" },
  "#versusSetupPage h2": { en: "Map Setup", zh: "地图设置" },
  "[data-versus-rules='default']": { en: "Default", zh: "默认" },
  "[data-versus-rules='custom']": { en: "Customize", zh: "自定义" },
  "[data-setting-row='power'] b": { en: "Power Bean", zh: "道具豆" },
  "[data-setting-row='flash'] b": { en: "Flash", zh: "闪电" },
  "[data-setting-row='portal'] b": { en: "Portal", zh: "传送门" },
  "[data-setting-row='time'] b": { en: "Time", zh: "时间" },
  "#versusStartButton": { en: "Start Versus", zh: "开始双人" },
  "#roleSelectPage .eyebrow": { en: "Role select", zh: "角色选择" },
  "#roleSelectPage h2": { en: "Choose Your Side", zh: "选择你的阵营" },
  "#roleSelectPage .panel-text": { en: "Click once to frame a role. Click the same card again to continue.", zh: "单击选择角色，再点同一张卡继续。" },
  "[data-role-select='pac'] strong": { en: "Pac Mode", zh: "吃豆人模式" },
  "[data-role-select='ghost'] strong": { en: "Ghost Mode", zh: "幽灵模式" },
  "#levelSelectPage .eyebrow": { en: "Manual mode", zh: "自由选择" },
  "#levelSelectPage h2": { en: "Select Level", zh: "选择关卡" },
  "#levelSelectPage .panel-text": { en: "Click once to frame a card. Click the same card again to begin.", zh: "单击选择卡片，再点同一张卡开始。" },
  "#skinsPage .eyebrow": { en: "Choose a glow", zh: "选择光色" },
  "#skinsPage h2": { en: "Skins", zh: "皮肤" },
  "#skinsPage .panel-text": { en: "Pick colors for Pac Mode and your playable ghost in Ghost Mode.", zh: "选择吃豆人模式颜色，以及幽灵模式中你控制的幽灵颜色。" },
  "#skinsPage .skin-label:nth-of-type(1)": { en: "Pac Skin", zh: "吃豆人皮肤" },
  "#skinsPage .skin-label:nth-of-type(2)": { en: "Ghost Skin", zh: "幽灵皮肤" },
  "#countdownPage .panel-text": { en: "The tide is pulling the maze into place.", zh: "海潮正在把迷宫推到正确的位置。" },
  "#gameModeLabel": { en: "Ocean maze", zh: "海边迷宫" },
  ".scoreboard:first-child span": { en: "Score", zh: "分数" },
  ".scoreboard:last-child span": { en: "Ghosts", zh: "幽灵" },
  "#exitGameButton": { en: "Exit to Main Page", zh: "退出到主页面" },
  "#resetButton": { en: "Reset", zh: "重置" },
  "#gameStatus": { en: "Use arrow keys or WASD.", zh: "使用方向键或 WASD 移动。" },
  "#leaderboardPage .eyebrow": { en: "Best runs", zh: "最佳记录" },
  "#leaderboardPage h2": { en: "Leaderboard", zh: "排行榜" },
  "[data-leaderboard-mode='pac']": { en: "Pac", zh: "吃豆人" },
  "[data-leaderboard-mode='ghost']": { en: "Ghost", zh: "幽灵" },
  "#creditsPage .eyebrow": { en: "Credits", zh: "制作名单" },
  "#creditsPage h2": { en: "Created by", zh: "创作者" },
  "#creditsPage .panel-text": { en: "Design, code, and seaside arcade mood.", zh: "设计、代码，以及海边游戏厅的氛围。" },
  "#patchModal .eyebrow": { en: "Update Notes", zh: "更新公告" },
  "#patchTitle": { en: "Version Log", zh: "版本记录" },
  ".patch-entry:nth-of-type(1) h3": { en: "Version 4.0", zh: "版本 4.0" },
  ".patch-entry:nth-of-type(1) p:nth-of-type(1)": { en: "Added Chinese language support and a manual mobile layout choice for landscape and portrait play.", zh: "新增中文语言支持，并为移动端加入横屏/竖屏手动布局选择。" },
  ".patch-entry:nth-of-type(1) p:nth-of-type(2)": { en: "Local Versus mobile layouts now separate each player's score and controls more clearly for shared-screen play.", zh: "本地双人移动端布局现在会更清楚地区分两位玩家的计分板和操作区。" },
  ".patch-entry:nth-of-type(2) h3": { en: "Version 3.1", zh: "版本 3.1" },
  ".patch-entry:nth-of-type(2) p": { en: "Polished Local Versus setup screens, improved role random animation, refreshed the map preview, and fixed several small visual bugs.", zh: "打磨本地双人设置界面，优化随机角色动画，更新地图预览，并修复一些小的视觉问题。" },
  ".patch-entry:nth-of-type(3) h3": { en: "Version 3.0", zh: "版本 3.0" },
  ".patch-entry:nth-of-type(3) p:nth-of-type(1)": { en: "Added Local Versus, a same-device two-player mode with role select, skin select, and customizable map rules.", zh: "新增本地双人模式，可在同一设备上选择角色、皮肤，并自定义地图规则。" },
  ".patch-entry:nth-of-type(3) p:nth-of-type(2)": { en: "Player 1 uses WASD and Q. Player 2 uses arrow keys and / or ?. Versus scores are kept out of leaderboard.", zh: "玩家 1 使用 WASD 和 Q。玩家 2 使用方向键和 / 或 ?。双人分数不会写入排行榜。" },
  ".patch-entry:nth-of-type(4) h3": { en: "Version 2.3", zh: "版本 2.3" },
  ".patch-entry:nth-of-type(4) p:nth-of-type(1)": { en: "Added a smoother animated leaderboard switch, French-styled level labels, and sharper AI Pac routing in Duo and Trios Ghost maps.", zh: "新增更顺滑的排行榜切换、法语风格关卡标签，并强化双幽灵和三幽灵地图中的 AI 吃豆人路线。" },
  ".patch-entry:nth-of-type(4) p:nth-of-type(2)": { en: "Ghost Mode now gives AI Pac one Power Bean in every map size, keeping the hunt fair but active.", zh: "幽灵模式中，AI 吃豆人在每种地图尺寸都会获得一个道具豆，让追捕更公平也更活跃。" },
  ".patch-entry:nth-of-type(5) h3": { en: "Version 2.2", zh: "版本 2.2" },
  ".patch-entry:nth-of-type(5) p:nth-of-type(1)": { en: "Added Ghost Skin selection and a new wormhole anti-blocking rule for Ghost Mode. If the player ghost holds one tile too long, it is pulled into a deep-blue portal.", zh: "新增幽灵皮肤选择，并为幽灵模式加入传送门防堵路规则。如果玩家幽灵在同一格停留太久，会被拉入深蓝传送门。" },
  ".patch-entry:nth-of-type(5) p:nth-of-type(2)": { en: "Flash scoreboard animation now lasts longer, and portals move the player ghost to the hole farthest from Pac with a short mist-and-particle teleport effect.", zh: "闪电计分板动画持续更久，传送门会把玩家幽灵送到离吃豆人最远的洞口，并带有短暂雾气粒子特效。" },
  ".patch-entry:nth-of-type(6) h3": { en: "Version 2.1", zh: "版本 2.1" },
  ".patch-entry:nth-of-type(6) p:nth-of-type(1)": { en: "Tuned Ghost Mode pacing with a clearer countdown, Pac-first bean chasing, and two-page leaderboards for Pac and Ghost records.", zh: "调整幽灵模式节奏，加入更清楚的倒计时、优先吃豆的 AI 吃豆人，以及吃豆人和幽灵两页排行榜。" },
  ".patch-entry:nth-of-type(6) p:nth-of-type(2)": { en: "Flash Bean now belongs only to the player ghost, dashes four tiles with a color afterimage, and shows a small golden lightning mark during the dash.", zh: "闪电豆现在只属于玩家幽灵，可冲刺四格并留下同色残影，冲刺时头上会出现小金色闪电。" },
  ".patch-entry:nth-of-type(7) h3": { en: "Version 2.0", zh: "版本 2.0" },
  ".patch-entry:nth-of-type(7) p:nth-of-type(1)": { en: "Added Ghost Mode, a new role where the player controls the lead ghost and hunts an AI Pac. The Pac still focuses on clearing beans, but uses cautious pathing when a ghost gets too close.", zh: "新增幽灵模式，玩家控制主幽灵追捕 AI 吃豆人。吃豆人仍以清豆为目标，但幽灵靠近时会更谨慎地走位。" },
  ".patch-entry:nth-of-type(7) p:nth-of-type(2)": { en: "Added Flash Bean, a ghost-only item for the player ghost. It uses the same X / center-button input as Power Bean, but turns that input into a short directional dash.", zh: "新增闪电豆，这是玩家幽灵专属道具。它使用与道具豆相同的 X / 中间按钮输入，但效果是短距离方向冲刺。" },
  ".patch-entry:nth-of-type(8) h3": { en: "Version 1.2", zh: "版本 1.2" },
  ".patch-entry:nth-of-type(8) p:nth-of-type(1)": { en: "Improved three-ghost chase behavior. Ghosts now hold straight-line pursuit more consistently without increasing their movement speed.", zh: "优化三幽灵追捕行为。幽灵现在能更稳定地保持直线追击，同时不提高移动速度。" },
  ".patch-entry:nth-of-type(8) p:nth-of-type(2)": { en: "Added a small pressure-balance adjustment for rare close-chase situations, plus minor gameplay refinements.", zh: "为少见的近距离围追情况加入轻微压力平衡，并做了一些玩法细节优化。" },
  ".patch-entry:nth-of-type(9) h3": { en: "Version 1.1", zh: "版本 1.1" },
  ".patch-entry:nth-of-type(9) p:nth-of-type(1)": { en: "Power phase time now scales by difficulty: two-ghost mode lasts 7.5s, and three-ghost mode lasts 8s.", zh: "道具虚化时间现在会随难度变化：双幽灵为 7.5 秒，三幽灵为 8 秒。" },
  ".patch-entry:nth-of-type(9) p:nth-of-type(2)": { en: "One-ghost maps now have a 50 percent chance to include one power bean. Scoreboard power tracking, device selection, and small gameplay details were polished.", zh: "单幽灵地图现在有 50% 概率出现一个道具豆。计分板道具追踪、设备选择和一些玩法细节也进行了打磨。" },
  ".patch-entry:nth-of-type(10) h3": { en: "Version 1.0", zh: "版本 1.0" },
  ".patch-entry:nth-of-type(10) p:nth-of-type(1)": { en: "A night-blue power bean now appears in harder mazes. Eat it, then press X on desktop or tap the center mobile button to phase a nearby ghost.", zh: "更难的迷宫中会出现暗夜亮蓝道具豆。吃掉后，在电脑端按 X，或在移动端点击中间按钮，即可虚化附近幽灵。" },
  ".patch-entry:nth-of-type(10) p:nth-of-type(2)": { en: "The beam checks up to seven open tiles in the four straight directions. Walls block it. A phased ghost turns misty, slows down, and drifts for seven seconds.", zh: "光束会检测上下左右四个方向最多七格的开放空间，墙会阻挡它。被虚化的幽灵会变成雾白、减速，并漂移七秒。" },
  ".patch-close": { en: "×", zh: "×" },
};

const wordMap = {
  en: {
    back: "Back",
    enterMenu: "Enter Menu",
    waiting: "Waiting",
    player1: "Player 1",
    player2: "Player 2",
    pac: "Pac",
    ghost: "Ghost",
    ghosts: "Ghosts",
    story: "Story",
    manual: "Manual",
    victory: "Victory",
    gameOver: "Game Over",
    restart: "Restart",
    rematch: "Rematch",
    continue: "Continue to Next Level",
    main: "Back to Main Page",
    beautifulRun: "Beautiful run.",
    tideTook: "The tide took this one.",
    caught: "Caught in the tide.",
    pacSlipped: "Pac slipped away.",
    noPacScores: "No Pac scores yet. Start the first run.",
    noGhostScores: "No ghost runs yet. Start the first hunt.",
    colors: { red: "Red", orange: "Orange", yellow: "Yellow", green: "Green", cyan: "Cyan", blue: "Blue", purple: "Purple", violet: "Violet" },
  },
  zh: {
    back: "返回",
    enterMenu: "进入菜单",
    waiting: "等待中",
    player1: "玩家 1",
    player2: "玩家 2",
    pac: "吃豆人",
    ghost: "幽灵",
    ghosts: "幽灵",
    story: "剧情",
    manual: "自由",
    victory: "胜利",
    gameOver: "游戏结束",
    restart: "重新开始",
    rematch: "再来一局",
    continue: "继续下一关",
    main: "返回主页面",
    beautifulRun: "漂亮的一局。",
    tideTook: "这次被海潮带走了。",
    caught: "抓到了。",
    pacSlipped: "吃豆人逃走了。",
    noPacScores: "还没有吃豆人记录。开始第一局吧。",
    noGhostScores: "还没有幽灵记录。开始第一次追捕吧。",
    colors: { red: "红色", orange: "橙色", yellow: "黄色", green: "绿色", cyan: "青色", blue: "蓝色", purple: "紫色", violet: "紫罗兰" },
  },
};

function tr(key) {
  return wordMap[currentLanguage][key] || wordMap.en[key] || key;
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  document.body.classList.toggle("zh-language", currentLanguage === "zh");
  languageToggle?.classList.toggle("zh-active", currentLanguage === "zh");
  Object.entries(translations).forEach(([selector, values]) => {
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = values[currentLanguage] || values.en;
    });
  });
  document.querySelectorAll("[data-back]").forEach((button) => {
    button.textContent = tr("back");
  });
  document.querySelectorAll("[data-go='gameMenuPage']").forEach((button) => {
    button.textContent = tr("enterMenu");
  });
  const skinLabels = document.querySelectorAll("#skinsPage .skin-label");
  if (skinLabels[0]) skinLabels[0].textContent = currentLanguage === "zh" ? "吃豆人皮肤" : "Pac Skin";
  if (skinLabels[1]) skinLabels[1].textContent = currentLanguage === "zh" ? "幽灵皮肤" : "Ghost Skin";
  renderColorLabels();
  updateDynamicLanguageText();
}

function renderColorLabels() {
  document.querySelectorAll("[data-skin], [data-ghost-skin]").forEach((button) => {
    const color = button.dataset.skin || button.dataset.ghostSkin;
    const label = button.querySelector("strong");
    if (label) {
      label.textContent = wordMap[currentLanguage].colors[color] || color;
    }
  });
}

function updateDynamicLanguageText() {
  if (screens.leaderboardPage.classList.contains("active")) {
    renderLeaderboard();
  }
  if (screens.versusRolePage.classList.contains("active")) {
    updateVersusRoleView();
  }
  if (screens.versusSkinPage.classList.contains("active")) {
    renderVersusSkinChoices();
  }
}

function showScreen(screenId, addToHistory = true) {
  if (screenId !== "gamePage" && gameRunning) {
    pauseGame(currentLanguage === "zh" ? "已暂停。准备好后可以回到迷宫。" : "Paused. Return to the maze when you are ready.");
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

  if (screenId === "orientationPage") {
    selectedOrientationChoice = null;
    orientationButtons.forEach((button) => button.classList.remove("selected"));
  }

  if (screenId === "roleSelectPage") {
    selectedRoleChoice = null;
    roleCards.forEach((button) => button.classList.remove("selected"));
  }

  if (screenId === "versusRolePage") {
    resetVersusRoleSelect();
  }

  if (screenId === "versusSkinPage") {
    renderVersusSkinChoices();
  }

  if (screenId === "gamePage") {
    drawGame();
  }

  applyLanguage();
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

languageToggle?.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "zh" : "en";
  localStorage.setItem("miniPacLanguage", currentLanguage);
  applyLanguage();
});

deviceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const device = button.dataset.device;

    if (selectedDeviceChoice === device && button.classList.contains("selected")) {
      setDeviceMode(device);
      showScreen(device === "mobile" ? "orientationPage" : "gameMenuPage");
      return;
    }

    selectedDeviceChoice = device;
    deviceButtons.forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
  });
});

orientationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const orientation = button.dataset.orientationChoice;
    if (selectedOrientationChoice === orientation && button.classList.contains("selected")) {
      setMobileOrientation(orientation);
      showScreen("gameMenuPage");
      return;
    }

    selectedOrientationChoice = orientation;
    orientationButtons.forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
  });
});

storyStartButton.addEventListener("click", () => {
  pendingRunType = "Story";
  showScreen("roleSelectPage");
});

selectModeButton.addEventListener("click", () => {
  pendingRunType = "Manual";
  showScreen("roleSelectPage");
});

roleCards.forEach((card) => {
  card.addEventListener("click", () => {
    const role = card.dataset.roleSelect;

    if (selectedRoleChoice === role && card.classList.contains("selected")) {
      currentRole = role;
      if (pendingRunType === "Manual") {
        showScreen("levelSelectPage");
      } else {
        storyLevel = 1;
        startCountdown(1, "Story", role);
      }
      return;
    }

    selectedRoleChoice = role;
    roleCards.forEach((item) => item.classList.remove("selected"));
    card.classList.add("selected");
  });
});

levelCards.forEach((card) => {
  card.addEventListener("click", () => {
    const ghostCount = Number(card.dataset.ghostSelect);

    if (selectedGhostCount === ghostCount && card.classList.contains("selected")) {
      startCountdown(ghostCount, "Manual", currentRole);
      return;
    }

    selectedGhostCount = ghostCount;
    levelCards.forEach((item) => item.classList.remove("selected"));
    card.classList.add("selected");
  });
});

resetButton.addEventListener("click", () => {
  if (versusMode) {
    startVersusGame();
    return;
  }

  startCountdown(currentGhostCount, currentRunType, currentRole);
});

exitGameButton.addEventListener("click", () => {
  pauseGame(currentLanguage === "zh" ? "已退出到游戏菜单。" : "Exited to the arcade menu.");
  versusMode = false;
  document.body.classList.remove("versus-mode");
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

mobileAbilityButtons.forEach((button) => button.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  if (versusMode) {
    useVersusAbility(button.dataset.mobileAbility);
    return;
  }
  useAbility();
}));

moveButtons.forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (versusMode) {
      const player = button.closest("[data-mobile-player]")?.dataset.mobilePlayer || versus.pacPlayer;
      setVersusDirection(player, directionFromName(button.dataset.move));
      return;
    }
    setDirectionFromName(button.dataset.move);
  });
});

skinCards.forEach((card) => {
  card.addEventListener("click", () => {
    setSkin(card.dataset.skin);
  });
});

ghostSkinCards.forEach((card) => {
  card.addEventListener("click", () => {
    setGhostSkin(card.dataset.ghostSkin);
  });
});

leaderboardModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    leaderboardMode = button.dataset.leaderboardMode;
    leaderboardModeButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderLeaderboard();
  });
});

versusRoleButtons.forEach((button) => {
  button.addEventListener("click", () => handleVersusRoleClick(button));
});

versusGhostButtons.forEach((button) => {
  button.addEventListener("click", () => {
    versus.ghostCount = Number(button.dataset.versusGhosts);
    versusGhostButtons.forEach((item) => item.classList.toggle("selected", item === button));
    if (versus.rulesMode === "default") {
      applyVersusDefaults();
    }
    updateVersusSettingsView();
  });
});

versusRuleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    versus.rulesMode = button.dataset.versusRules;
    versusRuleButtons.forEach((item) => item.classList.toggle("active", item === button));
    if (versus.rulesMode === "default") {
      applyVersusDefaults();
    }
    updateVersusSettingsView();
  });
});

versusStepButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (versus.rulesMode !== "custom") {
      return;
    }
    const key = button.dataset.step;
    const delta = Number(button.dataset.delta);
    const max = key === "time" ? 5 : 4;
    const min = key === "time" ? 1 : 0;
    versus.settings[key] = Math.max(min, Math.min(max, versus.settings[key] + delta));
    updateVersusSettingsView();
  });
});

versusStartButton.addEventListener("click", () => {
  startVersusCountdown();
});

window.addEventListener("resize", syncDetectedOrientation);
window.addEventListener("orientationchange", syncDetectedOrientation);

function setDeviceMode(device) {
  selectedDevice = device;
  localStorage.setItem("miniPacDevice", device);
  document.body.classList.toggle("mobile-mode", device === "mobile");
  document.body.classList.toggle("desktop-mode", device !== "mobile");
}

function setMobileOrientation(orientation) {
  selectedMobileOrientation = orientation;
  localStorage.setItem("miniPacOrientation", orientation);
  document.body.classList.toggle("manual-landscape", orientation === "landscape");
  document.body.classList.toggle("manual-portrait", orientation === "portrait");
}

function syncDetectedOrientation() {
  const landscape = window.innerWidth > window.innerHeight;
  document.body.classList.toggle("detected-landscape", landscape);
  document.body.classList.toggle("detected-portrait", !landscape);
}

function setSkin(skin) {
  selectedSkin = skin;
  localStorage.setItem("miniPacSkin", skin);
  skinCards.forEach((card) => card.classList.toggle("selected", card.dataset.skin === skin));
  drawGame();
}

function setGhostSkin(skin) {
  selectedGhostSkin = skin;
  localStorage.setItem("miniPacGhostSkin", skin);
  ghostSkinCards.forEach((card) => card.classList.toggle("selected", card.dataset.ghostSkin === skin));
  if (currentRole === "ghost" && ghosts[0]) {
    ghosts[0].color = selectedGhostSkin;
    const palette = getGhostPalette(currentRole, currentGhostCount);
    ghosts.forEach((ghost, index) => {
      ghost.color = palette[index];
    });
    drawGame();
  }
}

function getGhostPalette(role, ghostCount) {
  if (role !== "ghost") {
    return ghostColors.slice(0, ghostCount);
  }

  const fallback = ["blue", "red", "yellow", "green", "violet"];
  const palette = [selectedGhostSkin];
  fallback.forEach((color) => {
    if (palette.length < ghostCount && color !== selectedGhostSkin) {
      palette.push(color);
    }
  });
  return palette;
}

function resetVersusRoleSelect() {
  versusMode = false;
  document.body.classList.remove("versus-mode");
  versus.turn = "p1";
  versus.selected = { p1: null, p2: null };
  versus.players.p1 = { role: null, skin: "blue", confirmedRole: false, confirmedSkin: false };
  versus.players.p2 = { role: null, skin: "red", confirmedRole: false, confirmedSkin: false };
  updateVersusRoleView();
}

function getVersusGhostPalette() {
  const playerColor = versus.players[versus.ghostPlayer].skin;
  const fallback = ["blue", "red", "yellow", "green", "cyan", "purple", "orange"];
  const palette = [playerColor];
  fallback.forEach((color) => {
    if (palette.length < versus.ghostCount && color !== playerColor) {
      palette.push(color);
    }
  });
  return palette;
}

function handleVersusRoleClick(button) {
  const player = versus.turn;
  const role = button.dataset.versusRole;
  if (!player || button.disabled) {
    return;
  }

  if (role === "random") {
    runVersusRandomAnimation(player);
    return;
  }

  if (versus.selected[player] === role && button.classList.contains("selected")) {
    versus.players[player].role = role;
    versus.players[player].confirmedRole = true;
    if (player === "p1") {
      versus.turn = "p2";
    } else {
      finalizeVersusRoles();
      showScreen("versusSkinPage");
    }
    updateVersusRoleView();
    return;
  }

  versus.selected[player] = role;
  updateVersusRoleView();
}

function runVersusRandomAnimation(player) {
  if (versus.players[player].confirmedRole) {
    return;
  }

  const choices = Array.from(versusRoleButtons).filter((button) => !button.disabled);
  const finalChoices = choices.filter((button) => button.dataset.versusRole !== "random");
  if (finalChoices.length === 0) {
    return;
  }

  versusRoleButtons.forEach((button) => {
    button.disabled = true;
    button.classList.remove("selected", "random-cycling");
  });

  let tick = 0;
  const cycles = player === "p1" ? 8 : 6;
  const timer = setInterval(() => {
    versusRoleButtons.forEach((button) => button.classList.remove("random-cycling"));
    const button = choices[tick % choices.length];
    button.classList.add("random-cycling");
    tick += 1;

    if (tick > cycles) {
      clearInterval(timer);
      const chosen = finalChoices[Math.floor(Math.random() * finalChoices.length)].dataset.versusRole;
      const other = player === "p1" ? "p2" : "p1";
      if (versus.players[other].confirmedRole && versus.players[other].role) {
        versus.players[player].role = versus.players[other].role === "pac" ? "ghost" : "pac";
        versus.players[player].confirmedRole = true;
        finalizeVersusRoles();
        updateVersusRoleView();
        setTimeout(() => showScreen("versusSkinPage"), 420);
      } else {
        versus.players[player].role = chosen;
        versus.players[player].confirmedRole = true;
        versus.turn = other;
        updateVersusRoleView();
        setTimeout(() => {
          versus.players[other].role = chosen === "pac" ? "ghost" : "pac";
          versus.players[other].confirmedRole = true;
          finalizeVersusRoles();
          updateVersusRoleView();
          setTimeout(() => showScreen("versusSkinPage"), 420);
        }, 420);
      }
    }
  }, 115);
}

function assignVersusRandomRoles(player = null, chosenRole = null) {
  const other = player === "p1" ? "p2" : player === "p2" ? "p1" : null;
  if (player && other && versus.players[other].confirmedRole && versus.players[other].role) {
    versus.players[player].role = versus.players[other].role === "pac" ? "ghost" : "pac";
    versus.players[player].confirmedRole = true;
    finalizeVersusRoles();
    return;
  }

  if (player && other && chosenRole) {
    versus.players[player].role = chosenRole;
    versus.players[other].role = chosenRole === "pac" ? "ghost" : "pac";
  } else if (Math.random() < 0.5) {
    versus.players.p1.role = "pac";
    versus.players.p2.role = "ghost";
  } else {
    versus.players.p1.role = "ghost";
    versus.players.p2.role = "pac";
  }
  versus.players.p1.confirmedRole = true;
  versus.players.p2.confirmedRole = true;
  finalizeVersusRoles();
}

function finalizeVersusRoles() {
  versus.pacPlayer = versus.players.p1.role === "pac" ? "p1" : "p2";
  versus.ghostPlayer = versus.pacPlayer === "p1" ? "p2" : "p1";
}

function updateVersusRoleView() {
  document.querySelector("#versusP1RolePanel").classList.toggle("active-turn", versus.turn === "p1");
  document.querySelector("#versusP2RolePanel").classList.toggle("active-turn", versus.turn === "p2");
  document.querySelectorAll("[data-role-slot]").forEach((slot) => {
    const player = slot.dataset.roleSlot;
    const role = versus.players[player].role;
    slot.classList.toggle("filled", Boolean(role));
    slot.classList.toggle("pac-filled", role === "pac");
    slot.classList.toggle("ghost-filled", role === "ghost");
    slot.innerHTML = role ? getRoleTokenMarkup(role) : `<span>${tr("waiting")}</span>`;
  });
  versusRoleButtons.forEach((button) => {
    const role = button.dataset.versusRole;
    const lockedByChoice = role !== "random" && Object.values(versus.players).some((player) => player.confirmedRole && player.role === role);
    const currentPlayerLocked = versus.players[versus.turn]?.confirmedRole;
    button.disabled = Boolean(currentPlayerLocked || lockedByChoice && role !== "random");
    button.classList.toggle("selected", versus.selected[versus.turn] === role);
    button.classList.toggle("disabled-choice", lockedByChoice);
    button.classList.toggle("locked-role", lockedByChoice);
  });
}

function getRoleTokenMarkup(role) {
  const icon = role === "pac" ? '<span class="mini-pac"></span>' : '<span class="mini-ghost blue"></span>';
  return `<div class="role-token ${role}-token">${icon}<strong>${role === "pac" ? tr("pac") : tr("ghost")}</strong></div>`;
}

function renderVersusSkinChoices() {
  versusSkinGrids.forEach((grid) => {
    const player = grid.dataset.versusSkinGrid;
    const role = versus.players[player].role;
    const colors = role === "pac"
      ? ["red", "yellow", "cyan", "orange", "green", "blue", "purple"]
      : ["blue", "yellow", "cyan", "red", "green", "orange", "purple", "violet"];
    grid.innerHTML = "";
    grid.closest(".player-panel").classList.toggle("active-turn", !versus.players[player].confirmedSkin);
    colors.forEach((color) => {
      const button = document.createElement("button");
      button.className = `skin-card ${role === "ghost" ? "ghost-skin-card" : ""}`;
      button.type = "button";
      button.classList.toggle("selected", versus.players[player].skin === color);
      button.style.setProperty("--skin-color", role === "pac" ? skinColorValues[color] : ghostColorValues[color]);
      button.innerHTML = `<span></span><strong>${wordMap[currentLanguage].colors[color] || color}</strong>`;
      button.addEventListener("click", () => handleVersusSkinClick(player, color, button));
      grid.appendChild(button);
    });
  });
}

function handleVersusSkinClick(player, color, button) {
  if (versus.players[player].confirmedSkin) {
    return;
  }
  if (versus.players[player].skin === color && button.classList.contains("selected")) {
    versus.players[player].confirmedSkin = true;
    if (versus.players.p1.confirmedSkin && versus.players.p2.confirmedSkin) {
      applyVersusDefaults();
      updateVersusSettingsView();
      renderVersusSkinChoices();
      setTimeout(() => {
        showScreen("versusSetupPage");
      }, 520);
      return;
    }
  } else {
    versus.players[player].skin = color;
  }
  renderVersusSkinChoices();
}

function applyVersusDefaults() {
  versus.settings.power = versus.ghostCount === 1 ? 2 : versus.ghostCount === 2 ? 3 : 4;
  versus.settings.flash = versus.ghostCount === 1 ? 1 : versus.ghostCount === 2 ? 2 : 3;
  versus.settings.portal = versus.ghostCount;
  versus.settings.time = versus.ghostCount === 1 ? 3 : versus.ghostCount === 2 ? 4 : 5;
}

function updateVersusSettingsView() {
  const disabled = versus.rulesMode !== "custom";
  const mapDemo = document.querySelector("#versusMapDemo");
  if (mapDemo) {
    mapDemo.classList.remove("preview-reset");
    void mapDemo.offsetWidth;
    mapDemo.setAttribute("data-ghosts", String(versus.ghostCount));
    mapDemo.classList.add("preview-reset");
  }
  versusGhostButtons.forEach((button) => {
    const active = Number(button.dataset.versusGhosts) === versus.ghostCount;
    button.classList.toggle("selected", active);
    button.classList.toggle("active", active);
  });
  versusRuleButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.versusRules === versus.rulesMode);
  });
  document.querySelectorAll(".versus-stepper").forEach((row) => row.classList.toggle("disabled-row", disabled));
  versusPowerValue.textContent = versus.settings.power;
  versusFlashValue.textContent = versus.settings.flash;
  versusPortalValue.textContent = versus.settings.portal;
  versusTimeValue.textContent = versus.settings.time;
}

function setDirectionFromName(name) {
  const moveDirection = directionFromName(name);
  if (!moveDirection) {
    return;
  }

  if (versusMode) {
    setVersusDirection(versus.pacPlayer, moveDirection);
    return;
  }

  nextDirection = moveDirection;
}

function directionFromName(name) {
  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  return directions[name] || null;
}

function startCountdown(ghostCount, runType, role = currentRole) {
  pauseGame();
  currentGhostCount = ghostCount;
  currentRunType = runType;
  currentRole = role;
  const roleLabel = role === "ghost" ? (currentLanguage === "zh" ? "幽灵模式" : "Ghost Mode") : (currentLanguage === "zh" ? "吃豆人模式" : "Pac Mode");
  const runLabel = runType === "Story" ? tr("story") : tr("manual");
  countdownMode.textContent = `${roleLabel} / ${runLabel} / ${ghostCount} ${tr("ghosts")}`;
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
    countdownNumber.textContent = currentLanguage === "zh" ? "开始" : "Go";
    setTimeout(() => {
      prepareGame(ghostCount, runType, role);
      if (historyStack[historyStack.length - 1] === "countdownPage") {
        historyStack.pop();
      }
      showScreen("gamePage");
      startGameLoop();
    }, 520);
  }, 780);
}

function prepareGame(ghostCount, runType, role = currentRole) {
  versusMode = false;
  document.body.classList.remove("versus-mode");
  currentGhostCount = ghostCount;
  currentRunType = runType;
  currentRole = role;
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
  aiPowerPellets = new Set();
  versusFlashPellets = new Set();
  wormholes = [];
  laserEffects = [];
  flashEffects = [];
  teleportEffects = [];
  totalPellets = 0;
  totalPowerPellets = 0;
  powerInventory = 0;
  powerUsed = 0;
  score = 0;
  elapsedTime = 0;
  ghostTimeLimit = getGhostTimeLimit(ghostCount);
  gameRunning = false;
  pacman = { ...currentMap.playerStart, mouth: 0 };
  pacRecentPositions = [`${pacman.x},${pacman.y}`];
  direction = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };
  pacmanTimer = 0;
  ghostTimer = 0;
  ghostStationaryMs = 0;
  ghostLastPosition = null;
  const ghostPalette = getGhostPalette(role, ghostCount);
  ghosts = currentMap.ghostStarts.slice(0, ghostCount).map((start, index) => ({
    ...start,
    index,
    color: ghostPalette[index],
    direction: { x: index % 2 === 0 ? -1 : 1, y: 0 },
    memory: [],
    timer: 0,
    phasedUntil: 0,
    pressureDumbUntil: 0,
    flashUntil: 0,
    flashEffectUntil: 0,
    teleporting: null,
    wobble: 0,
  }));

  currentMap.rowsData.forEach((row, y) => {
    row.split("").forEach((tile, x) => {
      if (tile === "." && shouldPlacePellet(x, y)) {
        pellets.add(`${x},${y}`);
      }
    });
  });
  placePowerItems();
  placeAiPowerBeans();
  placeWormholes();
  totalPellets = pellets.size;
  totalPowerPellets = powerPellets.size;

  updateScore();
  updateTimerDisplay();
  ghostCountValue.textContent = ghostCount;
  const roleLabel = role === "ghost" ? (currentLanguage === "zh" ? "幽灵追捕" : "Ghost Hunt") : (currentLanguage === "zh" ? "海边迷宫" : "Ocean Maze");
  const runLabel = runType === "Story" ? tr("story") : tr("manual");
  gameModeLabel.textContent = `${roleLabel} / ${runLabel} / ${currentLanguage === "zh" ? "地图" : "Map"} ${currentMapIndex + 1} / ${ghostCount} ${tr("ghosts")}`;
  statusText.textContent = getControlHint();
  drawGame();
}

function startGameLoop() {
  gameRunning = true;
  gameStartTime = performance.now();
  lastFrameTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
}

function startVersusCountdown() {
  pauseGame();
  finalizeVersusRoles();
  currentRole = "versus";
  currentRunType = "Local Versus";
  currentGhostCount = versus.ghostCount;
  countdownMode.textContent = `${currentLanguage === "zh" ? "本地双人" : "Local Versus"} / ${versus.ghostCount} ${tr("ghosts")}`;
  showScreen("countdownPage");

  let number = 3;
  countdownNumber.textContent = number;
  countdownNumber.classList.add("versus-countdown");
  const timer = setInterval(() => {
    number -= 1;
    if (number > 0) {
      countdownNumber.textContent = number;
      return;
    }

    clearInterval(timer);
    countdownNumber.textContent = currentLanguage === "zh" ? "开始" : "Go";
    setTimeout(() => {
      countdownNumber.classList.remove("versus-countdown");
      startVersusGame();
      if (historyStack[historyStack.length - 1] === "countdownPage") {
        historyStack.pop();
      }
    }, 520);
  }, 780);
}

function startVersusGame() {
  pauseGame();
  versusMode = true;
  document.body.classList.add("versus-mode");
  currentRole = "versus";
  currentRunType = "Local Versus";
  currentGhostCount = versus.ghostCount;
  currentMapIndex = drawMapIndex(versus.ghostCount);
  currentMap = mapDecks[versus.ghostCount][currentMapIndex];
  tileSize = Math.min((canvasWidth - mapPadding * 2) / currentMap.cols, (canvasHeight - mapPadding * 2) / currentMap.rows);
  offsetX = (canvasWidth - currentMap.cols * tileSize) / 2;
  offsetY = (canvasHeight - currentMap.rows * tileSize) / 2;
  pellets = new Set();
  powerPellets = new Set();
  aiPowerPellets = new Set();
  versusFlashPellets = new Set();
  wormholes = [];
  flashEffects = [];
  laserEffects = [];
  teleportEffects = [];
  powerInventory = 0;
  powerUsed = 0;
  versus.p1Score = 0;
  versus.p2Score = 0;
  versus.pacPower = 0;
  versus.pacPowerUsed = 0;
  versus.ghostFlash = 0;
  versus.ghostFlashUsed = 0;
  score = 0;
  elapsedTime = 0;
  ghostTimeLimit = versus.settings.time * 60000;
  pacman = { ...currentMap.playerStart, mouth: 0 };
  direction = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };
  versus.pacDirection = { x: 0, y: 0 };
  versus.pacNextDirection = { x: 0, y: 0 };
  versus.ghostNextDirection = { x: -1, y: 0 };
  pacRecentPositions = [`${pacman.x},${pacman.y}`];
  const versusGhostPalette = getVersusGhostPalette();
  ghosts = currentMap.ghostStarts.slice(0, versus.ghostCount).map((start, index) => ({
    ...start,
    index,
    color: versusGhostPalette[index],
    direction: { x: index % 2 === 0 ? -1 : 1, y: 0 },
    memory: [],
    timer: 0,
    phasedUntil: 0,
    pressureDumbUntil: 0,
    flashUntil: 0,
    flashEffectUntil: 0,
    teleporting: null,
    wobble: 0,
  }));
  currentMap.rowsData.forEach((row, y) => {
    row.split("").forEach((tile, x) => {
      if (tile === "." && shouldPlacePellet(x, y)) {
        pellets.add(`${x},${y}`);
      }
    });
  });
  placeExactItems(powerPellets, versus.settings.power, "power");
  placeExactItems(aiPowerPellets, 0, "ai");
  placeExactItemsForFlash(versus.settings.flash);
  placeExactPortals(versus.settings.portal);
  totalPellets = pellets.size;
  gameModeLabel.textContent = `${currentLanguage === "zh" ? "本地双人" : "Local Versus"} / ${currentLanguage === "zh" ? "地图" : "Map"} ${currentMapIndex + 1}`;
  ghostCountValue.textContent = versus.ghostCount;
  statusText.textContent = currentLanguage === "zh" ? "玩家1：WASD + Q。玩家2：方向键 + / 或 ?" : "P1: WASD + Q. P2: Arrows + / or ?";
  updateVersusScore();
  updateTimerDisplay();
  showScreen("gamePage");
  startGameLoop();
}

function placeExactItems(targetSet, amount) {
  const candidates = [];
  currentMap.rowsData.forEach((row, y) => {
    row.split("").forEach((tile, x) => {
      const key = `${x},${y}`;
      if (tile === "." && !powerPellets.has(key) && !aiPowerPellets.has(key) && !versusFlashPellets.has(key) && !targetSet.has(key)) {
        candidates.push({ x, y });
      }
    });
  });
  shuffle(candidates).slice(0, amount).forEach((cell) => targetSet.add(`${cell.x},${cell.y}`));
}

function placeExactItemsForFlash(amount) {
  placeExactItems(versusFlashPellets, amount);
}

function placeExactPortals(amount) {
  const oldCount = currentGhostCount;
  currentGhostCount = amount <= 1 ? 1 : amount === 2 ? 2 : 3;
  const candidates = [];
  currentMap.rowsData.forEach((row, y) => {
    row.split("").forEach((tile, x) => {
      const key = `${x},${y}`;
      if (tile === "." && !powerPellets.has(key) && !aiPowerPellets.has(key) && !versusFlashPellets.has(key)) {
        candidates.push({ x, y });
      }
    });
  });
  shuffle(candidates).forEach((cell) => {
    const farEnough = wormholes.every((hole) => Math.abs(hole.x - cell.x) + Math.abs(hole.y - cell.y) >= 6);
    if (farEnough && wormholes.length < amount) wormholes.push(cell);
  });
  currentGhostCount = oldCount;
}

function updateVersusScore() {
  const pacPlayer = versus.pacPlayer.toUpperCase();
  const ghostPlayer = versus.ghostPlayer.toUpperCase();
  const p1Inventory = versus.players.p1.role === "pac" ? versus.pacPower - versus.pacPowerUsed : versus.ghostFlash - versus.ghostFlashUsed;
  const p2Inventory = versus.players.p2.role === "pac" ? versus.pacPower - versus.pacPowerUsed : versus.ghostFlash - versus.ghostFlashUsed;
  scoreValue.textContent = `${versus.p1Score} / ${versus.p2Score}`;
  pelletProgress.textContent = currentLanguage === "zh"
    ? `${pacPlayer} 豆子 ${totalPellets - pellets.size} / ${totalPellets}`
    : `${pacPlayer} Pac beans ${totalPellets - pellets.size} / ${totalPellets}`;
  powerProgress.textContent = currentLanguage === "zh"
    ? `${pacPlayer} 道具豆 ${versus.pacPower - versus.pacPowerUsed} · ${ghostPlayer} 闪电 ${versus.ghostFlash - versus.ghostFlashUsed}`
    : `${pacPlayer} Power ${versus.pacPower - versus.pacPowerUsed} · ${ghostPlayer} Flash ${versus.ghostFlash - versus.ghostFlashUsed}`;
  document.querySelectorAll("[data-mobile-ability]").forEach((button) => {
    const player = button.dataset.mobileAbility;
    const inventory = player === "p1" ? p1Inventory : p2Inventory;
    button.querySelector("em").textContent = Math.max(0, inventory);
    button.classList.toggle("ready", inventory > 0);
    button.classList.toggle("flash-ready", versus.players[player].role === "ghost");
  });
  renderGhostEffects();
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
  pelletProgress.textContent = currentLanguage === "zh"
    ? `豆子 ${totalPellets - pellets.size} / ${totalPellets}`
    : currentRole === "ghost"
    ? `Pac beans ${totalPellets - pellets.size} / ${totalPellets}`
    : `Beans ${totalPellets - pellets.size} / ${totalPellets}`;
  powerProgress.textContent = currentLanguage === "zh"
    ? `${currentRole === "ghost" ? "闪电" : "道具"} ${powerInventory - powerUsed} / ${powerPellets.size} 剩余`
    : `${currentRole === "ghost" ? "Flash" : "Power"} ${powerInventory - powerUsed} / ${powerPellets.size} left`;
  mobilePowerCount.textContent = powerInventory - powerUsed;
  mobileAbilityButton.classList.toggle("ready", powerInventory - powerUsed > 0);
  mobileAbilityButton.classList.toggle("flash-ready", currentRole === "ghost");
  renderGhostEffects();
}

function getGhostTimeLimit(ghostCount) {
  return ghostCount === 1 ? 180000 : ghostCount === 2 ? 240000 : 300000;
}

function formatTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  if (versusMode) {
    gameTimer.textContent = formatTime(ghostTimeLimit - elapsedTime);
    gameTimer.classList.toggle("urgent", ghostTimeLimit - elapsedTime <= 30000);
    gameTimer.setAttribute("aria-label", "Local Versus countdown timer");
    updateTeleportWarning();
    return;
  }

  if (currentRole === "ghost") {
    gameTimer.textContent = formatTime(ghostTimeLimit - elapsedTime);
    gameTimer.classList.toggle("urgent", ghostTimeLimit - elapsedTime <= 30000);
    gameTimer.setAttribute("aria-label", "Ghost mode countdown timer");
  } else {
    gameTimer.textContent = formatTime(elapsedTime);
    gameTimer.classList.remove("urgent");
    gameTimer.setAttribute("aria-label", "Pac mode elapsed timer");
  }

  updateTeleportWarning();
}

function updateTeleportWarning() {
  if (!teleportWarning) {
    return;
  }

  if ((!versusMode && currentRole !== "ghost") || wormholes.length === 0 || ghostStationaryMs < 3000) {
    teleportWarning.textContent = "";
    teleportWarning.className = "teleport-warning";
    return;
  }

  const second = Math.min(6, Math.floor(ghostStationaryMs / 1000));
  teleportWarning.textContent = second >= 6 ? "TELEPORT!" : `${second}s`;
  teleportWarning.className = `teleport-warning active warning-${second}`;
}

function getControlHint() {
  if (currentLanguage === "zh") {
    if (currentRole === "ghost") {
      return selectedDevice === "mobile"
        ? "你控制第一只幽灵。中间按钮使用闪电。"
        : "你控制第一只幽灵。用方向键或 WASD 移动，按 X 使用闪电。";
    }
    return selectedDevice === "mobile"
      ? "使用方向按钮移动。中间按钮使用道具豆。"
      : "使用方向键或 WASD 移动，按 X 使用道具豆。";
  }

  if (currentRole === "ghost") {
    return selectedDevice === "mobile"
      ? "You are the first ghost. Center button spends Flash."
      : "You are the first ghost. Use arrows or WASD. Press X to Flash.";
  }

  return selectedDevice === "mobile"
    ? "Use the arrows. Center button spends a power bean."
    : "Use arrow keys or WASD. Press X to spend a power bean.";
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

function movePlayerPacman() {
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
    statusText.textContent = currentLanguage === "zh"
      ? (selectedDevice === "mobile" ? "道具豆已准备。点击中间按钮。" : "道具豆已准备。靠近幽灵时按 X。")
      : (selectedDevice === "mobile" ? "Power bean ready. Tap the center button." : "Power bean ready. Press X near a ghost.");
    updateScore();
  }
}

function movePlayerGhost() {
  const playerGhost = ghosts[0];
  if (!playerGhost || playerGhost.teleporting) {
    return;
  }

  if (canMove(playerGhost, nextDirection)) {
    playerGhost.direction = nextDirection;
  }

  if (canMove(playerGhost, playerGhost.direction)) {
    playerGhost.x += playerGhost.direction.x;
    playerGhost.y += playerGhost.direction.y;
  }

  const key = `${playerGhost.x},${playerGhost.y}`;
  if (powerPellets.has(key)) {
    powerPellets.delete(key);
    powerInventory += 1;
    score += 25;
    statusText.textContent = currentLanguage === "zh"
      ? (selectedDevice === "mobile" ? "闪电已准备。点击中间按钮。" : "闪电已准备。按 X 冲刺。")
      : (selectedDevice === "mobile" ? "Flash ready. Tap the center button." : "Flash ready. Press X to dash.");
    updateScore();
  }
}

function setVersusDirection(player, moveDirection) {
  if (versus.players[player].role === "pac") {
    versus.pacNextDirection = moveDirection;
  } else {
    versus.ghostNextDirection = moveDirection;
  }
}

function moveVersusPacman() {
  if (canMove(pacman, versus.pacNextDirection)) {
    versus.pacDirection = versus.pacNextDirection;
    direction = versus.pacDirection;
  }

  if (canMove(pacman, versus.pacDirection)) {
    pacman.x += versus.pacDirection.x;
    pacman.y += versus.pacDirection.y;
  }

  pacman.mouth += 0.28;
  const key = `${pacman.x},${pacman.y}`;
  if (pellets.has(key)) {
    pellets.delete(key);
    addVersusScore(versus.pacPlayer, 10);
  }

  if (powerPellets.has(key)) {
    powerPellets.delete(key);
    versus.pacPower += 1;
    addVersusScore(versus.pacPlayer, 25);
    statusText.textContent = currentLanguage === "zh" ? `${versus.pacPlayer.toUpperCase()} 道具豆已准备。` : `${versus.pacPlayer.toUpperCase()} Power Bean ready.`;
  }

  updateVersusScore();
}

function moveVersusGhost() {
  const playerGhost = ghosts[0];
  if (!playerGhost || playerGhost.teleporting) {
    return;
  }

  if (canMove(playerGhost, versus.ghostNextDirection)) {
    playerGhost.direction = versus.ghostNextDirection;
  }

  if (canMove(playerGhost, playerGhost.direction)) {
    playerGhost.x += playerGhost.direction.x;
    playerGhost.y += playerGhost.direction.y;
  }

  const key = `${playerGhost.x},${playerGhost.y}`;
  if (versusFlashPellets.has(key)) {
    versusFlashPellets.delete(key);
    versus.ghostFlash += 1;
    addVersusScore(versus.ghostPlayer, 25);
    statusText.textContent = currentLanguage === "zh" ? `${versus.ghostPlayer.toUpperCase()} 闪电已准备。` : `${versus.ghostPlayer.toUpperCase()} Flash ready.`;
  }

  updateVersusScore();
}

function addVersusScore(player, amount) {
  if (player === "p1") {
    versus.p1Score += amount;
  } else {
    versus.p2Score += amount;
  }
  score = Math.max(versus.p1Score, versus.p2Score);
}

function placePowerItems() {
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

function placeWormholes() {
  const target = currentGhostCount === 1
    ? 1
    : currentGhostCount === 2
    ? (Math.random() < 0.16 ? 3 : 2)
    : (Math.random() < 0.16 ? 4 : 3);

  if (target === 0) {
    return;
  }

  const candidates = [];
  currentMap.rowsData.forEach((row, y) => {
    row.split("").forEach((tile, x) => {
      const key = `${x},${y}`;
      if (tile !== "." || powerPellets.has(key) || aiPowerPellets.has(key)) {
        return;
      }

      const awayFromStarts = Math.abs(x - pacman.x) + Math.abs(y - pacman.y) > 5
        && ghosts.every((ghost) => Math.abs(x - ghost.x) + Math.abs(y - ghost.y) > 5);
      if (awayFromStarts && getOpenDirections({ x, y }).length >= 2) {
        candidates.push({ x, y });
      }
    });
  });

  shuffle(candidates).forEach((cell) => {
    const farEnough = wormholes.every((hole) => Math.abs(hole.x - cell.x) + Math.abs(hole.y - cell.y) >= Math.max(7, currentMap.cols / 3));
    if (farEnough && wormholes.length < target) {
      wormholes.push(cell);
    }
  });
}

function placeAiPowerBeans() {
  if (currentRole !== "ghost") {
    return;
  }

  const candidates = [];
  currentMap.rowsData.forEach((row, y) => {
    row.split("").forEach((tile, x) => {
      const key = `${x},${y}`;
      if (tile !== "." || powerPellets.has(key)) {
        return;
      }

      const awayFromPlayerGhost = ghosts[0] && Math.abs(x - ghosts[0].x) + Math.abs(y - ghosts[0].y) > 6;
      const notStart = Math.abs(x - pacman.x) + Math.abs(y - pacman.y) > 5;
      if (awayFromPlayerGhost && notStart && getOpenDirections({ x, y }).length >= 2) {
        candidates.push({ x, y });
      }
    });
  });

  const target = currentGhostCount === 1
    ? 2
    : currentGhostCount === 2
    ? (Math.random() < 0.18 ? 4 : 3)
    : (Math.random() < 0.18 ? 5 : 4);

  shuffle(candidates).slice(0, target).forEach((cell) => {
    aiPowerPellets.add(`${cell.x},${cell.y}`);
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
  if ((currentRole === "ghost" || versusMode) && ghost.index === 0) {
    return;
  }

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

function useAbility() {
  if (currentRole === "ghost") {
    useFlash();
  } else {
    usePowerBean();
  }
}

function usePowerBean() {
  if (!gameRunning || powerInventory - powerUsed <= 0) {
    return;
  }

  const target = findPowerTarget();
  if (!target) {
    statusText.textContent = currentLanguage === "zh" ? "直线范围内没有可命中的幽灵。" : "No ghost is in a clear power line.";
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
  statusText.textContent = currentLanguage === "zh" ? `幽灵被虚化 ${duration / 1000} 秒。` : `${target.color[0].toUpperCase()}${target.color.slice(1)} ghost phased for ${duration / 1000}s.`;
  updateScore();
}

function useFlash() {
  if (!gameRunning || powerInventory - powerUsed <= 0 || currentRole !== "ghost") {
    return;
  }

  const playerGhost = ghosts[0];
  if (!playerGhost) {
    return;
  }

  let dashDirection = playerGhost.direction;
  if (dashDirection.x === 0 && dashDirection.y === 0) {
    dashDirection = nextDirection.x !== 0 || nextDirection.y !== 0 ? nextDirection : { x: -1, y: 0 };
  }

  if (!canMove(playerGhost, dashDirection)) {
    statusText.textContent = currentLanguage === "zh" ? "闪电需要前方有空位。" : "Flash needs open space ahead.";
    return;
  }

  powerUsed += 1;
  const trail = [{ x: playerGhost.x, y: playerGhost.y }];
  for (let step = 0; step < 4; step += 1) {
    if (!canMove(playerGhost, dashDirection)) {
      break;
    }
    playerGhost.x += dashDirection.x;
    playerGhost.y += dashDirection.y;
    trail.push({ x: playerGhost.x, y: playerGhost.y });
    if (playerGhost.x === pacman.x && playerGhost.y === pacman.y) {
      break;
    }
  }

  playerGhost.direction = dashDirection;
  playerGhost.flashUntil = performance.now() + 520;
  playerGhost.flashEffectUntil = performance.now() + 2500;
  flashEffects.push({
    color: playerGhost.color,
    trail,
    startedAt: performance.now(),
  });
  score += Math.max(10, (trail.length - 1) * 8);
  statusText.textContent = currentLanguage === "zh" ? "闪电冲刺。" : "Flash dash.";
  updateScore();
}

function useVersusAbility(player) {
  if (!gameRunning || !versusMode) {
    return;
  }

  if (versus.players[player].role === "pac") {
    useVersusPowerBean(player);
  } else {
    useVersusFlash(player);
  }
}

function useVersusPowerBean(player) {
  if (versus.pacPower - versus.pacPowerUsed <= 0) {
    return;
  }

  const target = findPowerTarget();
  if (!target || isGhostPhased(target)) {
    statusText.textContent = currentLanguage === "zh" ? "直线范围内没有可命中的幽灵。" : "No ghost is in a clear power line.";
    return;
  }

  const now = performance.now();
  const duration = getPhasedDuration();
  versus.pacPowerUsed += 1;
  target.phaseDuration = duration;
  target.phasedUntil = now + duration;
  target.timer = 0;
  target.wobble = 0;
  laserEffects.push({
    from: { x: pacman.x, y: pacman.y },
    to: { x: target.x, y: target.y },
    startedAt: now,
  });
  addVersusScore(player, 35);
  statusText.textContent = currentLanguage === "zh" ? `${player.toUpperCase()} 虚化了幽灵。` : `${player.toUpperCase()} phased the ${target.color} ghost.`;
  updateVersusScore();
}

function useVersusFlash(player) {
  if (versus.ghostFlash - versus.ghostFlashUsed <= 0) {
    return;
  }

  const playerGhost = ghosts[0];
  if (!playerGhost || playerGhost.teleporting) {
    return;
  }

  let dashDirection = playerGhost.direction;
  if (dashDirection.x === 0 && dashDirection.y === 0) {
    dashDirection = versus.ghostNextDirection.x !== 0 || versus.ghostNextDirection.y !== 0
      ? versus.ghostNextDirection
      : { x: -1, y: 0 };
  }

  if (!canMove(playerGhost, dashDirection)) {
    statusText.textContent = currentLanguage === "zh" ? "闪电需要前方有空位。" : "Flash needs open space ahead.";
    return;
  }

  versus.ghostFlashUsed += 1;
  const trail = [{ x: playerGhost.x, y: playerGhost.y }];
  for (let step = 0; step < 4; step += 1) {
    if (!canMove(playerGhost, dashDirection)) {
      break;
    }
    playerGhost.x += dashDirection.x;
    playerGhost.y += dashDirection.y;
    trail.push({ x: playerGhost.x, y: playerGhost.y });
    if (playerGhost.x === pacman.x && playerGhost.y === pacman.y) {
      break;
    }
  }

  playerGhost.direction = dashDirection;
  playerGhost.flashUntil = performance.now() + 520;
  playerGhost.flashEffectUntil = performance.now() + 2500;
  flashEffects.push({
    color: playerGhost.color,
    trail,
    startedAt: performance.now(),
  });
  addVersusScore(player, Math.max(10, (trail.length - 1) * 8));
  statusText.textContent = currentLanguage === "zh" ? `${player.toUpperCase()} 闪电冲刺。` : `${player.toUpperCase()} Flash dash.`;
  updateVersusScore();
}

function findPowerTarget() {
  const candidates = ghosts
    .filter((ghost) => !isGhostPhased(ghost))
    .map((ghost) => ({ ghost, distance: lineDistanceToGhost(ghost) }))
    .filter((item) => item.distance > 0 && item.distance <= powerRange)
    .sort((a, b) => a.distance - b.distance);

  return candidates[0] ? candidates[0].ghost : null;
}

function findAiPowerTarget() {
  const candidates = ghosts
    .filter((ghost) => !isGhostPhased(ghost))
    .map((ghost) => ({ ghost, distance: lineDistanceToGhost(ghost) }))
    .filter((item) => item.distance > 0 && item.distance <= powerRange)
    .sort((a, b) => {
      if (a.ghost.index === 0 && b.ghost.index !== 0) {
        return -1;
      }
      if (b.ghost.index === 0 && a.ghost.index !== 0) {
        return 1;
      }
      return a.distance - b.distance;
    });

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
  return ghosts.some((ghost) => ghost.x === pacman.x && ghost.y === pacman.y && !isGhostPhased(ghost) && !ghost.teleporting);
}

function updateGhostStationary(delta) {
  if ((!versusMode && currentRole !== "ghost") || wormholes.length === 0 || !ghosts[0] || ghosts[0].teleporting) {
    return;
  }

  const playerGhost = ghosts[0];
  const key = `${playerGhost.x},${playerGhost.y}`;
  if (ghostLastPosition !== key) {
    ghostLastPosition = key;
    ghostStationaryMs = 0;
    return;
  }

  ghostStationaryMs += delta;
  if (ghostStationaryMs >= 6000) {
    startWormholeTeleport(playerGhost);
  }
}

function startWormholeTeleport(playerGhost) {
  if (wormholes.length === 0 || playerGhost.teleporting) {
    ghostStationaryMs = 0;
    return;
  }

  const target = getLikelyTeleportHole();
  if (!target) {
    ghostStationaryMs = 0;
    return;
  }
  const from = { x: playerGhost.x, y: playerGhost.y };
  const duration = pacmanDelay * (currentGhostCount === 1 ? 6 : 5);

  playerGhost.teleporting = {
    from,
    to: target,
    startedAt: performance.now(),
    duration,
  };
  teleportEffects.push({
    from,
    to: target,
    startedAt: performance.now(),
    duration,
    color: playerGhost.color,
  });
  ghostStationaryMs = 0;
  teleportWarning.textContent = "TELEPORT!";
  teleportWarning.className = "teleport-warning active warning-6";
}

function updateTeleportingGhosts(timestamp) {
  ghosts.forEach((ghost) => {
    if (!ghost.teleporting) {
      return;
    }

    const progress = (timestamp - ghost.teleporting.startedAt) / ghost.teleporting.duration;
    if (progress >= 1) {
      ghost.x = ghost.teleporting.to.x;
      ghost.y = ghost.teleporting.to.y;
      ghost.teleporting = null;
      ghostLastPosition = `${ghost.x},${ghost.y}`;
      ghostStationaryMs = 0;
    }
  });
}

function moveAiPacman() {
  const options = getOpenDirections(pacman);
  if (options.length === 0) {
    return;
  }
  const blockedEscape = isPacBlockedByGhost();

  const ranked = options
    .map((option) => {
      const x = pacman.x + option.x;
      const y = pacman.y + option.y;
      const nearestGhost = ghosts.reduce((best, ghost) => Math.min(best, Math.abs(x - ghost.x) + Math.abs(y - ghost.y)), Infinity);
      const nearestPellet = findNearestPelletDistance(x, y);
      const nearestPower = findNearestAiPowerDistance(x, y);
      const openSpace = getOpenDirections({ x, y }).length;
      const intelligence = currentGhostCount === 1 ? 1.16 : currentGhostCount === 2 ? 1.58 : 1.96;
      const dangerPenalty = nearestGhost <= 1 ? 46 * intelligence : nearestGhost <= 2 ? 26 * intelligence : nearestGhost <= 4 ? 8 * intelligence : 0;
      const greedyPull = nearestPellet * (currentGhostCount === 1 ? 2.4 : currentGhostCount === 2 ? 2.85 : 3.28);
      const powerPull = nearestGhost <= 5 && aiPowerPellets.size > 0 ? nearestPower * (currentGhostCount === 1 ? 1.78 : currentGhostCount === 2 ? 2.32 : 2.76) : 0;
      const reversePenalty = option.x === -direction.x && option.y === -direction.y ? (currentGhostCount === 1 ? 4.5 : currentGhostCount === 2 ? 10 : 15) : 0;
      const oscillationPenalty = wouldRepeatPacStep(x, y) ? (currentGhostCount === 1 ? 4 : currentGhostCount === 2 ? 12 : 17) : 0;
      const greedyNoise = Math.random() < (currentGhostCount === 1 ? 0.12 : currentGhostCount === 2 ? 0.06 : 0.03) ? 5 : 0;
      const escapeBonus = blockedEscape ? evaluateEscapeRoute(x, y) * (currentGhostCount === 1 ? 11 : currentGhostCount === 2 ? 15 : 19) : 0;
      const wormholePenalty = getTeleportThreatPenalty(x, y) * intelligence;
      return {
        option,
        score: -greedyPull - powerPull - dangerPenalty - wormholePenalty + openSpace * 1.2 - reversePenalty - oscillationPenalty + greedyNoise + escapeBonus,
      };
    })
    .sort((a, b) => b.score - a.score);

  direction = ranked[0].option;
  pacman.x += direction.x;
  pacman.y += direction.y;
  rememberPacPosition();
  pacman.mouth += 0.28;

  const key = `${pacman.x},${pacman.y}`;
  if (pellets.has(key)) {
    pellets.delete(key);
    score = Math.max(0, score - 4);
    updateScore();
  }

  if (aiPowerPellets.has(key)) {
    aiPowerPellets.delete(key);
    useAiPowerBean();
    updateScore();
  }
}

function getTeleportThreatPenalty(x, y) {
  if (currentRole !== "ghost" || wormholes.length === 0 || ghostStationaryMs < 3200) {
    return 0;
  }

  const likelyHole = getLikelyTeleportHole();
  if (!likelyHole) {
    return 0;
  }

  const distance = Math.abs(x - likelyHole.x) + Math.abs(y - likelyHole.y);
  const pressure = Math.min(1, (ghostStationaryMs - 3000) / 3000);
  if (distance <= 1) {
    return 34 * pressure;
  }
  if (distance <= 3) {
    return 20 * pressure;
  }
  if (distance <= 5) {
    return 9 * pressure;
  }
  return 0;
}

function rememberPacPosition() {
  pacRecentPositions.push(`${pacman.x},${pacman.y}`);
  if (pacRecentPositions.length > 6) {
    pacRecentPositions.shift();
  }
}

function wouldRepeatPacStep(x, y) {
  const key = `${x},${y}`;
  return pacRecentPositions.slice(-4, -1).filter((position) => position === key).length > 0;
}

function getLikelyTeleportHole() {
  if (wormholes.length === 0) {
    return null;
  }

  return wormholes
    .map((hole) => ({ hole, distance: Math.abs(hole.x - pacman.x) + Math.abs(hole.y - pacman.y) }))
    .sort((a, b) => b.distance - a.distance)[0].hole;
}

function useAiPowerBean() {
  const target = findAiPowerTarget();
  if (!target) {
    statusText.textContent = "AI Pac grabbed a Power Bean, but no ghost was in line.";
    return;
  }

  const now = performance.now();
  target.phaseDuration = 4200;
  target.phasedUntil = now + 4200;
  target.timer = 0;
  laserEffects.push({
    from: { x: pacman.x, y: pacman.y },
    to: { x: target.x, y: target.y },
    startedAt: now,
  });
  statusText.textContent = `AI Pac phased the ${target.color} ghost.`;
}

function isPacBlockedByGhost() {
  return ghosts.some((ghost) => Math.abs(ghost.x - pacman.x) + Math.abs(ghost.y - pacman.y) <= 3);
}

function evaluateEscapeRoute(startX, startY) {
  const visited = new Set();
  const queue = [{ x: startX, y: startY, distance: 0 }];
  let openCount = 0;
  let safety = 0;
  let pelletSeen = false;

  while (queue.length > 0 && openCount < 18) {
    const current = queue.shift();
    const key = `${current.x},${current.y}`;
    if (visited.has(key) || !isOpen(current.x, current.y)) {
      continue;
    }

    visited.add(key);
    openCount += 1;
    const nearestGhost = ghosts.reduce((best, ghost) => Math.min(best, Math.abs(current.x - ghost.x) + Math.abs(current.y - ghost.y)), Infinity);
    safety += Math.min(nearestGhost, 7);
    if (pellets.has(key) || aiPowerPellets.has(key)) {
      pelletSeen = true;
    }

    if (current.distance >= 5) {
      continue;
    }

    [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ].forEach((move) => {
      queue.push({ x: current.x + move.x, y: current.y + move.y, distance: current.distance + 1 });
    });
  }

  return openCount + safety * 0.18 + (pelletSeen ? 5 : 0);
}

function findNearestPelletDistance(x, y) {
  let best = Infinity;
  pellets.forEach((key) => {
    const [pelletX, pelletY] = key.split(",").map(Number);
    best = Math.min(best, Math.abs(x - pelletX) + Math.abs(y - pelletY));
  });
  return best === Infinity ? 0 : best;
}

function findNearestAiPowerDistance(x, y) {
  let best = Infinity;
  aiPowerPellets.forEach((key) => {
    const [powerX, powerY] = key.split(",").map(Number);
    best = Math.min(best, Math.abs(x - powerX) + Math.abs(y - powerY));
  });
  return best === Infinity ? 0 : best;
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

  if (versusMode) {
    gameLoopVersus(timestamp);
    return;
  }

  const delta = timestamp - lastFrameTime;
  lastFrameTime = timestamp;
  elapsedTime = timestamp - gameStartTime;
  updateTimerDisplay();
  updateTeleportingGhosts(timestamp);
  pacmanTimer += delta;

  if (pacmanTimer >= pacmanDelay) {
    pacmanTimer = 0;
    if (currentRole === "ghost") {
      moveAiPacman();
    } else {
      movePlayerPacman();
      pacman.mouth += 0.28;
    }
  }

  ghosts.forEach((ghost) => {
    ghost.timer += delta;
    const delay = getGhostMoveDelay(ghost);
    if (ghost.timer >= delay) {
      ghost.timer = 0;
      moveGhost(ghost);
    }
  });

  if (currentRole === "ghost") {
    ghostTimer += delta;
    if (ghostTimer >= getGhostMoveDelay(ghosts[0])) {
      ghostTimer = 0;
      movePlayerGhost();
    }
    updateGhostStationary(delta);
  }
  softenHeavyPressure();

  laserEffects = laserEffects.filter((effect) => timestamp - effect.startedAt < 420);
  flashEffects = flashEffects.filter((effect) => timestamp - effect.startedAt < 520);
  teleportEffects = teleportEffects.filter((effect) => timestamp - effect.startedAt < effect.duration + 260);
  renderGhostEffects();

  if (checkCollision()) {
    finishGame(currentRole === "ghost");
    return;
  }

  if (currentRole === "ghost" && elapsedTime >= ghostTimeLimit) {
    finishGame(false);
    return;
  }

  if (pellets.size === 0) {
    finishGame(currentRole !== "ghost");
    return;
  }

  drawGame();
  animationId = requestAnimationFrame(gameLoop);
}

function gameLoopVersus(timestamp) {
  const delta = timestamp - lastFrameTime;
  lastFrameTime = timestamp;
  elapsedTime = timestamp - gameStartTime;
  updateTimerDisplay();
  updateTeleportingGhosts(timestamp);

  pacmanTimer += delta;
  if (pacmanTimer >= pacmanDelay) {
    pacmanTimer = 0;
    moveVersusPacman();
  }

  ghosts.forEach((ghost) => {
    ghost.timer += delta;
    const delay = getGhostMoveDelay(ghost);
    if (ghost.timer >= delay) {
      ghost.timer = 0;
      moveGhost(ghost);
    }
  });

  ghostTimer += delta;
  if (ghostTimer >= getGhostMoveDelay(ghosts[0])) {
    ghostTimer = 0;
    moveVersusGhost();
  }
  updateGhostStationary(delta);
  softenHeavyPressure();

  laserEffects = laserEffects.filter((effect) => timestamp - effect.startedAt < 420);
  flashEffects = flashEffects.filter((effect) => timestamp - effect.startedAt < 520);
  teleportEffects = teleportEffects.filter((effect) => timestamp - effect.startedAt < effect.duration + 260);
  renderGhostEffects();

  if (checkCollision()) {
    finishVersusGame(versus.ghostPlayer, "Caught Pac before the tide ran out.");
    return;
  }

  if (pellets.size === 0) {
    finishVersusGame(versus.pacPlayer, "Cleared the maze.");
    return;
  }

  if (elapsedTime >= ghostTimeLimit) {
    finishVersusGame(versus.ghostPlayer, "Pac ran out of time.");
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

function finishVersusGame(winnerPlayer, reason) {
  pauseGame();
  resultKicker.textContent = currentLanguage === "zh" ? "本地双人" : "Local Versus";
  resultTitle.textContent = currentLanguage === "zh" ? `${winnerPlayer.toUpperCase()} 获胜。` : `${winnerPlayer.toUpperCase()} wins.`;
  resultSummary.textContent = currentLanguage === "zh"
    ? `本局结束 · P1 ${versus.p1Score} / P2 ${versus.p2Score} · ${currentGhostCount} ${tr("ghosts")} · 不计入排行榜`
    : `${reason} · P1 ${versus.p1Score} / P2 ${versus.p2Score} · ${currentGhostCount} ${currentGhostCount === 1 ? "Ghost" : "Ghosts"} · No leaderboard save`;
  renderResultStage(winnerPlayer === versus.pacPlayer);
  resultActions.innerHTML = "";

  const mainButton = document.createElement("button");
  mainButton.className = "ghost-button";
  mainButton.type = "button";
  mainButton.textContent = tr("main");
  mainButton.addEventListener("click", () => {
    document.body.classList.remove("versus-mode");
    historyStack.length = 0;
    historyStack.push("homePage", "invitePage", "gameMenuPage");
    showScreen("gameMenuPage", false);
  });
  resultActions.appendChild(mainButton);

  const rematchButton = document.createElement("button");
  rematchButton.className = "primary-button";
  rematchButton.type = "button";
  rematchButton.textContent = tr("rematch");
  rematchButton.addEventListener("click", () => {
    startVersusCountdown();
  });
  resultActions.appendChild(rematchButton);
  showScreen("resultPage");
}

function showResult(won) {
  resultKicker.textContent = won ? tr("victory") : tr("gameOver");
  resultTitle.textContent = won
    ? (currentRole === "ghost" ? tr("caught") : tr("beautifulRun"))
    : (currentRole === "ghost" ? tr("pacSlipped") : tr("tideTook"));
  const roleLabel = currentRole === "ghost" ? (currentLanguage === "zh" ? "幽灵模式" : "Ghost Mode") : (currentLanguage === "zh" ? "吃豆人模式" : "Pac Mode");
  const runLabel = currentRunType === "Story" ? tr("story") : tr("manual");
  resultSummary.textContent = currentLanguage === "zh"
    ? `${score} 分 · ${roleLabel} · ${runLabel} · ${currentGhostCount} ${tr("ghosts")}`
    : `${score} points · ${roleLabel} · ${runLabel} · ${currentGhostCount} ${currentGhostCount === 1 ? "Ghost" : "Ghosts"}`;
  renderResultStage(won);
  resultActions.innerHTML = "";

  const mainButton = document.createElement("button");
  mainButton.className = "ghost-button";
  mainButton.type = "button";
  mainButton.textContent = tr("main");
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
    nextButton.textContent = tr("continue");
    nextButton.addEventListener("click", () => {
      if (currentRunType === "Story") {
        storyLevel += 1;
        startCountdown(Math.min(storyLevel, 3), "Story", currentRole);
      } else {
        startCountdown(currentGhostCount, "Manual", currentRole);
      }
    });
  } else {
    nextButton.textContent = tr("restart");
    nextButton.addEventListener("click", () => {
      startCountdown(currentGhostCount, currentRunType, currentRole);
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
  const pacColor = versusMode ? versus.players[versus.pacPlayer].skin : selectedSkin;
  pac.style.background = `conic-gradient(from 36deg, transparent 0deg 74deg, ${skinColorValues[pacColor] || skinColorValues.yellow} 75deg 360deg)`;
  pac.style.boxShadow = `0 0 26px ${skinColorValues[pacColor] || skinColorValues.yellow}`;
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
  drawWormholes();
  drawTeleportEffects();
  drawPellets();
  drawAiPowerPellets();
  drawVersusFlashPellets();
  drawPowerPellets();
  drawLaserEffects();
  drawFlashEffects();
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
    context.fillStyle = currentRole === "ghost" ? flashColor : powerBeanColor;
    context.shadowColor = currentRole === "ghost" ? "rgba(246, 211, 101, 0.9)" : "rgba(29, 140, 255, 0.95)";
    context.shadowBlur = 20;
    if (currentRole === "ghost") {
      drawFlashBolt(0, 0, Math.max(10, tileSize * 0.42) * pulse);
    } else {
      context.arc(0, 0, Math.max(3.4, tileSize * 0.17) * pulse, 0, Math.PI * 2);
      context.fill();
    }
    context.beginPath();
    context.strokeStyle = currentRole === "ghost" ? "rgba(246, 211, 101, 0.7)" : "rgba(190, 233, 255, 0.7)";
    context.lineWidth = Math.max(1, tileSize * 0.035);
    context.arc(0, 0, Math.max(5, tileSize * 0.27), 0, Math.PI * 2);
    context.stroke();
    context.restore();
  });
  context.shadowBlur = 0;
}

function drawWormholes() {
  wormholes.forEach((hole) => {
    const x = cellCenterX(hole.x);
    const y = cellCenterY(hole.y) + tileSize * 0.18;
    context.save();
    context.globalAlpha = 0.78;
    context.fillStyle = "rgba(2, 14, 34, 0.72)";
    context.strokeStyle = "rgba(29, 76, 142, 0.78)";
    context.shadowColor = "rgba(29, 76, 142, 0.55)";
    context.shadowBlur = 10;
    context.lineWidth = Math.max(1, tileSize * 0.05);
    context.beginPath();
    context.ellipse(x, y, tileSize * 0.43, tileSize * 0.18, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.globalAlpha = 0.32;
    context.beginPath();
    context.ellipse(x, y, tileSize * 0.56, tileSize * 0.24, 0, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  });
}

function drawAiPowerPellets() {
  if (currentRole !== "ghost") {
    return;
  }

  const pulse = 0.75 + Math.sin(performance.now() / 210) * 0.25;
  aiPowerPellets.forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    context.save();
    context.translate(cellCenterX(x), cellCenterY(y));
    context.beginPath();
    context.fillStyle = powerBeanColor;
    context.shadowColor = "rgba(29, 140, 255, 0.95)";
    context.shadowBlur = 18;
    context.arc(0, 0, Math.max(3.2, tileSize * 0.15) * pulse, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.strokeStyle = "rgba(190, 233, 255, 0.58)";
    context.lineWidth = Math.max(1, tileSize * 0.03);
    context.arc(0, 0, Math.max(5, tileSize * 0.24), 0, Math.PI * 2);
    context.stroke();
    context.restore();
  });
  context.shadowBlur = 0;
}

function drawVersusFlashPellets() {
  if (!versusMode) {
    return;
  }

  const pulse = 0.75 + Math.sin(performance.now() / 210) * 0.25;
  versusFlashPellets.forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    context.save();
    context.translate(cellCenterX(x), cellCenterY(y));
    context.fillStyle = flashColor;
    context.shadowColor = "rgba(246, 211, 101, 0.92)";
    context.shadowBlur = 18;
    drawFlashBolt(0, 0, Math.max(10, tileSize * 0.42) * pulse);
    context.beginPath();
    context.strokeStyle = "rgba(246, 211, 101, 0.58)";
    context.lineWidth = Math.max(1, tileSize * 0.03);
    context.arc(0, 0, Math.max(5, tileSize * 0.25), 0, Math.PI * 2);
    context.stroke();
    context.restore();
  });
  context.shadowBlur = 0;
}

function drawFlashBolt(x, y, size) {
  context.beginPath();
  context.moveTo(x + size * 0.08, y - size * 0.5);
  context.lineTo(x - size * 0.24, y + size * 0.02);
  context.lineTo(x + size * 0.02, y + size * 0.02);
  context.lineTo(x - size * 0.12, y + size * 0.52);
  context.lineTo(x + size * 0.32, y - size * 0.12);
  context.lineTo(x + size * 0.06, y - size * 0.12);
  context.closePath();
  context.fill();
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

function drawFlashEffects() {
  const now = performance.now();
  flashEffects.forEach((effect) => {
    const age = now - effect.startedAt;
    const progress = Math.min(1, age / 520);
    const eased = 1 - Math.pow(1 - progress, 3);
    const opacity = Math.max(0, 1 - progress);
    const movingIndex = Math.min(effect.trail.length - 1, Math.floor(eased * (effect.trail.length - 1)));
    context.save();
    context.fillStyle = ghostColorValues[effect.color];
    context.shadowColor = ghostColorValues[effect.color];
    context.shadowBlur = 18;
    effect.trail.forEach((point, index) => {
      context.globalAlpha = opacity * (index + 1) / effect.trail.length * 0.34;
      context.beginPath();
      context.arc(cellCenterX(point.x), cellCenterY(point.y), tileSize * 0.28, 0, Math.PI * 2);
      context.fill();
    });
    const current = effect.trail[movingIndex];
    context.globalAlpha = opacity * 0.78;
    context.beginPath();
    context.arc(cellCenterX(current.x), cellCenterY(current.y), tileSize * 0.34, 0, Math.PI * 2);
    context.fill();
    context.restore();
  });
}

function drawTeleportEffects() {
  const now = performance.now();
  teleportEffects.forEach((effect) => {
    const progress = Math.min(1, (now - effect.startedAt) / effect.duration);
    const firstHalf = progress < 0.5;
    const stageProgress = firstHalf ? progress / 0.5 : (progress - 0.5) / 0.5;
    const point = firstHalf ? effect.from : effect.to;
    const alpha = firstHalf ? 1 - stageProgress : stageProgress;
    const lift = Math.sin(stageProgress * Math.PI) * tileSize * 0.22;
    const x = cellCenterX(point.x);
    const y = cellCenterY(point.y) - lift;

    context.save();
    context.globalAlpha = Math.max(0.18, alpha);
    context.fillStyle = ghostColorValues[effect.color] || ghostColorValues.blue;
    context.shadowColor = ghostColorValues[effect.color] || ghostColorValues.blue;
    context.shadowBlur = 20;
    context.beginPath();
    context.arc(x, y, tileSize * 0.3, 0, Math.PI * 2);
    context.fill();

    for (let i = 0; i < 7; i += 1) {
      const angle = i * 0.9 + now / 160;
      const radius = tileSize * (0.18 + stageProgress * 0.28);
      context.globalAlpha = (1 - stageProgress * 0.6) * 0.28;
      context.beginPath();
      context.arc(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, Math.max(1.5, tileSize * 0.045), 0, Math.PI * 2);
      context.fillStyle = "rgba(224, 238, 255, 0.8)";
      context.fill();
    }
    context.restore();
  });
}

function drawPacman() {
  const radius = tileSize * 0.38;
  const mouth = 0.22 + Math.abs(Math.sin(pacman.mouth)) * 0.18;
  const angle = Math.atan2(direction.y, direction.x || 1);
  const pacColor = versusMode ? versus.players[versus.pacPlayer].skin : selectedSkin;

  context.save();
  context.translate(cellCenterX(pacman.x), cellCenterY(pacman.y));
  context.rotate(angle);
  context.beginPath();
  context.moveTo(0, 0);
  context.arc(0, 0, radius, mouth, Math.PI * 2 - mouth);
  context.closePath();
  context.fillStyle = skinColorValues[pacColor] || skinColorValues.yellow;
  context.shadowColor = skinColorValues[pacColor] || skinColorValues.yellow;
  context.shadowBlur = 18;
  context.fill();
  context.shadowBlur = 0;
  context.restore();
}

function drawGhost(ghost) {
  if (ghost.teleporting) {
    return;
  }

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

  if (ghost.flashUntil > performance.now()) {
    drawGhostFlashBolt(left + width / 2, top - height * 0.2, width * 0.42);
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

function drawGhostFlashBolt(x, y, size) {
  context.save();
  context.fillStyle = flashColor;
  context.shadowColor = "rgba(246, 211, 101, 0.9)";
  context.shadowBlur = 12;
  context.translate(x, y + Math.sin(performance.now() / 90) * 1.2);
  drawFlashBolt(0, 0, size);
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
  const runTime = Math.min(elapsedTime, ghostTimeLimit);
  scores.push({
    score: finalScore,
    result: won ? "Victory" : "Game Over",
    runType: currentRunType,
    role: currentRole === "ghost" ? "Ghost Mode" : "Pac Mode",
    ghosts: currentGhostCount,
    map: currentMapIndex + 1,
    duration: runTime,
    timeLimit: currentRole === "ghost" ? ghostTimeLimit : null,
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
  localStorage.setItem("miniPacLeaderboardV2", JSON.stringify(scores.slice(0, 16)));
}

function getLeaderboardScores() {
  return JSON.parse(localStorage.getItem("miniPacLeaderboardV2") || "[]");
}

function renderLeaderboard() {
  const scores = getLeaderboardScores().filter((savedScore) => {
    const role = savedScore.role || "Pac Mode";
    return leaderboardMode === "ghost" ? role === "Ghost Mode" : role !== "Ghost Mode";
  });
  leaderboardList.innerHTML = "";

  if (scores.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-board";
    empty.textContent = leaderboardMode === "ghost" ? tr("noGhostScores") : tr("noPacScores");
    leaderboardList.appendChild(empty);
    return;
  }

  scores.forEach((savedScore, index) => {
    const entry = document.createElement("article");
    entry.className = "leaderboard-entry";
    entry.innerHTML = `
      <div class="rank">${String(index + 1).padStart(2, "0")}</div>
      <div>
        <div class="entry-score">${savedScore.score} ${currentLanguage === "zh" ? "分" : "pts"}</div>
        <div class="entry-meta">${formatLeaderboardMeta(savedScore)}</div>
      </div>
      <div class="entry-time">${savedScore.time}</div>
    `;
    leaderboardList.appendChild(entry);
  });
}

function formatLeaderboardMeta(savedScore) {
  const role = savedScore.role || "Pac Mode";
  if (currentLanguage === "zh") {
    const roleLabel = role === "Ghost Mode" ? "幽灵模式" : "吃豆人模式";
    const runLabel = savedScore.runType === "Story" ? "剧情" : "自由";
    const resultLabel = savedScore.result === "Victory" ? "胜利" : "游戏结束";
    const baseZh = `${roleLabel} · ${runLabel} · ${savedScore.ghosts} 幽灵 · ${resultLabel} · 地图 ${savedScore.map}`;
    if (role === "Ghost Mode") {
      return `${baseZh} · ${formatSeconds(savedScore.duration || 0)} / ${formatSeconds(savedScore.timeLimit || getGhostTimeLimit(savedScore.ghosts))}`;
    }
    return savedScore.duration ? `${baseZh} · ${formatSeconds(savedScore.duration)}` : baseZh;
  }
  const base = `${role} · ${savedScore.runType} · ${savedScore.ghosts} ${savedScore.ghosts === 1 ? "Ghost" : "Ghosts"} · ${savedScore.result} · Map ${savedScore.map}`;
  if (role === "Ghost Mode") {
    return `${base} · ${formatSeconds(savedScore.duration || 0)} / ${formatSeconds(savedScore.timeLimit || getGhostTimeLimit(savedScore.ghosts))}`;
  }
  return savedScore.duration ? `${base} · ${formatSeconds(savedScore.duration)}` : base;
}

function formatSeconds(milliseconds) {
  return `${Math.ceil(milliseconds / 1000)}s`;
}

function renderGhostEffects() {
  ghostEffects.innerHTML = "";
  const now = performance.now();
  if (currentRole === "ghost" || versusMode) {
    ghosts
      .filter((ghost) => ghost.flashEffectUntil > now)
      .forEach((ghost) => {
        const item = document.createElement("div");
        item.className = "ghost-effect flash-effect";
        item.innerHTML = `
          <span class="effect-ghost ${ghost.color}"></span>
          <b>dash</b>
          <i><span></span></i>
        `;
        ghostEffects.appendChild(item);
      });
  }

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
  if (versusMode) {
    const p1Map = {
      w: { x: 0, y: -1 },
      W: { x: 0, y: -1 },
      s: { x: 0, y: 1 },
      S: { x: 0, y: 1 },
      a: { x: -1, y: 0 },
      A: { x: -1, y: 0 },
      d: { x: 1, y: 0 },
      D: { x: 1, y: 0 },
    };
    const p2Map = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };

    if (p1Map[event.key]) {
      event.preventDefault();
      setVersusDirection("p1", p1Map[event.key]);
      return;
    }

    if (p2Map[event.key]) {
      event.preventDefault();
      setVersusDirection("p2", p2Map[event.key]);
      return;
    }

    if (event.key === "q" || event.key === "Q") {
      event.preventDefault();
      useVersusAbility("p1");
      return;
    }

    if (event.key === "/" || event.key === "?") {
      event.preventDefault();
      useVersusAbility("p2");
      return;
    }
  }

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
    useAbility();
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
syncDetectedOrientation();
setDeviceMode(selectedDevice);
setMobileOrientation(selectedMobileOrientation === "auto" ? "portrait" : selectedMobileOrientation);
setSkin(selectedSkin);
setGhostSkin(selectedGhostSkin);
prepareGame(1, "Story");
applyLanguage();
