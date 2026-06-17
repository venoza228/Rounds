(function() {
  let _isMobile = null;
  function detect() {
    const ua = (navigator.userAgent||'').toLowerCase();
    const mob = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua);
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const small = window.innerWidth < 820;
    return mob || (touch && small);
  }
  function isMobile() { if (_isMobile === null) _isMobile = detect(); return _isMobile; }
  function isDesktop() { return !isMobile(); }
  window.G = window.G || {};
  window.G.device = { isMobile, isDesktop };
})();