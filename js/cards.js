(function() {
  const allCards = [
    { name: 'Вампиризм', desc: '+3 HP при попадании', icon: '🩸' },
    { name: 'Быстрые ноги', desc: 'Скорость +30%', icon: '👟' },
    { name: 'Тяжёлая пуля', desc: 'Урон пуль +5', icon: '💪' },
    { name: 'Двойной прыжок', desc: 'Прыжок в воздухе', icon: '🦘' },
    { name: 'Толстая кожа', desc: 'Урон -20%', icon: '🛡️' },
    { name: 'Быстрая перезарядка', desc: 'Кулдаун щита 3 сек', icon: '⚡' },
    { name: 'Самонаводка', desc: 'Пули доворачивают к врагу', icon: '🎯' },
    { name: 'Взрывная пуля', desc: 'Урон по области 50px', icon: '💥' },
    { name: 'Тройной выстрел', desc: '3 пули веером', icon: '🔫' },
    { name: 'Отскок', desc: 'Пули отскакивают от стен', icon: '🏓' },
    { name: 'Невидимка', desc: 'Невидимость 2 сек / 10 сек', icon: '👻' },
    { name: 'Ядовитые пули', desc: 'Яд: -2 HP/сек, 3 сек', icon: '☠️' },
    { name: 'Щит-шипы', desc: 'Щит наносит 5 урона атакующему', icon: '🌵' },
    { name: 'Телепорт', desc: 'Телепорт каждые 8 сек', icon: '🔮' },
    { name: 'Заморозка', desc: 'Пуля замораживает на 1 сек', icon: '❄️' },
    { name: 'Регенерация', desc: '+1 HP каждые 3 сек', icon: '💚' },
    { name: 'Мины', desc: 'Мина позади каждые 7 сек', icon: '💣' },
    { name: 'Берсерк', desc: 'HP < 30% → урон +50%', icon: '😡' },
    { name: 'Клон', desc: 'Клон на 3 сек / 15 сек', icon: '👥' }
  ];

  let playerCards = { player1: [], player2: [] };
  let overlay = null;
  let callback = null;
  let timerId = null;

  function initOverlay() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'cards-overlay';
    overlay.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;background:rgba(0,0,0,0.9);flex-direction:column;align-items:center;justify-content:center;font-family:Arial;';

    const title = document.createElement('div');
    title.textContent = 'ВЫБЕРИ УСИЛЕНИЕ';
    title.style.cssText = 'color:#fff;font-size:28px;font-weight:bold;margin-bottom:8px;text-shadow:0 0 20px #a080ff;';
    overlay.appendChild(title);

    const timer = document.createElement('div');
    timer.id = 'cards-timer';
    timer.style.cssText = 'color:#ff0;font-size:22px;margin-bottom:16px;';
    timer.textContent = '10';
    overlay.appendChild(timer);

    const row = document.createElement('div');
    row.id = 'cards-row';
    row.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;justify-content:center;';
    overlay.appendChild(row);

    document.body.appendChild(overlay);
  }

  function showCards(loserId, cb) {
    initOverlay();
    callback = cb;
    const row = document.getElementById('cards-row');
    row.innerHTML = '';

    const shuffled = allCards.slice().sort(function() { return Math.random() - 0.5; });
    const three = shuffled.slice(0, 3);

    for (let i = 0; i < three.length; i++) {
      const card = three[i];
      const el = document.createElement('div');
      el.style.cssText = 'width:160px;height:220px;background:#1a1d2e;border:2px solid #6a4a9e;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;cursor:pointer;color:#fff;padding:10px;transition:0.2s;';

      el.innerHTML = '<div style="font-size:14px;font-weight:bold;text-align:center">' + card.name + '</div>' +
        '<div style="font-size:44px">' + card.icon + '</div>' +
        '<div style="font-size:11px;color:#bbb;text-align:center">' + card.desc + '</div>';

      el.addEventListener('mouseenter', function() {
        this.style.borderColor = '#ffd700';
        this.style.boxShadow = '0 0 18px #ffd700';
      });
      el.addEventListener('mouseleave', function() {
        this.style.borderColor = '#6a4a9e';
        this.style.boxShadow = 'none';
      });

      (function(cardData) {
        el.addEventListener('click', function() {
          pickCard(loserId, cardData);
        });
      })(card);

      row.appendChild(el);
    }

    overlay.style.display = 'flex';

    let left = 10;
    document.getElementById('cards-timer').textContent = left;
    if (timerId) clearInterval(timerId);
    timerId = setInterval(function() {
      left--;
      document.getElementById('cards-timer').textContent = left;
      if (left <= 0) {
        clearInterval(timerId);
        timerId = null;
        pickCard(loserId, three[Math.floor(Math.random() * 3)]);
      }
    }, 1000);
  }

  function pickCard(loserId, card) {
    if (timerId) { clearInterval(timerId); timerId = null; }
    if (!playerCards[loserId]) playerCards[loserId] = [];
    playerCards[loserId].push(card);
    overlay.style.display = 'none';
    if (callback) { const cb = callback; callback = null; cb(); }
  }

  function pickRandomCard(playerId) {
    if (!playerCards[playerId]) playerCards[playerId] = [];
    const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
    playerCards[playerId].push(randomCard);
  }

  function getCards(playerId) { return playerCards[playerId] || []; }
  function resetCards() { playerCards = { player1: [], player2: [] }; }

  window.G = window.G || {};
  window.G.cards = {
    initCards: initOverlay,
    showCards: showCards,
    pickRandomCard: pickRandomCard,
    getPlayerCards: getCards,
    resetAllCards: resetCards
  };
})();