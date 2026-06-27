(function () {
  var video = document.getElementById('heroVideo');
  if (!video) return;

  var scrollHint = document.querySelector('.hero__scroll-hint');
  var loader = document.querySelector('.loader');
  var started = false;

  video.currentTime = 0;

  function start() {
    if (started) return;
    started = true;

    if (loader) loader.classList.add('hidden');

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      started = false;
      return setTimeout(start, 50);
    }

    gsap.registerPlugin(ScrollTrigger);

    var duration = video.duration || 8;
    var isMobile = window.innerWidth < 768;

    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: isMobile ? '+=200%' : '+=300%',
      pin: true,
      pinSpacing: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: function (self) {
        video.currentTime = self.progress * duration;
        if (scrollHint) scrollHint.style.opacity = self.progress < 0.03 ? '1' : '0';
      }
    });
  }

  if (video.readyState >= 2) {
    start();
  } else {
    video.addEventListener('loadeddata', start, { once: true });
    setTimeout(start, 4000);
  }
})();
