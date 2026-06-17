(function() {
  const keys = {};
  const jp = {};
  const joy = {
    left: { a: false, dx: 0, dy: 0, ts: 0, bt: false, jt: false, el: null, kn: null },
    right: { a: false, dx: 0, dy: 0, ts: 0, bt: false, jt: false, el: null, kn: null }
  };
  const tapCb = { left: null, right: null };

  function initInput() {
    document.addEventListener('keydown', kd);
    document.addEventListener('keyup', ku);
  }

  function kd(e) {
    const k = e.key.toLowerCase();
    if (!keys[k]) jp[k] = true;
    keys[k] = true;
    if (k === 'escape') {
      const ev = new CustomEvent('toggleSettings');
      document.dispatchEvent(ev);
    }
  }

  function ku(e) {
    keys[e.key.toLowerCase()] = false;
  }

  function clearJustPressed() {
    for (const k in jp) delete jp[k];
    joy.left.jt = false;
    joy.right.jt = false;
    joy.left.bt = false;
    joy.right.bt = false;
  }

  function setupJoystick(side, el, kn, cb) {
    if (!el) return;
    joy[side].el = el;
    joy[side].kn = kn;
    tapCb[side] = cb;
    el.addEventListener('touchstart', function(e) { e.preventDefault(); js(e, side); }, { passive: false });
    el.addEventListener('touchmove', function(e) { e.preventDefault(); jm(e, side); }, { passive: false });
    el.addEventListener('touchend', function(e) { e.preventDefault(); je(e, side); }, { passive: false });
  }

  function js(e, s) {
    const j = joy[s];
    j.a = true;
    j.ts = Date.now();
    j.bt = false;
    j.jt = false;
    upd(e, s);
  }

  function jm(e, s) {
    if (!joy[s].a) return;
    e.preventDefault();
    upd(e, s);
  }

  function je(e, s) {
    e.preventDefault();
    const j = joy[s];
    const h = Date.now() - j.ts;
    const d = Math.sqrt(j.dx * j.dx + j.dy * j.dy);
    if (h < 200 && d < 0.3 && tapCb[s]) tapCb[s]();
    j.a = false;
    j.dx = 0;
    j.dy = 0;
    j.bt = false;
    j.jt = false;
    if (j.kn) {
      j.kn.style.left = '50%';
      j.kn.style.top = '50%';
    }
  }

  function upd(e, s) {
    const j = joy[s];
    if (!j.el || !j.kn) return;
    const r = j.el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const t = e.touches ? e.touches[0] : e;
    let dx = t.clientX - cx;
    let dy = t.clientY - cy;
    const mx = r.width / 2 - 25;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > mx) {
      dx = dx / dist * mx;
      dy = dy / dist * mx;
    }
    j.dx = dx / mx;
    j.dy = dy / mx;
    j.kn.style.left = (50 + (dx / r.width * 100)) + '%';
    j.kn.style.top = (50 + (dy / r.height * 100)) + '%';
  }

  // ========== ИГРОК 1 ==========
  function iL1() {
    return !!keys['a'] || !!keys['ф'] || (joy.left.a && joy.left.dx < -0.3);
  }

  function iR1() {
    return !!keys['d'] || !!keys['в'] || (joy.left.a && joy.left.dx > 0.3);
  }

  function iJ1() {
    return !!keys['w'] || !!keys['ц'] || (joy.left.a && joy.left.dy < -0.5);
  }

  function iJJ1() {
    let p = !!jp['w'] || !!jp['ц'];
    if (!p && joy.left.a && joy.left.dy < -0.5 && !joy.left.jt) {
      joy.left.jt = true;
      p = true;
    }
    return p;
  }

  function iB1() {
    // Щит на S (английская) или Ы (русская)
    let p = !!jp['s'] || !!jp['ы'];
    if (!p && joy.left.a && joy.left.dy > 0.5 && !joy.left.bt) {
      joy.left.bt = true;
      p = true;
    }
    return p;
  }

  function iS1() {
    // Огонь на E (английская) или У (русская)
    return !!keys['e'] || !!keys['у'];
  }

  // ========== ИГРОК 2 ==========
  function iL2() {
    return !!keys['arrowleft'] || (joy.right.a && joy.right.dx < -0.3);
  }

  function iR2() {
    return !!keys['arrowright'] || (joy.right.a && joy.right.dx > 0.3);
  }

  function iJ2() {
    return !!keys['arrowup'] || (joy.right.a && joy.right.dy < -0.5);
  }

  function iJJ2() {
    let p = !!jp['arrowup'];
    if (!p && joy.right.a && joy.right.dy < -0.5 && !joy.right.jt) {
      joy.right.jt = true;
      p = true;
    }
    return p;
  }

  function iB2() {
    let p = !!jp['arrowdown'];
    if (!p && joy.right.a && joy.right.dy > 0.5 && !joy.right.bt) {
      joy.right.bt = true;
      p = true;
    }
    return p;
  }

  function iS2() {
    return !!keys['ю'] || !!keys['.'] || !!keys['/'];
  }

  const input1 = {
    isLeft: iL1,
    isRight: iR1,
    isJump: iJ1,
    isJumpJustPressed: iJJ1,
    isBlockPressed: iB1,
    isShoot: iS1
  };

  const input2 = {
    isLeft: iL2,
    isRight: iR2,
    isJump: iJ2,
    isJumpJustPressed: iJJ2,
    isBlockPressed: iB2,
    isShoot: iS2
  };

  function ts1() {
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

  function ts2() {
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
    initInput: initInput,
    setupJoystick: setupJoystick,
    input1: input1,
    input2: input2,
    triggerShoot1: ts1,
    triggerShoot2: ts2,
    clearJustPressed: clearJustPressed
  };
})();