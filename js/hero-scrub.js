(function () {
  var video = document.getElementById('heroVideo');
  if (!video) return;

  var heroContent = document.querySelector('.hero__content');
  var scrollHint = document.querySelector('.hero__scroll-hint');
  var loader = document.querySelector('.loader');
  var overlay = document.querySelector('.hero__overlay');

  video.currentTime = 0;

  function start() {
    if (loader) loader.classList.add('hidden');
    if (scrollHint) scrollHint.style.opacity = '1';

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
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
        var p = self.progress;
        video.currentTime = p * duration;
        if (scrollHint) scrollHint.style.opacity = p < 0.03 ? '1' : '0';
        if (overlay) overlay.style.opacity = String(1 - p * 0.6);
        if (heroContent) {
          if (p >= 0.85) {
            heroContent.classList.add('is-revealed');
          } else {
            heroContent.classList.remove('is-revealed');
          }
        }
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
