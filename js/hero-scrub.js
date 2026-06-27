(function () {
  const FRAME_COUNT = 120;
  const FRAME_PATH = 'assets/frames/seq_';
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const frames = [];
  let loadedCount = 0;
  const heroContent = document.querySelector('.hero__content');
  const scrollHint = document.querySelector('.hero__scroll-hint');
  const loader = document.querySelector('.loader');

  const loaderProgress = loader ? loader.querySelector('.loader__progress') : null;

  function padNum(n) {
    return String(n).padStart(3, '0');
  }

  function drawFrame(index) {
    const img = frames[index];
    if (!img || !img.complete) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
  }

  function onAllLoaded() {
    drawFrame(0);

    if (loader) {
      loader.classList.add('hidden');
    }

    if (scrollHint) {
      scrollHint.style.opacity = '1';
    }

    // Wait for GSAP to be available
    function initScrollScrub() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        setTimeout(initScrollScrub, 100);
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const currentFrame = { value: 0 };
      const overlay = document.querySelector('.hero__overlay');
      const heroCanvas = document.getElementById('heroCanvas');

      // Start blurred and dark
      if (heroCanvas) heroCanvas.style.filter = 'blur(8px) brightness(0.4)';

      // Pin hero and scrub through frames
      const scrubTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: () => '+=' + (window.innerWidth < 768 ? '150%' : '250%'),
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            var p = self.progress;

            // Gradually clear the blur and brighten (0→70% of scrub)
            if (heroCanvas) {
              var blurVal = Math.max(0, 8 * (1 - p / 0.7));
              var brightVal = 0.4 + 0.6 * Math.min(p / 0.7, 1);
              heroCanvas.style.filter = 'blur(' + blurVal.toFixed(1) + 'px) brightness(' + brightVal.toFixed(2) + ')';
            }

            // Fade overlay from heavy to subtle
            if (overlay) {
              overlay.style.opacity = 1 - (p * 0.5);
            }

            // Hide scroll hint once user starts scrolling
            if (scrollHint) {
              scrollHint.style.opacity = p > 0.05 ? '0' : '1';
            }

            // Show hero content at 85% progress
            if (heroContent) {
              if (p >= 0.85) {
                heroContent.classList.add('hero-visible');
              } else {
                heroContent.classList.remove('hero-visible');
              }
            }
          }
        }
      });

      scrubTl.to(currentFrame, {
        value: FRAME_COUNT - 1,
        ease: 'none',
        onUpdate: () => {
          drawFrame(Math.round(currentFrame.value));
        }
      });

      // Recalculate on resize
      ScrollTrigger.addEventListener('refresh', () => {
        ScrollTrigger.getAll().forEach(st => st.vars.end = '+=' + (window.innerWidth < 768 ? '150%' : '250%'));
      });
    }

    initScrollScrub();
  }

  // Preload all frames
  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    img.onload = () => {
      loadedCount++;

      if (loaderProgress) {
        loaderProgress.style.width = ((loadedCount / FRAME_COUNT) * 100) + '%';
      }

      if (loadedCount === FRAME_COUNT) {
        onAllLoaded();
      }
    };
    img.onerror = () => {
      loadedCount++;
      if (loadedCount === FRAME_COUNT) onAllLoaded();
    };
    img.src = FRAME_PATH + padNum(i) + '.webp';
    frames[i - 1] = img;
  }

  // Draw first frame as soon as it loads
  if (frames[0]) {
    frames[0].onload = function () {
      drawFrame(0);
      frames[0].onload = null;
      loadedCount++;
      if (loadedCount === FRAME_COUNT) onAllLoaded();
    };
  }
})();
