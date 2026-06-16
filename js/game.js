// js/game.js
(function() {
  const WINS_TO_WIN = 3;
  const TARGET_FPS = 60;
  const FRAME_TIME = 1000 / TARGET_FPS;

  const state = {
    mode: 'bot',
    mapIndex: 0,
    scoreP1: 0,
    scoreP2: 0,
    running: false,
    lastTime: 0
  };

  let langData = null;
  let currentLang = 'ru';
  let onMatchEnd = null;

  function initGame(lang, langCode) {
    langData = lang;
    currentLang = langCode;
  }

  function setMatchEndCallback(cb) { onMatchEnd = cb; }

  function setMatchConfig(mode, mapIndex) {
    state.mode = mode;
    state.mapIndex = mapIndex;
  }

  function gameLoop(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const elapsed = timestamp - state.lastTime;

    if (elapsed >= FRAME_TIME) {
      const dt = elapsed / FRAME_TIME;
      if (state.running) {
        const players = window.G.player.getPlayers();

        if (state.mode === 'bot') {
          window.G.player.update(dt, window.G.input.input1, null);
          window.G.bot.update(dt, players.p1);
          window.G.bullet.updateBullets(dt, [players.p1, window.G.bot.getBot()]);
          window.G.ui.updateHPBars(players.p1, window.G.bot.getBot());
          window.G.ui.updateShieldIcons(players.p1, window.G.bot.getBot());
        } else {
          window.G.player.update(dt, window.G.input.input1, window.G.input.input2);
          window.G.bullet.updateBullets(dt, [players.p1, players.p2]);
          window.G.ui.updateHPBars(players.p1, players.p2);
          window.G.ui.updateShieldIcons(players.p1, players.p2);
        }

        window.G.ui.updateEffects(dt);
        window.G.input.clearJustPressed();
        checkRoundEnd();
      }
      state.lastTime = timestamp - (elapsed % FRAME_TIME);
    }

    requestAnimationFrame(gameLoop);
  }

  function checkRoundEnd() {
    const players = window.G.player.getPlayers();
    let p1hp, p2hp;
    if (state.mode === 'bot') {
      p1hp = players.p1.hp;
      p2hp = window.G.bot.getBot().hp;
    } else {
      p1hp = players.p1.hp;
      p2hp = players.p2.hp;
    }

    if (p1hp <= 0 || p2hp <= 0) {
      if (p1hp > 0) state.scoreP1++;
      else state.scoreP2++;
      endRound(p1hp > 0);
    }
  }

  function endRound(p1Won) {
    state.running = false;
    window.G.ui.updateScore(state.scoreP1, state.scoreP2);
    const t = langData[currentLang];

    if (state.scoreP1 >= WINS_TO_WIN || state.scoreP2 >= WINS_TO_WIN) {
      let resultText;
      if (state.scoreP1 >= WINS_TO_WIN) {
        resultText = state.mode === 'bot' ? t.playerWins : t.p1Wins;
        window.G.audio.playWin();
      } else {
        resultText = state.mode === 'bot' ? t.botWins : t.p2Wins;
        window.G.audio.playLose();
      }
      window.G.ui.setOverlayText(resultText);
      window.G.ui.showOverlay();
      setTimeout(function() {
        window.G.ui.hideOverlay();
        if (onMatchEnd) onMatchEnd();
      }, 2500);
      return;
    }

    if (p1Won) window.G.audio.playWin();
    else window.G.audio.playLose();
    window.G.ui.setOverlayText(t.roundStart);
    window.G.ui.showOverlay();
    window.G.audio.playRoundStart();

    setTimeout(function() {
      window.G.ui.hideOverlay();
      startNewRound();
    }, 1500);
  }

  function startNewRound() {
    window.G.player.reset();
    if (state.mode === 'bot') window.G.bot.resetBot();
    window.G.bullet.clearBullets();
    window.G.ui.clearEffects();
    const players = window.G.player.getPlayers();
    const p2 = state.mode === 'bot' ? window.G.bot.getBot() : players.p2;
    window.G.ui.updateHPBars(players.p1, p2);
    window.G.ui.updateShieldIcons(players.p1, p2);
    state.running = true;
  }

  function startMatch() {
    state.scoreP1 = 0;
    state.scoreP2 = 0;
    window.G.ui.updateScore(0, 0);
    window.G.map.setMap(state.mapIndex);

    const elBot = document.getElementById('bot');
    const elShieldIcon2 = document.getElementById('shield-icon-p2');
    
    // Оба персонажа всегда видимы
    elBot.classList.remove('hidden');
    if (elShieldIcon2) elShieldIcon2.style.display = 'flex';

    startNewRound();
  }

  function init() {
    requestAnimationFrame(gameLoop);
  }

  window.G = window.G || {};
  window.G.game = { initGame, init, setMatchConfig, setMatchEndCallback, startMatch };
})();