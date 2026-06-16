// js/main.js
(function() {
  let ysdk = null;
  let currentLang = 'ru';
  const isFileProtocol = window.location.protocol === 'file:';

  // Выбранная конфигурация матча
  let selectedMode = 'bot';
  let selectedMap = 0;

  function initYaSDK() {
    if (isFileProtocol || typeof YaGames === 'undefined' || !YaGames.init) {
      if (isFileProtocol) console.warn('Local file:// mode: Yandex SDK disabled.');
      applyLang();
      return;
    }

    YaGames.init().then(function(sdk) {
      ysdk = sdk;
      try {
        if (ysdk.environment && ysdk.environment.i18n) {
          const l = ysdk.environment.i18n.lang;
          if (l === 'ru' || l === 'en') currentLang = l;
        }
      } catch (e) {}
      applyLang();
      try {
        if (ysdk.features && ysdk.features.LoadingAPI) {
          ysdk.features.LoadingAPI.ready();
        }
      } catch (e) {}
    }).catch(function(err) {
      console.warn('YaGames init failed:', err.message);
      applyLang();
    });
  }

  function showFullscreenAd() {
    if (ysdk && ysdk.adv && ysdk.adv.showFullscreenAdv) {
      ysdk.adv.showFullscreenAdv({ callbacks: { onClose: function(){}, onError: function(){} } });
    }
  }

  function applyLang() {
    if (!window.lang || !window.lang[currentLang]) {
      currentLang = 'ru';
      if (!window.lang || !window.lang[currentLang]) return;
    }
    const t = window.lang[currentLang];
    const ids = {
      'menu-title': t.title,
      'label-mode': t.mode,
      'label-map': t.map,
      'opt-bot': t.botMode,
      'opt-local': t.localMode,
      'btn-start': t.start,
      'btn-menu-settings': '⚙ ' + t.settings,
      'settings-title': t.settings,
      'label-music': t.music,
      'label-sfx': t.sfx,
      'label-controls': t.controls,
      'btn-close-settings': t.close,
      'btn-back': t.back,
      'btn-fullscreen': '⛶'
    };
    for (const id in ids) {
      const el = document.getElementById(id);
      if (el && ids[id]) el.textContent = ids[id];
    }
    // Карты
    if (t.maps && t.maps.length >= 5) {
      for (let i = 0; i < 5; i++) {
        const mapBtn = document.getElementById('opt-map-' + i);
        if (mapBtn) mapBtn.textContent = t.maps[i];
      }
    }
  }

  // Переключение экранов
  function showMenu() {
    document.getElementById('menu-screen').classList.remove('hidden');
    document.getElementById('game-area').classList.add('hidden');
    document.getElementById('mobile-controls').classList.add('hidden');
    if (window.G.game) {
      // Остановить игру
    }
  }

  function showGame() {
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('game-area').classList.remove('hidden');
    // Джойстики показываем только на мобилках
    if (window.G.device.isMobile()) {
      document.getElementById('mobile-controls').classList.remove('hidden');
      // В режиме с ботом — только левый джойстик
      const rightJoy = document.getElementById('joy-right');
      if (selectedMode === 'bot') rightJoy.style.visibility = 'hidden';
      else rightJoy.style.visibility = 'visible';
    } else {
      document.getElementById('mobile-controls').classList.add('hidden');
    }
  }

  function setupMenu() {
    // Режим
    const modeOptions = document.querySelectorAll('#mode-options .menu-option');
    for (let i = 0; i < modeOptions.length; i++) {
      modeOptions[i].addEventListener('click', function() {
        for (let j = 0; j < modeOptions.length; j++) modeOptions[j].classList.remove('active');
        this.classList.add('active');
        selectedMode = this.getAttribute('data-mode');
      });
    }

    // Карта
    const mapOptions = document.querySelectorAll('#map-options .menu-option');
    for (let i = 0; i < mapOptions.length; i++) {
      mapOptions[i].addEventListener('click', function() {
        for (let j = 0; j < mapOptions.length; j++) mapOptions[j].classList.remove('active');
        this.classList.add('active');
        selectedMap = parseInt(this.getAttribute('data-map'), 10);
      });
    }

    // Старт
    document.getElementById('btn-start').addEventListener('click', function() {
      window.G.audio.resumeAudio();
      window.G.game.setMatchConfig(selectedMode, selectedMap);
      showGame();
      window.G.game.startMatch();
    });

    // Настройки из меню
    document.getElementById('btn-menu-settings').addEventListener('click', function() {
      document.getElementById('settings-overlay').classList.add('show');
    });

    // Возврат в меню
    document.getElementById('btn-back').addEventListener('click', function() {
      showFullscreenAd();
      showMenu();
    });
  }

  function setupSettingsMenu() {
    const overlay = document.getElementById('settings-overlay');
    const btnSettings = document.getElementById('btn-settings');
    const btnClose = document.getElementById('btn-close-settings');
    const toggleMusic = document.getElementById('toggle-music');
    const volMusic = document.getElementById('volume-music');
    const volSfx = document.getElementById('volume-sfx');
    const selectControls = document.getElementById('select-controls');

    const s = window.G.settings.getSettings();
    toggleMusic.checked = s.musicEnabled;
    volMusic.value = Math.round(s.musicVolume * 100);
    volSfx.value = Math.round(s.sfxVolume * 100);
    selectControls.value = s.controlScheme;

    function openSettings() { overlay.classList.add('show'); }
    function closeSettings() { overlay.classList.remove('show'); }

    btnSettings.addEventListener('click', openSettings);
    btnClose.addEventListener('click', closeSettings);

    document.addEventListener('toggleSettings', function() {
      if (overlay.classList.contains('show')) closeSettings();
      else openSettings();
    });

    function applyVolumes() {
      if (window.G.audio) window.G.audio.applyVolumes();
    }

    toggleMusic.addEventListener('change', function() {
      window.G.settings.updateSetting('musicEnabled', this.checked);
      applyVolumes();
    });

    volMusic.addEventListener('input', function() {
      window.G.settings.updateSetting('musicVolume', parseInt(this.value, 10) / 100);
      applyVolumes();
    });

    volSfx.addEventListener('input', function() {
      window.G.settings.updateSetting('sfxVolume', parseInt(this.value, 10) / 100);
      applyVolumes();
    });

    selectControls.addEventListener('change', function() {
      window.G.settings.updateSetting('controlScheme', this.value);
    });
  }

  function setupFullscreen() {
    const btn = document.getElementById('btn-fullscreen');
    btn.addEventListener('click', function() {
      try {
        if (!document.fullscreenElement) {
          if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) document.exitFullscreen();
      } catch (e) {}
    });
  }

  function init() {
    const required = ['settings', 'device', 'audio', 'map', 'ui', 'bullet', 'player', 'bot', 'input', 'game'];
    window.G = window.G || {};
    const missing = required.filter(function(m) { return !window.G[m]; });
    if (missing.length > 0) {
      console.error('Missing modules:', missing);
      alert('Ошибка загрузки модулей: ' + missing.join(', ') + '\n\nПроверь пути к файлам в js/ папке.');
      return;
    }

    initYaSDK();
    window.G.audio.initAudio();

    window.G.map.initMap(document.getElementById('platforms'), document.getElementById('game-area'));
    window.G.bullet.initBullets(document.getElementById('svg-layer'));
    window.G.ui.initUI(
      document.getElementById('hp-player-bar'),
      document.getElementById('hp-bot-bar'),
      document.getElementById('score-player'),
      document.getElementById('score-bot'),
      document.getElementById('round-overlay'),
      document.getElementById('round-text'),
      document.getElementById('svg-layer')
    );
    window.G.player.initPlayer(
      document.getElementById('player'),
      document.getElementById('bot'),
      document.getElementById('player-shield'),
      document.getElementById('bot-shield')
    );
    window.G.bot.initBot(document.getElementById('bot'), document.getElementById('bot-shield'));

    window.G.input.initInput();

    // Джойстики
    window.G.input.setupJoystick(
      'left',
      document.getElementById('joy-left'),
      document.getElementById('joy-left').querySelector('.joy-knob'),
      window.G.input.triggerShoot1
    );
    window.G.input.setupJoystick(
      'right',
      document.getElementById('joy-right'),
      document.getElementById('joy-right').querySelector('.joy-knob'),
      window.G.input.triggerShoot2
    );

    // После матча — возврат в меню
    window.G.game.setMatchEndCallback(function() {
      showMenu();
    });

    window.G.game.initGame(window.lang, currentLang);
    window.G.game.init();
    setupMenu();
    setupSettingsMenu();
    setupFullscreen();

    document.addEventListener('click', window.G.audio.resumeAudio, { once: true });
    document.addEventListener('touchstart', window.G.audio.resumeAudio, { once: true });

    // Стартуем с меню
    showMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();