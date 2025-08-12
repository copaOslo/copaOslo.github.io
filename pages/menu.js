// Loader logic
(function () {
    const loader = document.getElementById('loader');
    const gif = document.getElementById('loaderGif');
  
    const duration = Number(gif?.dataset?.durationMs || 3500); // fallback 3.5s
  
    gif.addEventListener('load', () => {
      setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        loader.setAttribute('aria-busy', 'false');
        setTimeout(() => loader.remove(), 450); // allow fade-out
      }, duration);
    });
  
    if (gif.complete) gif.dispatchEvent(new Event('load'));
  })();
  
  // Footer year update
  document.getElementById('year').textContent = new Date().getFullYear();
  