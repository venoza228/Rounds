// js/player.js
(function() {
  const MOVE_SPEED = 3;
  const JUMP_POWER = -12;
  const GRAVITY = 0.6;
  const SHIELD_DURATION = 1.0;
  const SHIELD_COOLDOWN = 5.0;

  function createPlayer(x, facing, color) {
    return {
      id: color,
      x: x, y: 380, vx: 0, vy: 0,
      w: 40, h: 60,
      hp: 100, maxHp: 100,
      onGround: false,
      facing: facing,
      blocking: false,
      shootCooldown: 0,
      spawnX: x,
      spawnFacing: facing,
      shieldTimer: 0,
      shieldCooldown: 0
    };
  }

  const player1 = createPlayer(100, 1, 'player1');
  const player2 = createPlayer(660, -1, 'player2');

  let elP1 = null;
  let elP2 = null;
  let elShield1 = null;
  let elShield2 = null;

  function initPlayer(el1, el2, shield1, shield2) {
    elP1 = el1;
    elP2 = el2;
    elShield1 = shield1;
    elShield2 = shield2;
  }

  function activateShield(entity) {
    if (entity.shieldCooldown <= 0 && entity.shieldTimer <= 0) {
      entity.shieldTimer = SHIELD_DURATION;
      window.G.audio.playBlock();
    }
  }

  function updateEntity(entity, dt, input, el, shieldEl) {
    let moveX = 0;
    if (input.isLeft()) moveX -= 1;
    if (input.isRight()) moveX += 1;

    if (input.isJump() && entity.onGround) {
      entity.vy = JUMP_POWER;
      entity.onGround = false;
      window.G.audio.playJump();
    }

    if (input.isShoot()) {
      if (entity.shootCooldown <= 0) {
        const bx = entity.facing > 0 ? entity.x + entity.w : entity.x - 8;
        const by = entity.y + entity.h / 2;
        window.G.bullet.createBullet(entity.id, bx, by, entity.facing, false);
        entity.shootCooldown = 25;
        window.G.audio.playShoot();
      }
    }

    if (input.isBlockPressed()) {
      activateShield(entity);
    }

    // Таймер щита
    if (entity.shieldTimer > 0) {
      entity.shieldTimer -= dt;
      entity.blocking = true;
      if (entity.shieldTimer <= 0) {
        entity.shieldTimer = 0;
        entity.shieldCooldown = SHIELD_COOLDOWN;
        entity.blocking = false;
      }
    } else {
      entity.blocking = false;
      if (entity.shieldCooldown > 0) {
        entity.shieldCooldown -= dt;
        if (entity.shieldCooldown < 0) entity.shieldCooldown = 0;
      }
    }

    if (shieldEl) {
      if (entity.blocking) shieldEl.classList.add('active');
      else shieldEl.classList.remove('active');
    }

    if (moveX !== 0) entity.facing = moveX;

    entity.vx = moveX * MOVE_SPEED * (entity.blocking ? 0.3 : 1);
    entity.vy += GRAVITY * dt;
    entity.x += entity.vx * dt;
    entity.y += entity.vy * dt;

    if (entity.x < 0) entity.x = 0;
    if (entity.x + entity.w > window.G.map.GAME_W) entity.x = window.G.map.GAME_W - entity.w;

    window.G.map.collidePlatforms(entity);
    if (entity.shootCooldown > 0) entity.shootCooldown -= dt;

    if (el) {
      el.style.left = entity.x + 'px';
      el.style.top = entity.y + 'px';
    }
  }

  function update(dt, input1, input2) {
    updateEntity(player1, dt, input1, elP1, elShield1);
    if (input2) updateEntity(player2, dt, input2, elP2, elShield2);
  }

  function reset() {
    player1.x = player1.spawnX;
    player1.y = 380;
    player1.vx = 0; player1.vy = 0;
    player1.hp = player1.maxHp;
    player1.blocking = false;
    player1.shootCooldown = 0;
    player1.facing = player1.spawnFacing;
    player1.onGround = false;
    player1.shieldTimer = 0;
    player1.shieldCooldown = 0;

    player2.x = player2.spawnX;
    player2.y = 380;
    player2.vx = 0; player2.vy = 0;
    player2.hp = player2.maxHp;
    player2.blocking = false;
    player2.shootCooldown = 0;
    player2.facing = player2.spawnFacing;
    player2.onGround = false;
    player2.shieldTimer = 0;
    player2.shieldCooldown = 0;
  }

  function getPlayers() { return { p1: player1, p2: player2 }; }

  window.G = window.G || {};
  window.G.player = { initPlayer, update, reset, getPlayers };
})();