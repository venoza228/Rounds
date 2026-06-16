// js/bullet.js
(function() {
  const BULLET_SPEED = 8;
  const DAMAGE = 10;
  const DAMAGE_BLOCK = 5;
  const GAME_W = 800;
  const GAME_H = 500;

  let bullets = [];
  let elSvgLayer = null;

  function initBullets(svg) { elSvgLayer = svg; }

  function createBullet(owner, x, y, dir, miss) {
    const vx = dir * BULLET_SPEED;
    const vy = miss ? (Math.random() - 0.5) * 6 : 0;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x + 4);
    circle.setAttribute('cy', y + 4);
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', owner === 'player1' ? '#5dade2' : '#f1948a');

    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glow.setAttribute('cx', x + 4);
    glow.setAttribute('cy', y + 4);
    glow.setAttribute('r', '6');
    glow.setAttribute('fill', 'none');
    glow.setAttribute('stroke', owner === 'player1' ? '#5dade2' : '#f1948a');
    glow.setAttribute('stroke-width', '2');
    glow.setAttribute('opacity', '0.5');

    elSvgLayer.appendChild(glow);
    elSvgLayer.appendChild(circle);
    bullets.push({ x: x, y: y, vx: vx, vy: vy, owner: owner, circle: circle, glow: glow });
  }

  function checkHit(b, target) {
    return b.x > target.x && b.x < target.x + target.w &&
           b.y > target.y && b.y < target.y + target.h;
  }

  function checkShieldHit(b, target) {
    return b.x > target.x - 15 && b.x < target.x + target.w + 15 &&
           b.y > target.y - 10 && b.y < target.y + target.h + 10;
  }

  function updateBullets(dt, fighters) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.circle.setAttribute('cx', b.x + 4);
      b.circle.setAttribute('cy', b.y + 4);
      b.glow.setAttribute('cx', b.x + 4);
      b.glow.setAttribute('cy', b.y + 4);

      let remove = b.x < -10 || b.x > GAME_W + 10 || b.y < -10 || b.y > GAME_H + 10;

      for (let f = 0; f < fighters.length; f++) {
        const target = fighters[f];
        if (remove || target.id === b.owner) continue;
        if (!target.blocking && checkHit(b, target)) {
          target.hp -= DAMAGE;
          if (target.hp < 0) target.hp = 0;
          window.G.ui.createHitEffect(b.x, b.y, b.owner === 'player1' ? '#5dade2' : '#f1948a');
          window.G.audio.playHit();
          remove = true;
        } else if (target.blocking && checkShieldHit(b, target)) {
          target.hp -= DAMAGE_BLOCK;
          if (target.hp < 0) target.hp = 0;
          window.G.ui.createHitEffect(b.x, b.y, '#00ffff');
          window.G.audio.playBlock();
          remove = true;
        }
      }

      if (remove) {
        if (b.circle.parentNode) elSvgLayer.removeChild(b.circle);
        if (b.glow.parentNode) elSvgLayer.removeChild(b.glow);
        bullets.splice(i, 1);
      }
    }
  }

  function clearBullets() {
    for (let i = 0; i < bullets.length; i++) {
      if (bullets[i].circle.parentNode) elSvgLayer.removeChild(bullets[i].circle);
      if (bullets[i].glow.parentNode) elSvgLayer.removeChild(bullets[i].glow);
    }
    bullets = [];
  }

  window.G = window.G || {};
  window.G.bullet = { initBullets, createBullet, updateBullets, clearBullets };
})();