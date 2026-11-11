const colors = ['green', 'red', 'yellow', 'blue'];
let gameSequence = [];
let playerSequence = [];
let level = 0;
let highScore = localStorage.getItem('simonHighScore') || 0;
let isComputerPlaying = false;

// DOM Elements
const pads = document.querySelectorAll('.pad');
const startBtn = document.getElementById('start-btn');
const levelDisplay = document.getElementById('level');
const highScoreDisplay = document.getElementById('high-score');
const statusText = document.getElementById('status-text');
const board = document.querySelector('.board');

highScoreDisplay.textContent = highScore;

// Web Audio API Setup (Synthesizes classic Simon tones)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const frequencies = {
  green: 329.63,  // E4
  red: 261.63,    // C4
  yellow: 220.00, // A3
  blue: 164.81    // E3
};

function playTone(color, duration = 300) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequencies[color], audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration / 1000);
}

function playErrorSound() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(110, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
}

// Visual + Audio Flash
function activatePad(color) {
  const pad = document.querySelector(`.pad.${color}`);
  pad.classList.add('active');
  playTone(color);

  setTimeout(() => {
    pad.classList.remove('active');
  }, 300);
}

// Game Logic
function startGame() {
  gameSequence = [];
  playerSequence = [];
  level = 0;
  startBtn.disabled = true;
  nextRound();
}

function nextRound() {
  level++;
  playerSequence = [];
  levelDisplay.textContent = level;
  statusText.textContent = 'Watch...';
  isComputerPlaying = true;

  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  gameSequence.push(randomColor);

  // Play the sequence with a delay between steps
  gameSequence.forEach((color, index) => {
    setTimeout(() => {
      activatePad(color);
      if (index === gameSequence.length - 1) {
        setTimeout(() => {
          isComputerPlaying = false;
          statusText.textContent = 'Your Turn';
        }, 400);
      }
    }, (index + 1) * 650);
  });
}

function handlePadClick(e) {
  if (isComputerPlaying || gameSequence.length === 0) return;

  const clickedColor = e.target.dataset.color;
  activatePad(clickedColor);
  playerSequence.push(clickedColor);

  const currentStep = playerSequence.length - 1;

  // Check if player made a mistake
  if (playerSequence[currentStep] !== gameSequence[currentStep]) {
    gameOver();
    return;
  }

  // Check if player completed the current sequence
  if (playerSequence.length === gameSequence.length) {
    isComputerPlaying = true;
    statusText.textContent = 'Good!';
    setTimeout(nextRound, 1000);
  }
}

function gameOver() {
  playErrorSound();
  board.classList.add('shake');
  statusText.textContent = 'Game Over!';
  startBtn.disabled = false;
  startBtn.textContent = 'RETRY';
  gameSequence = [];

  if (level - 1 > highScore) {
    highScore = level - 1;
    localStorage.setItem('simonHighScore', highScore);
    highScoreDisplay.textContent = highScore;
  }

  setTimeout(() => {
    board.classList.remove('shake');
  }, 400);
}

// Event Listeners
startBtn.addEventListener('click', startGame);
pads.forEach(pad => pad.addEventListener('click', handlePadClick));
