// Page loader
(function () {
  var loader = document.querySelector('.loader');
  if (!loader) return;
  window.addEventListener('load', function () {
    setTimeout(function () { loader.classList.add('hidden'); }, 1200);
  });
})();
