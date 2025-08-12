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

/* ------------ Instagram Slider (vanilla) ------------- */
/* 1) Fill these with your values (from Basic Display API setup) */
const IG_USER_ID = '17841473184066916';
const IG_ACCESS_TOKEN = 'IGAAWAgNh9xbdBZAE1jYVN4dzBPbWhJMjNJa2VuNXlibkhxYkVfcWkyejlKeWlOUFA4OF9qeFVLRTV1VjBDUXdkeFRKNUpOaVM0Nnc2ekV6ZAmNIWUpweFZATMnY2X2MxejZAMWUw0MTlmR0k4UDE1WjhKdFdWNlNiRzRnazVtRGJXSQZDZD';
/* How many posts to load */
const IG_LIMIT = 12;

/* 2) Build request */
const IG_FIELDS = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp';
const IG_ENDPOINT = `https://graph.instagram.com/${IG_USER_ID}/media?fields=${IG_FIELDS}&access_token=${IG_ACCESS_TOKEN}&limit=${IG_LIMIT}`;

(async function loadInstagram() {
  const track = document.getElementById('ig-track');
  const dotsWrap = document.getElementById('ig-dots');
  const prevBtn = document.getElementById('ig-prev');
  const nextBtn = document.getElementById('ig-next');
  const errorBox = document.getElementById('ig-error');

  try {
    if (!IG_USER_ID || IG_USER_ID.startsWith('YOUR_') || !IG_ACCESS_TOKEN || IG_ACCESS_TOKEN.startsWith('YOUR_')) {
      throw new Error('Not configured');
    }

    const res = await fetch(IG_ENDPOINT);
    if (!res.ok) throw new Error('Network');
    const data = await res.json();
    const items = (data.data || []).filter(Boolean);

    if (!items.length) throw new Error('Empty');

    // Create slides
    items.forEach(item => {
      const mediaUrl = item.media_type === 'VIDEO' ? (item.thumbnail_url || item.media_url) : item.media_url;
      const card = document.createElement('div');
      card.className = 'ig-card';

      const link = document.createElement('a');
      link.href = item.permalink;
      link.target = '_blank';
      link.rel = 'noopener';
      card.appendChild(link);

      if (item.media_type === 'VIDEO') {
        const img = document.createElement('img');
        img.src = mediaUrl;
        img.alt = (item.caption || 'Instagram video');
        card.appendChild(img);
      } else {
        const img = document.createElement('img');
        img.src = mediaUrl;
        img.alt = (item.caption || 'Instagram-bilde');
        card.appendChild(img);
      }
      track.appendChild(card);
    });

    // Slider logic
    const slides = Array.from(track.children);
    let index = 0;
    const update = () => {
      const width = slides[0].getBoundingClientRect().width + 10; // card + gap
      track.style.transform = `translate3d(calc(-${index} * ${width}px), 0, 0)`;
      dotsWrap.querySelectorAll('.ig-dot').forEach((d, i) => d.setAttribute('aria-current', i === index ? 'true' : 'false'));
    };

    // Dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'ig-dot';
      dot.addEventListener('click', () => { index = i; update(); });
      dotsWrap.appendChild(dot);
    });

    // Nav
    prevBtn.addEventListener('click', () => { index = Math.max(0, index - 1); update(); });
    nextBtn.addEventListener('click', () => { index = Math.min(slides.length - 1, index + 1); update(); });

    // Touch / drag
    let startX = 0, deltaX = 0, dragging = false;
    const slider = document.getElementById('ig-slider');
    const start = (x) => { dragging = true; startX = x; deltaX = 0; };
    const move = (x) => { if (!dragging) return; deltaX = x - startX; track.style.transform = `translate3d(calc(-${index} * 100% + ${deltaX}px),0,0)`; };
    const end  = () => {
      if (!dragging) return;
      dragging = false;
      const threshold = 40;
      if (deltaX < -threshold && index < slides.length - 1) index++;
      if (deltaX >  threshold && index > 0) index--;
      update();
    };

    slider.addEventListener('pointerdown', (e) => { slider.setPointerCapture(e.pointerId); start(e.clientX); });
    slider.addEventListener('pointermove', (e) => move(e.clientX));
    slider.addEventListener('pointerup', end);
    slider.addEventListener('pointercancel', end);
    window.addEventListener('resize', update);

    // Autoplay (optional)
    let autoplay = setInterval(() => { index = (index + 1) % slides.length; update(); }, 5000);
    slider.addEventListener('pointerdown', () => clearInterval(autoplay));

    // Initial
    update();
  } catch (e) {
    document.getElementById('ig-error').hidden = false;
    console.warn('Instagram feed error:', e.message || e);
  }
})();

// --- Contact Modal Logic ---
const contactBtn = document.getElementById('contactBtn');
const contactModal = document.getElementById('contactModal');
const closeContact = document.getElementById('closeContact');

contactBtn.addEventListener('click', e => {
  e.preventDefault();
  contactModal.hidden = false;
});
closeContact.addEventListener('click', () => contactModal.hidden = true);
contactModal.querySelector('.contact-overlay').addEventListener('click', () => contactModal.hidden = true);

// --- Form submission ---
const bookingNotice = document.getElementById('bookingNotice');

document.getElementById('bookingForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const res = await fetch("https://formspree.io/f/xrbljqlk", {
    method: "POST",
    body: formData,
    headers: { "Accept": "application/json" }
  });

  if (res.ok) {
    form.reset();
    contactModal.hidden = true;

    // Show notice
    bookingNotice.hidden = false;
    // Hide notice after animation completes (4s in CSS)
    setTimeout(() => {
      bookingNotice.hidden = true;
    }, 4000);

  } else {
    alert("Oops! Noe gikk galt. Prøv igjen.");
  }
});
