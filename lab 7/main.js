'use strict';

let level = 1,
    // timeToDuel = Math.floor(Math.random() * 1000) + 100,
    timeToDuel = 700,
    readyToDuel = 'false',
    time = 0,
    score = 0,
    gameMenu = document.querySelector('.game-menu'),
    startButton = document.querySelector('.button-start-game'),
    wrapper = document.querySelector('.wrapper'),
    gamePanels = document.querySelector('.game-panels'),
    timeGunman = document.querySelector('.time-panel__gunman'),
    timeYou = document.querySelector('.time-panel__you'),
    showLevel = document.querySelector('.score-panel__level'),
    message = document.querySelector('.message'),
    gameScreen = document.querySelector('.game-screen'),
    gunman = document.querySelector('.gunman'),
    restartButton = document.querySelector('.button-restart'),
    nextButton = document.querySelector('.button-next-level'),
    winScreen = document.querySelector('.win-screen'),
    sfxDeath = new Audio('sfx/sfx_death.m4a'),
    sfxFire = new Audio('sfx/sfx_fire.m4a'),
    sfxIntro = new Audio('sfx/sfx_intro.m4a'),
    sfxShot = new Audio('sfx/sfx_shot.m4a'),
    sfxWait = new Audio('sfx/sfx_wait.m4a'),
    sfxWin = new Audio('sfx/sfx_win.m4a');

startButton.addEventListener('click', startGame);
nextButton.addEventListener('click', nextLevel);
restartButton.addEventListener('click', restartGame)

// Функція початку гри
function startGame() {
    gameMenu.style.display = 'none';
    gamePanels.style.display = 'block';
    gameScreen.style.display = 'block';
    wrapper.style.display = 'block';
    timeGunman.innerHTML = (timeToDuel / 1000).toFixed(2);
    timeYou.innerHTML = (0).toFixed(2);
    score = +document.querySelector('.score-panel__score_num').innerHTML;
    showLevel.innerHTML = 'level: ' + level;
    gunman.classList.add('gunman-level-' + level);
    gunman.addEventListener('transitionend', prepareForDuel);
    setTimeout(function () {
        moveGunman();
    }, 500);
}

// Функція перезапуску гри
function restartGame() {
    sfxDeath.pause();
    restartButton.style.display = 'none';
    message.innerHTML = '';
    gameScreen.classList.remove('game-screen--death');
    message.classList.remove('message--dead');
    message.classList.remove('animated');
    message.classList.remove('zoomIn');
    gunman.classList.remove('gunman-level-' + level);
    gunman.classList.remove('gunman-level-' + level + '__standing');
    gunman.classList.remove('gunman-level-' + level + '__ready');
    gunman.classList.remove('gunman-level-' + level + '__shooting');
    setTimeout(function () {
        startGame();
    }, 1000);
}

// Функція яка запускає наступний рівень
function nextLevel() {
    if (level < 5) {
        nextButton.style.display = 'none';
        message.innerHTML = '';
        message.classList.remove('message--win');
        message.classList.remove('animated');
        message.classList.remove('zoomIn');
        gunman.classList.remove('gunman-level-' + level);
        gunman.classList.remove('gunman-level-' + level + '__standing');
        gunman.classList.remove('gunman-level-' + level + '__death');
        level++;
        timeToDuel = 700;
        timeToDuel = timeToDuel - (level * 100);
        startGame();
    } else {
        // level = Math.floor(Math.random() * 4) + 1;
        message.style.display = 'none';
        gameScreen.style.display = 'none';
        gamePanels.style.display = 'none';
        winScreen.style.display = 'block';
    }
}

// Функція яка відповідає за рух Gunman'а
function moveGunman() {
    setTimeout(function () {
        gunman.classList.add('moving');
        sfxIntro.play();
        sfxIntro.loop = true;
    }, 50);
}

// Функція яка відповідає за дії які передують початку дуелі
function prepareForDuel() {
    sfxIntro.pause();
    sfxWait.play();
    sfxWait.currentTime = 0;
    sfxWait.loop = true;
    gunman.classList.remove('moving');
    gunman.classList.add('standing');
    gunman.classList.add('gunman-level-' + level + '__standing');
    setTimeout(function () {
        sfxWait.pause();
        gunman.classList.add('gunman-level-' + level + '__ready');
        message.classList.add('message--fire');
        sfxFire.play();
        gunman.addEventListener('mousedown', playerShootsGunman);
        readyToDuel = true;
        timeCounter(new Date().getTime());
        setTimeout(gunmanShootsPlayer, timeToDuel);
    }, 1000);
}

// Функція для обрахування часу
function timeCounter(t) {
    let currTime;
    (function timeCompare() {
        currTime = new Date().getTime();
        if (readyToDuel) {
            time = ((currTime - t + 10) / 1000).toFixed(2);
            timeYou.innerHTML = time;
            setTimeout(timeCompare, 10);
        }
    })();
}

// Функція яка відповідає за ситуацію коли gunman стріляє в гравця
function gunmanShootsPlayer() {
    if (readyToDuel) {
        readyToDuel = false;
        gunman.classList.remove('standing');
        gunman.classList.add('gunman-level-' + level + '__shooting');
        setTimeout(function () {
            sfxShot.play();
            message.classList.remove('message--fire');
            gameScreen.classList.add('game-screen--death');
            message.classList.add('message--dead');
            message.classList.add('animated');
            message.classList.add('zoomIn');
            message.innerHTML = 'You are dead!';
        }, timeToDuel / 3);
        gunman.removeEventListener('mousedown', playerShootsGunman);
        setTimeout(function () {
            sfxDeath.play();
            restartButton.style.display = 'block';
        }, 1000);
    }
}

// Функція яка відповідає за ситуацію коли гравець стріляє в Gunman'а
function playerShootsGunman() {
    if (readyToDuel) {
        readyToDuel = false;
        sfxShot.play();
        message.classList.remove('message--fire');
        gunman.classList.remove('standing');
        gunman.classList.remove('gunman-level-' + level + '__shooting');
        gunman.classList.add('gunman-level-' + level + '__death');
        gunman.removeEventListener('mousedown', playerShootsGunman);
        sfxWin.play();
        setTimeout(function () {
            message.classList.add('message--win');
            message.classList.add('animated');
            message.classList.add('zoomIn');
            message.innerHTML = 'You Win!';
            scoreCount();
            nextButton.style.display = 'block';
        }, 1000);
    }
}

// Функія яка обрахування кількості очок
function scoreCount() {
    let scoreDiv = document.querySelector('.score-panel__score_num');
    let temp = +((+(timeToDuel / 1000) * 50 - +(+timeYou.innerHTML) * 100) * 100 * level).toFixed(0);
    (function count() {
        if (+scoreDiv.innerHTML - score < temp) {
            scoreDiv.innerHTML = +scoreDiv.innerHTML + 100;
            setTimeout(count, 10);
        }
    })();
}
