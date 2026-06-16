// js/audio.js
(function() {
  let audioCtx = null;
  let musicGain = null;
  let sfxGain = null;

  function getSettingsSafe() {
    if (window.G && window.G.settings && typeof window.G.settings.getSettings === 'function') {
      return window.G.settings.getSettings();
    }
    return { musicEnabled: true, musicVolume: 0.5, sfxVolume: 0.7 };
  }

  function initAudio() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
      musicGain = audioCtx.createGain();
      musicGain.connect(audioCtx.destination);
      sfxGain = audioCtx.createGain();
      sfxGain.connect(audioCtx.destination);
      applyVolumes();
    } catch (e) {
      console.warn('Audio init failed:', e.message);
    }
  }

  function resumeAudio() {
    try {
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) {}
  }

  function applyVolumes() {
    const s = getSettingsSafe();
    if (musicGain) musicGain.gain.value = s.musicEnabled ? s.musicVolume : 0;
    if (sfxGain) sfxGain.gain.value = s.sfxVolume;
  }

  function playTone(freq, duration, type) {
    type = type || 'square';
    if (!audioCtx || !sfxGain) return;
    const s = getSettingsSafe();
    if (s.sfxVolume <= 0) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = 0.3;
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function playShoot() { playTone(800, 0.08, 'square'); }
  function playHit() { playTone(200, 0.12, 'sawtooth'); }
  function playJump() { playTone(400, 0.08, 'sine'); }
  function playBlock() { playTone(600, 0.06, 'triangle'); }
  function playRoundStart() { playTone(523, 0.15, 'sine'); setTimeout(function(){playTone(659,0.15,'sine');}, 150); }

  function playWin() {
    playTone(523, 0.12, 'sine');
    setTimeout(function() { playTone(659, 0.12, 'sine'); }, 130);
    setTimeout(function() { playTone(784, 0.25, 'sine'); }, 260);
  }

  function playLose() {
    playTone(300, 0.15, 'sawtooth');
    setTimeout(function() { playTone(200, 0.25, 'sawtooth'); }, 180);
  }

  window.G = window.G || {};
  window.G.audio = {
    initAudio, resumeAudio, applyVolumes,
    playShoot, playHit, playJump, playBlock, playRoundStart, playWin, playLose
  };
})();