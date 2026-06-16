// js/device.js
(function() {
  let _isMobile = null;

  function detectDevice() {
    const ua = (navigator.userAgent || navigator.vendor || '').toLowerCase();
    const mobilePatterns = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/;
    const isMobileUA = mobilePatterns.test(ua);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < 820;
    return isMobileUA || (isTouchDevice && isSmallScreen);
  }

  function isMobile() {
    if (_isMobile === null) _isMobile = detectDevice();
    return _isMobile;
  }

  function isDesktop() { return !isMobile(); }

  window.G = window.G || {};
  window.G.device = { isMobile, isDesktop };
})();