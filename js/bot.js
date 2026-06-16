// js/bot.js
(function() {
  const MOVE_SPEED = 3;
  const JUMP_POWER = -12;
  const GRAVITY = 0.6;
  const SHIELD_DURATION = 1.0;
  const SHIELD_COOLDOWN = 5.0;

  const bot = {
    id: 'player2',
    x: 660, y: 380, vx: 0, vy: 0,
    w: 40, h: 60,
    hp: 100, maxHp: 100,
    onGround: false, facing: -1,
    blocking: false, shootCooldown: 60,
    aiTimer: 0, aiState: 'approach',
    shieldTimer: 0, shieldCooldown: 0
  };

  let elBot = null;
  let elShield = null;

  function initBot(el, shieldEl) {
    elBot = el;
    elShield = shieldEl;
  }

  function update(dt, target) {
    const dx = target.x - bot.x;
    const dist = Math.abs(dx);
    bot.facing = dx > 0 ? 1 : -1;

    bot.aiTimer -= dt;
    if (bot.aiTimer <= 0) {
      bot.aiTimer = 30 + Math.floor(Math.random() * 40);
      const roll = Math.random();
      if (dist < 150) {
        bot.aiState = roll < 0.15 ? 'block' : roll < 0.35 ? 'retreat' : 'attack';
      } else {
        bot.aiState = roll < 0.7 ? 'approach' : 'jump';
      }
    }

    let moveX = 0;

    if (bot.aiState === 'approach') {
      moveX = dx > 0 ? 1 : -1;
    } else if (bot.aiState === 'retreat') {
      moveX = dx > 0 ? -1 : 1;
    } else if (bot.aiState === 'attack') {
      moveX = dx > 0 ? 1 : -1;
      if (dist < 250) moveX *= 0.3;
    } else if (bot.aiState === 'block') {
      // Активация щита если готов
      if (bot.shieldCooldown <= 0 && bot.shieldTimer <= 0) {
        bot.shieldTimer = SHIELD_DURATION;
        window.G.audio.playBlock();
      }
    } else if (bot.aiState === 'jump') {
      moveX = dx > 0 ? 1 : -1;
      if (bot.onGround && Math.random() < 0.3) {
        bot.vy = JUMP_POWER;
        bot.onGround = false;
      }
    }

    // Таймер щита
    if (bot.shieldTimer > 0) {
      bot.shieldTimer -= dt;
      bot.blocking = true;
      if (bot.shieldTimer <= 0) {
        bot.shieldTimer = 0;
        bot.shieldCooldown = SHIELD_COOLDOWN;
        bot.blocking = false;
      }
    } else {
      bot.blocking = false;
      if (bot.shieldCooldown > 0) {
        bot.shieldCooldown -= dt;
        if (bot.shieldCooldown < 0) bot.shieldCooldown = 0;
      }
    }

    if (elShield) {
      if (bot.blocking) elShield.classList.add('active');
      else elShield.classList.remove('active');
    }

    bot.shootCooldown -= dt;
    if (bot.shootCooldown <= 0 && dist < 500 && Math.random() < 0.05) {
      const bx = bot.facing > 0 ? bot.x + bot.w : bot.x - 8;
      const by = bot.y + bot.h / 2;
      window.G.bullet.createBullet('player2', bx, by, bot.facing, Math.random() < 0.4);
      bot.shootCooldown = 60 + Math.floor(Math.random() * 40);
      window.G.audio.playShoot();
    }

    bot.vx = moveX * MOVE_SPEED * 0.85 * (bot.blocking ? 0.3 : 1);
    bot.vy += GRAVITY * dt;
    bot.x += bot.vx * dt;
    bot.y += bot.vy * dt;

    if (bot.x < 0) bot.x = 0;
    if (bot.x + bot.w > window.G.map.GAME_W) bot.x = window.G.map.GAME_W - bot.w;

    window.G.map.collidePlatforms(bot);
    if (elBot) {
      elBot.style.left = bot.x + 'px';
      elBot.style.top = bot.y + 'px';
    }
  }

  function resetBot() {
    bot.x = 660; bot.y = 380;
    bot.vx = 0; bot.vy = 0;
    bot.hp = bot.maxHp;
    bot.blocking = false;
    bot.shootCooldown = 60;
    bot.facing = -1;
    bot.aiTimer = 0;
    bot.aiState = 'approach';
    bot.onGround = false;
    bot.shieldTimer = 0;
    bot.shieldCooldown = 0;
  }

  function getBot() { return bot; }

  window.G = window.G || {};
  window.G.bot = { initBot, update, resetBot, getBot };
})();