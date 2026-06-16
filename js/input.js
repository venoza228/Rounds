// js/input.js
(function() {
  const keys = {};
  const justPressed = {};

  const joy = {
    left: { active: false, dx: 0, dy: 0, tapStart: 0, startX: 0, startY: 0, el: null, knob: null, blockTriggered: false },
    right: { active: false, dx: 0, dy: 0, tapStart: 0, startX: 0, startY: 0, el: null, knob: null, blockTriggered: false }
  };

  const tapCallbacks = { left: null, right: null };

  function initInput() {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  }

  function onKeyDown(e) {
    const key = e.key.toLowerCase();
    if (!keys[key]) {
      justPressed[key] = true;
    }
    keys[key] = true;
    if (key === 'escape') {
      document.dispatchEvent(new CustomEvent('toggleSettings'));
    }
  }

  function onKeyUp(e) {
    keys[e.key.toLowerCase()] = false;
  }

  function clearJustPressed() {
    for (const key in justPressed) {
      delete justPressed[key];
    }
  }

  function setupJoystick(side, el, knob, tapCb) {
    joy[side].el = el;
    joy[side].knob = knob;
    tapCallbacks[side] = tapCb;

    el.addEventListener('touchstart', function(e) { onJoyStart(e, side); }, { passive: false });
    el.addEventListener('touchmove', function(e) { onJoyMove(e, side); }, { passive: false });
    el.addEventListener('touchend', function(e) { onJoyEnd(e, side); }, { passive: false });
    el.addEventListener('mousedown', function(e) { onJoyStart(e, side); });
    document.addEventListener('mousemove', function(e) { onJoyMove(e, side); });
    document.addEventListener('mouseup', function(e) { onJoyEnd(e, side); });
  }

  function onJoyStart(e, side) {
    e.preventDefault();
    const j = joy[side];
    j.active = true;
    j.tapStart = Date.now();
    j.blockTriggered = false;
    const touch = e.touches ? e.touches[0] : e;
    j.startX = touch.clientX;
    j.startY = touch.clientY;
    updateJoy(e, side);
  }

  function onJoyMove(e, side) {
    if (!joy[side].active) return;
    e.preventDefault();
    updateJoy(e, side);
  }

  function onJoyEnd(e, side) {
    e.preventDefault();
    const j = joy[side];
    const held = Date.now() - j.tapStart;
    const dist = Math.sqrt(j.dx * j.dx + j.dy * j.dy);

    if (held < 200 && dist < 0.3 && tapCallbacks[side]) {
      tapCallbacks[side]();
    }

    j.active = false;
    j.dx = 0;
    j.dy = 0;
    j.blockTriggered = false;
    if (j.knob) {
      j.knob.style.left = '50%';
      j.knob.style.top = '50%';
    }
  }

  function updateJoy(e, side) {
    const j = joy[side];
    if (!j.el || !j.knob) return;
    const rect = j.el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const touch = e.touches ? e.touches[0] : e;
    let dx = touch.clientX - cx;
    let dy = touch.clientY - cy;
    const max = rect.width / 2 - 25;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > max) {
      dx = dx / dist * max;
      dy = dy / dist * max;
    }
    j.dx = dx / max;
    j.dy = dy / max;
    j.knob.style.left = (50 + (dx / rect.width * 100)) + '%';
    j.knob.style.top = (50 + (dy / rect.height * 100)) + '%';
  }

  function isLeft1() {
    const s = window.G.settings.getSettings();
    if (s.controlScheme === 'arrows') return !!keys['arrowleft'];
    return !!keys['a'] || (joy.left.active && joy.left.dx < -0.3);
  }
  function isRight1() {
    const s = window.G.settings.getSettings();
    if (s.controlScheme === 'arrows') return !!keys['arrowright'];
    return !!keys['d'] || (joy.left.active && joy.left.dx > 0.3);
  }
  function isJump1() {
    const s = window.G.settings.getSettings();
    if (s.controlScheme === 'arrows') return !!keys['arrowup'];
    return !!keys['w'] || (joy.left.active && joy.left.dy < -0.5);
  }
  function isBlockPressed1() {
    const s = window.G.settings.getSettings();
    let pressed = false;
    if (s.controlScheme === 'arrows') {
      pressed = !!justPressed['arrowdown'];
    } else {
      pressed = !!justPressed['s'];
    }
    // Джойстик: вниз
    if (!pressed && joy.left.active && joy.left.dy > 0.5 && !joy.left.blockTriggered) {
      joy.left.blockTriggered = true;
      pressed = true;
    }
    return pressed;
  }
  function isShoot1() {
    const s = window.G.settings.getSettings();
    if (s.controlScheme === 'arrows') return !!keys['ю'] || !!keys['.'];
    return !!keys['e'];
  }

  function isLeft2() {
    return !!keys['arrowleft'] || (joy.right.active && joy.right.dx < -0.3);
  }
  function isRight2() {
    return !!keys['arrowright'] || (joy.right.active && joy.right.dx > 0.3);
  }
  function isJump2() {
    return !!keys['arrowup'] || (joy.right.active && joy.right.dy < -0.5);
  }
  function isBlockPressed2() {
    let pressed = !!justPressed['arrowdown'];
    if (!pressed && joy.right.active && joy.right.dy > 0.5 && !joy.right.blockTriggered) {
      joy.right.blockTriggered = true;
      pressed = true;
    }
    return pressed;
  }
  function isShoot2() {
    return !!keys['ю'] || !!keys['.'];
  }

  const input1 = { isLeft: isLeft1, isRight: isRight1, isJump: isJump1, isBlockPressed: isBlockPressed1, isShoot: isShoot1 };
  const input2 = { isLeft: isLeft2, isRight: isRight2, isJump: isJump2, isBlockPressed: isBlockPressed2, isShoot: isShoot2 };

  function triggerShoot1() {
    if (window.G.player) {
      const p = window.G.player.getPlayers().p1;
      if (p.shootCooldown <= 0) {
        const bx = p.facing > 0 ? p.x + p.w : p.x - 8;
        const by = p.y + p.h / 2;
        window.G.bullet.createBullet(p.id, bx, by, p.facing, false);
        p.shootCooldown = 25;
        window.G.audio.playShoot();
      }
    }
  }

  function triggerShoot2() {
    if (window.G.player) {
      const p = window.G.player.getPlayers().p2;
      if (p.shootCooldown <= 0) {
        const bx = p.facing > 0 ? p.x + p.w : p.x - 8;
        const by = p.y + p.h / 2;
        window.G.bullet.createBullet(p.id, bx, by, p.facing, false);
        p.shootCooldown = 25;
        window.G.audio.playShoot();
      }
    }
  }

  window.G = window.G || {};
  window.G.input = {
    initInput, setupJoystick, input1, input2, triggerShoot1, triggerShoot2, clearJustPressed
  };
})();