// js/map.js
(function() {
  const GAME_W = 800;
  const GAME_H = 500;
  const GROUND_Y = 440;

  // 5 карт: Арена, Крыши, Подземелье, Космос, Лес
  const MAPS = [
    {
      bg: 'linear-gradient(180deg, #1a1d2e 0%, #2d1b4e 60%, #3d2a5e 100%)',
      groundColor: '#3d2a5e',
      grassColor: '#5a8a3a',
      platforms: [
        { x: 0, y: GROUND_Y, w: GAME_W, h: 60, type: 'ground' },
        { x: 50, y: 340, w: 120, h: 20, type: 'plat' },
        { x: 630, y: 340, w: 120, h: 20, type: 'plat' },
        { x: 330, y: 280, w: 140, h: 20, type: 'plat' }
      ]
    },
    {
      bg: 'linear-gradient(180deg, #ff7e5f 0%, #feb47b 50%, #5a3a7e 100%)',
      groundColor: '#2a1a3e',
      grassColor: '#6a5a8a',
      platforms: [
        { x: 0, y: GROUND_Y, w: GAME_W, h: 60, type: 'ground' },
        { x: 80, y: 360, w: 160, h: 20, type: 'plat' },
        { x: 560, y: 360, w: 160, h: 20, type: 'plat' },
        { x: 280, y: 280, w: 240, h: 20, type: 'plat' },
        { x: 360, y: 180, w: 80, h: 20, type: 'plat' }
      ]
    },
    {
      bg: 'linear-gradient(180deg, #0a0a1a 0%, #1a0a2a 60%, #2a0a1a 100%)',
      groundColor: '#1a1a2a',
      grassColor: '#4a4a5a',
      platforms: [
        { x: 0, y: GROUND_Y, w: GAME_W, h: 60, type: 'ground' },
        { x: 100, y: 380, w: 100, h: 20, type: 'plat' },
        { x: 280, y: 340, w: 100, h: 20, type: 'plat' },
        { x: 420, y: 340, w: 100, h: 20, type: 'plat' },
        { x: 600, y: 380, w: 100, h: 20, type: 'plat' },
        { x: 240, y: 220, w: 320, h: 20, type: 'plat' }
      ]
    },
    {
      bg: 'radial-gradient(ellipse at center, #1a0a3a 0%, #0a0a1a 100%)',
      groundColor: '#2a1a4a',
      grassColor: '#6a4aaa',
      platforms: [
        { x: 0, y: GROUND_Y, w: GAME_W, h: 60, type: 'ground' },
        { x: 120, y: 360, w: 100, h: 20, type: 'plat' },
        { x: 580, y: 360, w: 100, h: 20, type: 'plat' },
        { x: 300, y: 280, w: 200, h: 20, type: 'plat' },
        { x: 160, y: 180, w: 120, h: 20, type: 'plat' },
        { x: 520, y: 180, w: 120, h: 20, type: 'plat' }
      ]
    },
    {
      bg: 'linear-gradient(180deg, #0a2a1a 0%, #1a4a2a 60%, #2a5a3a 100%)',
      groundColor: '#3a2a1a',
      grassColor: '#5a8a3a',
      platforms: [
        { x: 0, y: GROUND_Y, w: GAME_W, h: 60, type: 'ground' },
        { x: 100, y: 370, w: 80, h: 20, type: 'plat' },
        { x: 620, y: 370, w: 80, h: 20, type: 'plat' },
        { x: 250, y: 310, w: 120, h: 20, type: 'plat' },
        { x: 430, y: 310, w: 120, h: 20, type: 'plat' },
        { x: 340, y: 230, w: 120, h: 20, type: 'plat' }
      ]
    }
  ];

  let platforms = [];
  let elPlatforms = null;
  let elGameArea = null;

  function initMap(platformsEl, gameAreaEl) {
    elPlatforms = platformsEl;
    elGameArea = gameAreaEl;
  }

  function setMap(index) {
    elPlatforms.innerHTML = '';
    platforms = [];
    const mapData = MAPS[index];
    elGameArea.style.background = mapData.bg;

    for (let i = 0; i < mapData.platforms.length; i++) {
      const p = mapData.platforms[i];
      const el = document.createElement('div');
      el.className = 'platform';
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
      el.style.width = p.w + 'px';
      el.style.height = p.h + 'px';

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', p.w);
      svg.setAttribute('height', p.h);
      svg.setAttribute('viewBox', '0 0 ' + p.w + ' ' + p.h);

      if (p.type === 'ground') {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', p.w);
        rect.setAttribute('height', p.h);
        rect.setAttribute('fill', mapData.groundColor);
        svg.appendChild(rect);

        const grass = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        grass.setAttribute('width', p.w);
        grass.setAttribute('height', '6');
        grass.setAttribute('fill', mapData.grassColor);
        svg.appendChild(grass);

        for (let k = 0; k < 12; k++) {
          const stone = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          stone.setAttribute('cx', Math.random() * p.w);
          stone.setAttribute('cy', 10 + Math.random() * (p.h - 12));
          stone.setAttribute('r', 1 + Math.random() * 2);
          stone.setAttribute('fill', 'rgba(0,0,0,0.3)');
          svg.appendChild(stone);
        }
      } else {
        const platRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        platRect.setAttribute('width', p.w);
        platRect.setAttribute('height', p.h);
        platRect.setAttribute('fill', '#4a3a7e');
        platRect.setAttribute('stroke', '#8a6ade');
        platRect.setAttribute('stroke-width', '2');
        svg.appendChild(platRect);

        for (let j = 0; j < p.w; j += 20) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', j);
          line.setAttribute('y1', '4');
          line.setAttribute('x2', j + 10);
          line.setAttribute('y2', '4');
          line.setAttribute('stroke', '#a080ff');
          line.setAttribute('stroke-width', '1');
          svg.appendChild(line);
        }
      }

      el.appendChild(svg);
      elPlatforms.appendChild(el);
      platforms.push(p);
    }
  }

  function collidePlatforms(entity) {
    entity.onGround = false;
    for (let i = 0; i < platforms.length; i++) {
      const p = platforms[i];
      if (entity.x + entity.w > p.x && entity.x < p.x + p.w) {
        if (entity.vy >= 0 &&
            entity.y + entity.h > p.y &&
            entity.y + entity.h < p.y + p.h + 15 &&
            entity.y < p.y) {
          entity.y = p.y - entity.h;
          entity.vy = 0;
          entity.onGround = true;
        }
      }
    }
  }

  window.G = window.G || {};
  window.G.map = { initMap, setMap, collidePlatforms, GAME_W, GAME_H };
})();