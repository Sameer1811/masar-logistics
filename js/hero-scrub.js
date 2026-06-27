(function () {
  var FRAME_COUNT = 120;
  var FRAME_PATH = 'assets/frames/seq_';
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  var frames = new Array(FRAME_COUNT);
  var bitmaps = new Array(FRAME_COUNT);
  var loadedCount = 0;
  var currentFrame = 0;
  var drawnFrame = -1;
  var rafId = null;

  var heroContent = document.querySelector('.hero__content');
  var scrollHint = document.querySelector('.hero__scroll-hint');
  var loader = document.querySelector('.loader');
  var loaderProgress = loader ? loader.querySelector('.loader__progress') : null;
  var overlay = document.querySelector('.hero__overlay');

  // Match canvas to screen for crisp rendering without overdraw
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var cw = Math.min(window.innerWidth * dpr, 1920);
  var ch = Math.min(window.innerHeight * dpr, 1080);
  canvas.width = cw;
  canvas.height = ch;

  function pad(n) { return String(n).padStart(3, '0'); }

  // RAF-decoupled draw loop — never draws in the scroll callback itself
  function drawLoop() {
    if (currentFrame !== drawnFrame) {
      var src = bitmaps[currentFrame] || frames[currentFrame];
      if (src) {
        ctx.drawImage(src, 0, 0, cw, ch);
        drawnFrame = currentFrame;
      }
    }
    rafId = requestAnimationFrame(drawLoop);
  }

  function stopDrawLoop() {
    if (rafId) cancelAnimationFrame(rafId);
  }

  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      return setTimeout(initGSAP, 50);
    }

    gsap.registerPlugin(ScrollTrigger);

    var isMobile = window.innerWidth < 768;

    // Start draw loop
    drawLoop();

    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: isMobile ? '+=200%' : '+=300%',
      pin: true,
      pinSpacing: true,
      scrub: 2,
      anticipatePin: 1,
      onUpdate: function (self) {
        var p = self.progress;

        // Just set the target frame — drawLoop handles the actual draw
        currentFrame = Math.round(p * (FRAME_COUNT - 1));

        // Scroll hint
        if (scrollHint) scrollHint.style.opacity = p < 0.03 ? '1' : '0';

        // Overlay fade
        if (overlay) overlay.style.opacity = String(1 - p * 0.6);

        // Content reveal at 85%
        if (heroContent) {
          if (p >= 0.85) {
            heroContent.classList.add('is-revealed');
          } else {
            heroContent.classList.remove('is-revealed');
          }
        }
      },
      onLeave: function () { stopDrawLoop(); },
      onEnterBack: function () { drawLoop(); }
    });
  }

  // Pre-decode images into ImageBitmaps for instant GPU drawing
  function decodeToBitmap(idx) {
    var img = frames[idx];
    if (img && img.complete && typeof createImageBitmap === 'function') {
      createImageBitmap(img).then(function (bmp) {
        bitmaps[idx] = bmp;
      }).catch(function () {});
    }
  }

  function onAllLoaded() {
    // Draw first frame
    currentFrame = 0;
    drawnFrame = -1;
    var src = bitmaps[0] || frames[0];
    if (src) ctx.drawImage(src, 0, 0, cw, ch);
    drawnFrame = 0;

    // Pre-decode all to bitmaps in background
    for (var i = 0; i < FRAME_COUNT; i++) decodeToBitmap(i);

    // Hide loader
    if (loader) loader.classList.add('hidden');
    if (scrollHint) scrollHint.style.opacity = '1';

    initGSAP();
  }

  // Preload frames
  for (var i = 0; i < FRAME_COUNT; i++) {
    (function (idx) {
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () {
        loadedCount++;
        if (idx === 0) {
          ctx.drawImage(img, 0, 0, cw, ch);
          drawnFrame = 0;
        }
        decodeToBitmap(idx);
        if (loaderProgress) {
          loaderProgress.style.width = ((loadedCount / FRAME_COUNT) * 100) + '%';
        }
        if (loadedCount === FRAME_COUNT) onAllLoaded();
      };
      img.onerror = function () {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) onAllLoaded();
      };
      img.src = FRAME_PATH + pad(idx + 1) + '.webp';
      frames[idx] = img;
    })(i);
  }
})();
