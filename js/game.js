(function() {
  const WTW = 10;
  const FPS = 60;
  const FT = 1000 / FPS;

  const st = {
    mode: 'bot',
    mapIdx: 0,
    s1: 0,
    s2: 0,
    run: false,
    lt: 0
  };

  let lang = null;
  let clang = 'ru';
  let onEnd = null;

  function initGame(l, c) { lang = l; clang = c; }
  function setMatchEndCallback(cb) { onEnd = cb; }
  function setMatchConfig(m, i) { st.mode = m; st.mapIdx = i; }

  function loop(ts) {
    if (!st.lt) st.lt = ts;
    const el = ts - st.lt;

    if (el >= FT) {
      const dt = el / FT;

      if (st.run) {
        const pl = window.G.player.getPlayers();

        if (st.mode === 'bot') {
          window.G.player.update(dt, window.G.input.input1, null);
          window.G.bot.update(dt, pl.p1);
          window.G.bullet.updateBullets(dt, [pl.p1, window.G.bot.getBot()]);
          window.G.ui.updateHPBars(pl.p1, window.G.bot.getBot());
          window.G.ui.updateShieldIcons(pl.p1, window.G.bot.getBot());
        } else {
          window.G.player.update(dt, window.G.input.input1, window.G.input.input2);
          window.G.bullet.updateBullets(dt, [pl.p1, pl.p2]);
          window.G.ui.updateHPBars(pl.p1, pl.p2);
          window.G.ui.updateShieldIcons(pl.p1, pl.p2);
        }

        window.G.ui.updateEffects(dt);
        window.G.input.clearJustPressed();
        checkEnd();
      }

      st.lt = ts - (el % FT);
    }

    requestAnimationFrame(loop);
  }

  function checkEnd() {
    const pl = window.G.player.getPlayers();
    let h1, h2;
    if (st.mode === 'bot') {
      h1 = pl.p1.hp;
      h2 = window.G.bot.getBot().hp;
    } else {
      h1 = pl.p1.hp;
      h2 = pl.p2.hp;
    }

    if (h1 <= 0 || h2 <= 0) {
      st.run = false;
      const p1w = h1 > 0;
      if (p1w) st.s1++;
      else st.s2++;
      const loserId = p1w ? 'player2' : 'player1';
      window.G.ui.updateScore(st.s1, st.s2);

      // Бот умер — бот получает случайную карточку мгновенно
      if (st.mode === 'bot' && loserId === 'player2') {
        if (window.G.cards && window.G.cards.pickRandomCard) {
          window.G.cards.pickRandomCard('player2');
        }
        endRound(p1w);
      }
      // Игрок умер в режиме с ботом — показываем выбор карточек
      else if (st.mode === 'bot' && loserId === 'player1') {
        if (window.G.cards && window.G.cards.showCards) {
          window.G.cards.showCards('player1', function() {
            endRound(p1w);
          });
        } else {
          endRound(p1w);
        }
      }
      // Локальный режим — показываем проигравшему выбор карточек
      else {
        if (window.G.cards && window.G.cards.showCards) {
          window.G.cards.showCards(loserId, function() {
            endRound(p1w);
          });
        } else {
          endRound(p1w);
        }
      }
    }
  }

  function endRound(p1w) {
    const t = lang[clang];

    if (st.s1 >= WTW || st.s2 >= WTW) {
      let txt;
      if (st.s1 >= WTW) {
        txt = st.mode === 'bot' ? t.playerWins : t.p1Wins;
        window.G.audio.playWin();
      } else {
        txt = st.mode === 'bot' ? t.botWins : t.p2Wins;
        window.G.audio.playLose();
      }

      window.G.ui.setOverlayText(txt);
      window.G.ui.showOverlay();

      if (window.G.cards && window.G.cards.resetAllCards) {
        window.G.cards.resetAllCards();
      }

      setTimeout(function() {
        window.G.ui.hideOverlay();
        if (onEnd) onEnd();
      }, 2500);
      return;
    }

    if (p1w) window.G.audio.playWin();
    else window.G.audio.playLose();

    window.G.ui.setOverlayText(t.roundStart + ' (' + (st.s1 + st.s2 + 1) + '/' + WTW + ')');
    window.G.ui.showOverlay();
    window.G.audio.playRoundStart();

    setTimeout(function() {
      window.G.ui.hideOverlay();
      newRound();
    }, 1500);
  }

  function newRound() {
    window.G.player.reset();
    if (st.mode === 'bot') window.G.bot.resetBot();
    window.G.bullet.clearBullets();
    window.G.ui.clearEffects();

    const pl = window.G.player.getPlayers();
    const p2 = st.mode === 'bot' ? window.G.bot.getBot() : pl.p2;
    window.G.ui.updateHPBars(pl.p1, p2);
    window.G.ui.updateShieldIcons(pl.p1, p2);

    st.run = true;
  }

  function startMatch() {
    st.s1 = 0;
    st.s2 = 0;
    window.G.ui.updateScore(0, 0);
    window.G.map.setMap(st.mapIdx);

    document.getElementById('bot').style.display = 'block';
    document.getElementById('shield-icon-p2').style.display = 'flex';

    newRound();
  }

  function init() {
    requestAnimationFrame(loop);
  }

  window.G = window.G || {};
  window.G.game = {
    initGame: initGame,
    init: init,
    setMatchConfig: setMatchConfig,
    setMatchEndCallback: setMatchEndCallback,
    startMatch: startMatch
  };
})();