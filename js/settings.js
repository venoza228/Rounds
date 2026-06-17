(function() {
  const DEFAULTS = { musicEnabled: true, musicVolume: 0.5, sfxVolume: 0.7, controlScheme: 'wasd' };
  let settings = loadSettings();
  function loadSettings() {
    try { const s = localStorage.getItem('rounds_settings'); if (s) return Object.assign({}, DEFAULTS, JSON.parse(s)); } catch(e){}
    return Object.assign({}, DEFAULTS);
  }
  function saveSettings() { try { localStorage.setItem('rounds_settings', JSON.stringify(settings)); } catch(e){} }
  function getSettings() { return Object.assign({}, settings); }
  function updateSetting(k, v) { if (k in settings) { settings[k] = v; saveSettings(); } }
  window.G = window.G || {};
  window.G.settings = { getSettings, updateSetting };
})();