(function() {
  const SPD = 8;
  const DMG = 10;
  const W = 800;
  const H = 500;
  let bullets = [];
  let svg = null;

  function initBullets(s) { svg = s; }

  function createBullet(o, x, y, d, m) {
    const vx = d * SPD;
    const vy = m ? (Math.random() - 0.5) * 6 : 0;
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', x + 4); c.setAttribute('cy', y + 4); c.setAttribute('r', '4');
    c.setAttribute('fill', o === 'player1' ? '#5dade2' : '#f1948a');
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    g.setAttribute('cx', x + 4); g.setAttribute('cy', y + 4); g.setAttribute('r', '6');
    g.setAttribute('fill', 'none'); g.setAttribute('stroke', o === 'player1' ? '#5dade2' : '#f1948a');
    g.setAttribute('stroke-width', '2'); g.setAttribute('opacity', '0.5');
    svg.appendChild(g); svg.appendChild(c);
    bullets.push({ x: x, y: y, vx: vx, vy: vy, o: o, c: c, g: g });
  }

  function hasCard(playerId, cardId) {
    if (window.G.cards && window.G.cards.getPlayerCards) {
      const cards = window.G.cards.getPlayerCards(playerId);
      for (let i = 0; i < cards.length; i++) {
        if (cards[i].id === cardId) return true;
      }
    }
    return false;
  }

  function hit(b, t) { return b.x > t.x && b.x < t.x + t.w && b.y > t.y && b.y < t.y + t.h; }

  function updateBullets(dt, fighters) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * dt; b.y += b.vy * dt;
      b.c.setAttribute('cx', b.x + 4); b.c.setAttribute('cy', b.y + 4);
      b.g.setAttribute('cx', b.x + 4); b.g.setAttribute('cy', b.y + 4);
      let rem = b.x < -10 || b.x > W + 10 || b.y < -10 || b.y > H + 10;

      for (let f = 0; f < fighters.length; f++) {
        const t = fighters[f];
        if (rem || t.id === b.o) continue;
        if (hit(b, t)) {
          const sh = t.shieldTimer > 0;
          if (sh) {
            window.G.ui.createHitEffect(b.x, b.y, '#00ffff');
            window.G.audio.playBlock();
            // Щит-шипы
            if (hasCard(t.id, 'spikes')) {
              const attacker = fighters.find(ff => ff.id === b.o);
              if (attacker) { attacker.hp -= 5; if (attacker.hp < 0) attacker.hp = 0; }
            }
          } else {
            let dmg = DMG;
            // Тяжёлая пуля
            if (hasCard(b.o, 'heavy')) dmg += 5;
            // Берсерк
            if (hasCard(b.o, 'berserk')) {
              const shooter = fighters.find(ff => ff.id === b.o);
              if (shooter && shooter.hp < shooter.maxHp * 0.3) dmg = Math.floor(dmg * 1.5);
            }
            // Толстая кожа
            if (hasCard(t.id, 'thickskin')) dmg = Math.floor(dmg * 0.8);
            t.hp -= dmg;
            if (t.hp < 0) t.hp = 0;
            window.G.ui.createHitEffect(b.x, b.y, b.o === 'player1' ? '#5dade2' : '#f1948a');
            window.G.audio.playHit();
            // Вампиризм
            if (hasCard(b.o, 'vampire')) {
              const shooter = fighters.find(ff => ff.id === b.o);
              if (shooter) shooter.hp = Math.min(shooter.maxHp, shooter.hp + 3);
            }
            // Ядовитые пули
            if (hasCard(b.o, 'poison')) {
              if (!t.poisonTimer) t.poisonTimer = 0;
              t.poisonTimer = 180;
            }
            // Заморозка
            if (hasCard(b.o, 'freeze')) {
              if (!t.freezeTimer) t.freezeTimer = 0;
              t.freezeTimer = 60;
            }
          }
          rem = true;
          break;
        }
      }
      if (rem) {
        if (b.c.parentNode) svg.removeChild(b.c);
        if (b.g.parentNode) svg.removeChild(b.g);
        bullets.splice(i, 1);
      }
    }

    // Яд и заморозка
    for (let f = 0; f < fighters.length; f++) {
      const t = fighters[f];
      if (t.poisonTimer > 0) {
        t.poisonTimer -= dt;
        if (Math.floor(t.poisonTimer) % 60 === 0) { t.hp -= 2; if (t.hp < 0) t.hp = 0; }
      }
      if (t.freezeTimer > 0) {
        t.freezeTimer -= dt;
        t.vx = 0;
        if (t.freezeTimer < 0) t.freezeTimer = 0;
      }
    }
  }

  function clearBullets() {
    for (let i = 0; i < bullets.length; i++) {
      if (bullets[i].c.parentNode) svg.removeChild(bullets[i].c);
      if (bullets[i].g.parentNode) svg.removeChild(bullets[i].g);
    }
    bullets = [];
  }

  window.G = window.G || {};
  window.G.bullet = { initBullets, createBullet, updateBullets, clearBullets };
})();