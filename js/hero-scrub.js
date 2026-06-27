// Simple video background - auto-plays, no scroll scrub
(function () {
  var video = document.getElementById('heroVideo');
  var loader = document.querySelector('.loader');

  if (!video) return;

  function onReady() {
    if (loader) loader.classList.add('hidden');
    video.play().catch(function () {});
  }

  if (video.readyState >= 2) {
    onReady();
  } else {
    video.addEventListener('canplay', onReady, { once: true });
    setTimeout(onReady, 3000);
  }
})();
