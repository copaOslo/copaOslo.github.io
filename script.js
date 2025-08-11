/* ---------- Loader handling ----------
   Show the loader until the martini GIF finishes.
   Since GIFs don't emit "ended" events, we use a configurable duration.
   Set the GIF's total length (ms) in the <img data-duration-ms="..."> attribute.
-------------------------------------- */

(function () {
  const loader = document.getElementById('loader');
  const gif = document.getElementById('loaderGif');

  const duration = Number(gif?.dataset?.durationMs || 3500); // fallback 3.5s

  // In case the GIF needs to be reloaded (e.g., cache), force restart:
  gif.addEventListener('load', () => {
    setTimeout(() => {
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
      loader.setAttribute('aria-busy', 'false');
      setTimeout(() => loader.remove(), 450); // allow fade-out
    }, duration);
  });

  // Trigger load if already cached
  if (gif.complete) gif.dispatchEvent(new Event
