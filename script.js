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
  if (gif.complete) gif.dispatchEvent(new Event('load'));
})();

/* ---------- Year in footer ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Instagram Feed ----------
   Uses Instafeed.js (Basic Display API).
   1) Create an Instagram App (Basic Display).
   2) Get your USER_ID and a long-lived ACCESS_TOKEN.
   3) Replace the placeholders below.
-------------------------------------- */

(function initInstagram() {
  const USER_ID = 'YOUR_USER_ID_HERE';
  const ACCESS_TOKEN = 'YOUR_LONG_LIVED_ACCESS_TOKEN_HERE';

  const target = document.getElementById('ig-feed');
  const fallback = document.getElementById('ig-fallback');

  if (!USER_ID || USER_ID.includes('YOUR_') || !ACCESS_TOKEN || ACCESS_TOKEN.includes('YOUR_')) {
    // Not configured yet — show fallback
    fallback.hidden = false;
    return;
  }

  const feed = new Instafeed({
    accessToken: ACCESS_TOKEN,
    userId: USER_ID,
    target: 'ig-feed',
    limit: 12,
    // Render function for full control & fast markup
    template:
      '<a href="{{link}}" class="ig-item" target="_blank" rel="noopener" aria-label="Åpne Instagram-innlegg">' +
      '<img title="{{caption}}" alt="{{caption}}" src="{{image}}" />' +
      '</a>',
    transform: function (item) {
      // Prefer high-res image if available
      item.image = (item.images && (item.images.standard_resolution || item.images.low_resolution)).url || item.image;
      return item;
    }
  });

  feed.on('error', function () {
    fallback.hidden = false;
  });

  feed.run();
})();
