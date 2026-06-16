// js/settings.js
(function() {
  const DEFAULTS = {
    musicEnabled: true,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    controlScheme: 'wasd'
  };

  let settings = loadSettings();

  function loadSettings() {
    try {
      const saved = localStorage.getItem('rounds_arena_settings');
      if (saved) return Object.assign({}, DEFAULTS, JSON.parse(saved));
    } catch (e) {}
    return Object.assign({}, DEFAULTS);
  }

  function saveSettings() {
    try {
      localStorage.setItem('rounds_arena_settings', JSON.stringify(settings));
    } catch (e) {}
  }

  function getSettings() {
    return Object.assign({}, settings);
  }

  function updateSetting(key, value) {
    if (key in settings) {
      settings[key] = value;
      saveSettings();
    }
  }

  window.G = window.G || {};
  window.G.settings = { getSettings, updateSetting };
})();