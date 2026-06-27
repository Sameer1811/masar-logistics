(function () {
  var FRAME_COUNT = 120;
  var FRAME_PATH = 'assets/frames/seq_';
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  var frames = new Array(FRAME_COUNT);
  var loadedCount = 0;
  var lastDrawnFrame = -1;
  var heroContent = document.querySelector('.hero__content');
  var scrollHint = document.querySelector('.hero__scroll-hint');
  var loader = document.querySelector('.loader');
  var loaderProgress = loader ? loader.querySelector('.loader__progress') : null;

  // Set canvas size once — never reset it per frame
  canvas.width = 1920;
  canvas.height = 1080;

  function padNum(n) {
    return String(n).padStart(3, '0');
  }

  function drawFrame(index) {
    if (index === lastDrawnFrame) return;
    var img = frames[index];
    if (!img || !img.complete) return;
    ctx.drawImage(img, 0, 0, 1920, 1080);
    lastDrawnFrame = index;
  }

  function onAllLoaded() {
    drawFrame(0);

    if (loader) loader.classList.add('hidden');
    if (scrollHint) scrollHint.style.opacity = '1';

    function initScrollScrub() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        setTimeout(initScrollScrub, 50);
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      var currentFrame = { value: 0 };
      var scrubEnd = window.innerWidth < 768 ? '150%' : '250%';

      gsap.timeline({
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: '+=' + scrubEnd,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          onUpdate: function (self) {
            var p = self.progress;
            if (scrollHint) scrollHint.style.opacity = p > 0.05 ? '0' : '1';
            if (heroContent) {
              if (p >= 0.85) {
                heroContent.classList.add('hero-visible');
              } else {
                heroContent.classList.remove('hero-visible');
              }
            }
          }
        }
      }).to(currentFrame, {
        value: FRAME_COUNT - 1,
        ease: 'none',
        onUpdate: function () {
          drawFrame(Math.round(currentFrame.value));
        }
      });
    }

    initScrollScrub();
  }

  // Preload frames — first frame draws immediately, rest load in parallel
  var firstLoaded = false;
  for (var i = 1; i <= FRAME_COUNT; i++) {
    (function (idx) {
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () {
        loadedCount++;
        if (idx === 0 && !firstLoaded) {
          firstLoaded = true;
          drawFrame(0);
        }
        if (loaderProgress) {
          loaderProgress.style.width = ((loadedCount / FRAME_COUNT) * 100) + '%';
        }
        if (loadedCount === FRAME_COUNT) onAllLoaded();
      };
      img.onerror = function () {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) onAllLoaded();
      };
      img.src = FRAME_PATH + padNum(idx + 1) + '.webp';
      frames[idx] = img;
    })(i - 1);
  }
})();
