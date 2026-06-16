// js/ui.js
(function() {
  let elHpPlayerBar = null;
  let elHpBotBar = null;
  let elScorePlayer = null;
  let elScoreBot = null;
  let elRoundOverlay = null;
  let elRoundText = null;
  let elSvgLayer = null;
  let effects = [];
  let elShieldIcon1 = null;
  let elShieldTimer1 = null;
  let elShieldIcon2 = null;
  let elShieldTimer2 = null;

  function initUI(hpP, hpB, sP, sB, overlay, text, svg) {
    elHpPlayerBar = hpP;
    elHpBotBar = hpB;
    elScorePlayer = sP;
    elScoreBot = sB;
    elRoundOverlay = overlay;
    elRoundText = text;
    elSvgLayer = svg;
    elShieldIcon1 = document.getElementById('shield-icon-p1');
    elShieldTimer1 = document.getElementById('shield-timer-p1');
    elShieldIcon2 = document.getElementById('shield-icon-p2');
    elShieldTimer2 = document.getElementById('shield-timer-p2');
  }

  function updateHPBars(a, b) {
    if (elHpPlayerBar) elHpPlayerBar.style.width = (a.hp / a.maxHp * 100) + '%';
    if (elHpBotBar) elHpBotBar.style.width = (b.hp / b.maxHp * 100) + '%';
  }

  function updateScore(sp, sb) {
    if (elScorePlayer) elScorePlayer.textContent = sp;
    if (elScoreBot) elScoreBot.textContent = sb;
  }

  function showOverlay() { if (elRoundOverlay) elRoundOverlay.classList.add('show'); }
  function hideOverlay() { if (elRoundOverlay) elRoundOverlay.classList.remove('show'); }
  function setOverlayText(t) { if (elRoundText) elRoundText.textContent = t; }

  function updateShieldIcon(iconEl, timerEl, entity) {
    if (!iconEl || !timerEl) return;
    iconEl.classList.remove('ready', 'active', 'cooldown');
    if (entity.shieldTimer > 0) {
      iconEl.classList.add('active');
      timerEl.textContent = '';
    } else if (entity.shieldCooldown > 0) {
      iconEl.classList.add('cooldown');
      timerEl.textContent = Math.ceil(entity.shieldCooldown);
    } else {
      iconEl.classList.add('ready');
      timerEl.textContent = '';
    }
  }

  function updateShieldIcons(p1, p2) {
    updateShieldIcon(elShieldIcon1, elShieldTimer1, p1);
    updateShieldIcon(elShieldIcon2, elShieldTimer2, p2);
  }

  function createHitEffect(x, y, color) {
    if (!elSvgLayer) return;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '2');
    circle.setAttribute('fill', color);
    elSvgLayer.appendChild(circle);
    effects.push({ circle: circle, life: 1.0, maxR: 20 });
  }

  function updateEffects(dt) {
    for (let i = effects.length - 1; i >= 0; i--) {
      const e = effects[i];
      e.life -= dt * 0.05;
      const r = e.maxR * (1 - e.life);
      e.circle.setAttribute('r', r);
      e.circle.setAttribute('opacity', Math.max(0, e.life));
      if (e.life <= 0) {
        if (e.circle.parentNode) elSvgLayer.removeChild(e.circle);
        effects.splice(i, 1);
      }
    }
  }

  function clearEffects() {
    for (let i = 0; i < effects.length; i++) {
      if (effects[i].circle.parentNode) elSvgLayer.removeChild(effects[i].circle);
    }
    effects = [];
  }

  window.G = window.G || {};
  window.G.ui = {
    initUI, updateHPBars, updateScore,
    showOverlay, hideOverlay, setOverlayText,
    createHitEffect, updateEffects, clearEffects, updateShieldIcons
  };
})();