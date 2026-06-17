(function() {
  const MS = 3;
  const JP = -12;
  const GR = 0.6;
  const SD = 1.0;
  const SC = 5.0;

  function cp(x, f, c) {
    return {
      id: c, x: x, y: 380, vx: 0, vy: 0, w: 40, h: 60,
      hp: 100, maxHp: 100, onGround: false, facing: f,
      blocking: false, shootCooldown: 0, spawnX: x, spawnFacing: f,
      shieldTimer: 0, shieldCooldown: 0, jumpsLeft: 1, maxJumps: 1,
      regenTimer: 0
    };
  }

  const p1 = cp(100, 1, 'player1');
  const p2 = cp(660, -1, 'player2');
  let e1 = null, e2 = null, s1 = null, s2 = null;

  function initPlayer(a, b, c, d) { e1 = a; e2 = b; s1 = c; s2 = d; }

  function hasCard(playerId, cardId) {
    if (window.G.cards && window.G.cards.getPlayerCards) {
      const cards = window.G.cards.getPlayerCards(playerId);
      for (let i = 0; i < cards.length; i++) {
        if (cards[i].id === cardId) return true;
      }
    }
    return false;
  }

  function actS(en) {
    if (en.shieldCooldown <= 0 && en.shieldTimer <= 0) {
      en.shieldTimer = SD;
      window.G.audio.playBlock();
    }
  }

  function updE(en, dt, inp, el, shEl) {
    const speedMult = hasCard(en.id, 'speed') ? 1.3 : 1;
    const fastShield = hasCard(en.id, 'fastshield');
    const actualSC = fastShield ? 3.0 : SC;
    const doubleJump = hasCard(en.id, 'doublejump');
    en.maxJumps = doubleJump ? 2 : 1;

    let mx = 0;
    if (inp.isLeft()) mx -= 1;
    if (inp.isRight()) mx += 1;

    if (inp.isJumpJustPressed && inp.isJumpJustPressed()) {
      if (en.onGround) {
        en.vy = JP; en.onGround = false;
        en.jumpsLeft = en.maxJumps - 1;
        window.G.audio.playJump();
      } else if (en.jumpsLeft > 0) {
        en.vy = JP; en.jumpsLeft--;
        window.G.audio.playJump();
      }
    }

    if (inp.isShoot && inp.isShoot() && en.shootCooldown <= 0) {
      const bx = en.facing > 0 ? en.x + en.w : en.x - 8;
      const by = en.y + en.h / 2;
      if (hasCard(en.id, 'triple')) {
        window.G.bullet.createBullet(en.id, bx, by, en.facing, false);
        window.G.bullet.createBullet(en.id, bx, by - 8, en.facing, true);
        window.G.bullet.createBullet(en.id, bx, by + 8, en.facing, true);
      } else {
        window.G.bullet.createBullet(en.id, bx, by, en.facing, false);
      }
      en.shootCooldown = 25;
      window.G.audio.playShoot();
    }

    if (inp.isBlockPressed && inp.isBlockPressed()) actS(en);

    if (en.shieldTimer > 0) {
      en.shieldTimer -= dt / 60;
      if (en.shieldTimer <= 0) { en.shieldTimer = 0; en.shieldCooldown = actualSC; en.blocking = false; }
      else en.blocking = true;
    } else {
      en.blocking = false;
      if (en.shieldCooldown > 0) { en.shieldCooldown -= dt / 60; if (en.shieldCooldown < 0) en.shieldCooldown = 0; }
    }

    if (shEl) { shEl.classList.toggle('active', en.shieldTimer > 0); }

    if (mx !== 0) en.facing = mx;
    en.vx = mx * MS * speedMult * (en.blocking ? 0.3 : 1);
    en.vy += GR * dt;
    en.x += en.vx * dt;
    en.y += en.vy * dt;
    if (en.x < 0) en.x = 0;
    if (en.x + en.w > window.G.map.GAME_W) en.x = window.G.map.GAME_W - en.w;

    const wg = en.onGround;
    window.G.map.collide(en);
    if (en.onGround && !wg) en.jumpsLeft = en.maxJumps - 1;
    if (en.shootCooldown > 0) en.shootCooldown -= dt;

    // Регенерация
    if (hasCard(en.id, 'regen')) {
      en.regenTimer += dt / 60;
      if (en.regenTimer >= 180) { en.regenTimer = 0; en.hp = Math.min(en.maxHp, en.hp + 1); }
    } else { en.regenTimer = 0; }

    if (el) {
      el.style.left = en.x + 'px';
      el.style.top = en.y + 'px';
    }
  }

  function update(dt, i1, i2) {
    updE(p1, dt, i1, e1, s1);
    if (i2) updE(p2, dt, i2, e2, s2);
  }

  function reset() {
    [p1, p2].forEach(function(p) {
      p.x = p.spawnX; p.y = 380; p.vx = 0; p.vy = 0;
      p.hp = p.maxHp; p.blocking = false; p.shootCooldown = 0;
      p.facing = p.spawnFacing; p.onGround = false;
      p.shieldTimer = 0; p.shieldCooldown = 0;
      p.jumpsLeft = 1; p.maxJumps = 1; p.regenTimer = 0;
    });
  }

  function getPlayers() { return { p1, p2 }; }

  window.G = window.G || {};
  window.G.player = { initPlayer, update, reset, getPlayers };
})();