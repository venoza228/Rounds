(function() {
  const SPD = 8;
  const DMG = 10;
  const W = 800;
  const H = 500;
  let bullets = [];
  let mines = [];
  let svg = null;

  function initBullets(s) { svg = s; }

  function createBullet(o, x, y, d, m) {
    const vx = d * SPD;
    const vy = m ? (Math.random() - 0.5) * 4 : 0;
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', x + 4); c.setAttribute('cy', y + 4); c.setAttribute('r', '4');
    c.setAttribute('fill', o === 'player1' ? '#5dade2' : '#f1948a');
    svg.appendChild(c);
    bullets.push({ x, y, vx, vy, o, c, bounced: false });
  }

  function createMine(o, x, y) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    c.setAttribute('x', x); c.setAttribute('y', y); c.setAttribute('width', '12'); c.setAttribute('height', '12');
    c.setAttribute('fill', o === 'player1' ? '#ff0' : '#f0f');
    svg.appendChild(c);
    mines.push({ x, y, w: 12, h: 12, o, c });
  }

  function hasCard(playerId, cardId) {
    if (window.G.cards && window.G.cards.getPlayerCards) {
      const cards = window.G.cards.getPlayerCards(playerId);
      for (let i = 0; i < cards.length; i++) { if (cards[i].id === cardId) return true; }
    }
    return false;
  }

  function hit(b, t) { return b.x > t.x && b.x < t.x + t.w && b.y > t.y && b.y < t.y + t.h; }

  function updateBullets(dt, fighters) {
    // Пули
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.c.setAttribute('cx', b.x + 4);
      b.c.setAttribute('cy', b.y + 4);

      // Самонаводка
      if (hasCard(b.o, 'homing')) {
        const target = b.o === 'player1' ? fighters.find(f => f.id === 'player2') : fighters.find(f => f.id === 'player1');
        if (target) {
          const dx = target.x + target.w/2 - b.x;
          const dy = target.y + target.h/2 - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist > 0) { b.vx += dx/dist * 0.3; b.vy += dy/dist * 0.3; }
        }
      }

      // Гравитационный колодец — притягивает врага
      if (hasCard(b.o, 'gravity')) {
        const target = b.o === 'player1' ? fighters.find(f => f.id === 'player2') : fighters.find(f => f.id === 'player1');
        if (target && Math.abs(b.x - target.x) < 80 && Math.abs(b.y - target.y) < 80) {
          target.x += (b.x - target.x) * 0.02 * dt;
          target.y += (b.y - target.y) * 0.02 * dt;
        }
      }

      // Отскок от стен
      if (hasCard(b.o, 'bounce') && !b.bounced) {
        if (b.x < 0 || b.x > W) { b.vx *= -1; b.bounced = true; }
        if (b.y < 0 || b.y > H) { b.vy *= -1; b.bounced = true; }
      }

      let rem = b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20;

      for (let f = 0; f < fighters.length; f++) {
        const t = fighters[f];
        if (rem || t.id === b.o) continue;
        if (hit(b, t)) {
          const sh = t.shieldTimer > 0;
          if (sh) {
            window.G.ui.createHitEffect(b.x, b.y, '#00ffff');
            window.G.audio.playBlock();
            if (hasCard(t.id, 'spikes')) {
              const attacker = fighters.find(ff => ff.id === b.o);
              if (attacker) { attacker.hp -= 5; if (attacker.hp < 0) attacker.hp = 0; }
            }
          } else {
            let dmg = DMG;
            if (hasCard(b.o, 'heavy')) dmg += 5;
            if (hasCard(b.o, 'berserk')) {
              const shooter = fighters.find(ff => ff.id === b.o);
              if (shooter && shooter.hp < shooter.maxHp * 0.3) dmg = Math.floor(dmg * 1.5);
            }
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
            if (hasCard(b.o, 'poison')) t.poisonTimer = 180;
            // Заморозка
            if (hasCard(b.o, 'freeze') && !t.freezeTimer) {
              t.freezeTimer = 60; // 1 секунда
            }
            // Взрывная пуля
            if (hasCard(b.o, 'explosive')) {
              for (let ff = 0; ff < fighters.length; ff++) {
                const ft = fighters[ff];
                if (ft.id !== b.o && Math.abs(ft.x - b.x) < 50 && Math.abs(ft.y - b.y) < 50) {
                  ft.hp -= 5; if (ft.hp < 0) ft.hp = 0;
                  window.G.ui.createHitEffect(ft.x + ft.w/2, ft.y + ft.h/2, '#ff0');
                }
              }
            }
          }
          rem = true;
          break;
        }
      }

      if (rem) {
        if (b.c.parentNode) svg.removeChild(b.c);
        bullets.splice(i, 1);
      }
    }

    // Мины
    for (let i = mines.length - 1; i >= 0; i--) {
      const m = mines[i];
      for (let f = 0; f < fighters.length; f++) {
        const t = fighters[f];
        if (t.id !== m.o && hit(m, t)) {
          t.hp -= 15; if (t.hp < 0) t.hp = 0;
          window.G.ui.createHitEffect(m.x, m.y, '#ff0');
          window.G.audio.playHit();
          if (m.c.parentNode) svg.removeChild(m.c);
          mines.splice(i, 1);
          break;
        }
      }
    }

    // Яд
    for (let f = 0; f < fighters.length; f++) {
      const t = fighters[f];
      if (t.poisonTimer > 0) {
        t.poisonTimer -= dt;
        if (Math.floor(t.poisonTimer) % 60 === 0) {
          t.hp -= 2; if (t.hp < 0) t.hp = 0;
        }
      }
    }
  }

  function clearBullets() {
    for (let i = 0; i < bullets.length; i++) { if (bullets[i].c.parentNode) svg.removeChild(bullets[i].c); }
    for (let i = 0; i < mines.length; i++) { if (mines[i].c.parentNode) svg.removeChild(mines[i].c); }
    bullets = []; mines = [];
  }

  window.G = window.G || {};
  window.G.bullet = { initBullets, createBullet, createMine, updateBullets, clearBullets };
})();