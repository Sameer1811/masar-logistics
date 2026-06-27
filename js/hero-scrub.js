(function () {
  var FRAME_COUNT = 120;
  var FRAME_PATH = 'assets/frames/seq_';
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d', { alpha: false });
  var frames = new Array(FRAME_COUNT);
  var loadedCount = 0;
  var lastDrawn = -1;

  var heroContent = document.querySelector('.hero__content');
  var scrollHint = document.querySelector('.hero__scroll-hint');
  var loader = document.querySelector('.loader');
  var loaderProgress = loader ? loader.querySelector('.loader__progress') : null;
  var overlay = document.querySelector('.hero__overlay');

  // Set canvas to full HD once
  canvas.width = 1920;
  canvas.height = 1080;

  function pad(n) { return String(n).padStart(3, '0'); }

  function drawFrame(i) {
    if (i === lastDrawn) return;
    if (i < 0) i = 0;
    if (i >= FRAME_COUNT) i = FRAME_COUNT - 1;
    var img = frames[i];
    if (!img || !img.complete) return;
    ctx.drawImage(img, 0, 0, 1920, 1080);
    lastDrawn = i;
  }

  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      return setTimeout(initGSAP, 50);
    }

    gsap.registerPlugin(ScrollTrigger);

    var obj = { frame: 0 };
    var isMobile = window.innerWidth < 768;

    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: isMobile ? '+=200%' : '+=300%',
      pin: true,
      pinSpacing: true,
      scrub: 1,
      anticipatePin: 1,
      onUpdate: function (self) {
        // Draw frame
        var frameIndex = Math.round(self.progress * (FRAME_COUNT - 1));
        drawFrame(frameIndex);

        // Scroll hint: visible at start, gone once scrolling
        if (scrollHint) {
          scrollHint.style.opacity = self.progress < 0.03 ? '1' : '0';
        }

        // Overlay: fade from visible to transparent as we scrub
        if (overlay) {
          overlay.style.opacity = String(1 - self.progress * 0.6);
        }

        // Hero content: reveal at 85%
        if (heroContent) {
          if (self.progress >= 0.85) {
            heroContent.classList.add('is-revealed');
          } else {
            heroContent.classList.remove('is-revealed');
          }
        }
      }
    });
  }

  function onAllLoaded() {
    // Draw first frame
    drawFrame(0);

    // Hide loader
    if (loader) loader.classList.add('hidden');

    // Show scroll hint
    if (scrollHint) scrollHint.style.opacity = '1';

    // Init GSAP scroll scrub
    initGSAP();
  }

  // Preload all frames
  for (var i = 0; i < FRAME_COUNT; i++) {
    (function (idx) {
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () {
        loadedCount++;
        // Draw first frame as soon as it loads
        if (idx === 0) drawFrame(0);
        // Update loader
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
