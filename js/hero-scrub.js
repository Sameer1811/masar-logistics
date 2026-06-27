(function () {
  var video = document.getElementById('heroVideo');
  if (!video) return;

  var heroContent = document.querySelector('.hero__content');
  var scrollHint = document.querySelector('.hero__scroll-hint');
  var loader = document.querySelector('.loader');
  var loaderProgress = loader ? loader.querySelector('.loader__progress') : null;

  // Show first frame immediately
  video.currentTime = 0;

  function onVideoReady() {
    if (loader) loader.classList.add('hidden');
    if (scrollHint) scrollHint.style.opacity = '1';

    function initScrollScrub() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        setTimeout(initScrollScrub, 50);
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      var duration = video.duration || 8;
      var scrubEnd = window.innerWidth < 768 ? '150%' : '250%';

      gsap.timeline({
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: '+=' + scrubEnd,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          onUpdate: function (self) {
            var p = self.progress;

            // Scrub video to match scroll position
            video.currentTime = p * duration;

            // Hide scroll hint
            if (scrollHint) scrollHint.style.opacity = p > 0.05 ? '0' : '1';

          }
        }
      });
    }

    initScrollScrub();
  }

  // Wait for video to be ready
  if (video.readyState >= 2) {
    onVideoReady();
  } else {
    // Show loading progress
    video.addEventListener('progress', function () {
      if (loaderProgress && video.buffered.length > 0) {
        var pct = (video.buffered.end(0) / (video.duration || 8)) * 100;
        loaderProgress.style.width = pct + '%';
      }
    });

    video.addEventListener('canplaythrough', function () {
      onVideoReady();
    }, { once: true });

    // Fallback if canplaythrough never fires
    video.addEventListener('loadeddata', function () {
      setTimeout(onVideoReady, 500);
    }, { once: true });
  }
})();
