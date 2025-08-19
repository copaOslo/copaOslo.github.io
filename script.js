/* ---------- Loader handling ----------
   Viser loader til martini-GIF er ferdig.
   Lengden på GIF settes via data-duration-ms på <img>.
-------------------------------------- */
(function () {
  const loader = document.getElementById('loader');
  const gif = document.getElementById('loaderGif');

  const duration = Number(gif?.dataset?.durationMs || 3500); // fallback 3.5s

  gif.addEventListener('load', () => {
    setTimeout(() => {
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
      loader.setAttribute('aria-busy', 'false');
      setTimeout(() => loader.remove(), 450); // fade-out
    }, duration);
  });

  // Hvis GIF allerede er cached
  if (gif.complete) gif.dispatchEvent(new Event('load'));
})();

/* ---------- Footer Year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Instagram Slider ---------- */
const IG_USER_ID = '17841473184066916';
const IG_ACCESS_TOKEN = 'IGAAWAgNh9xbdBZAE1jYVN4dzBPbWhJMjNJa2VuNXlibkhxYkVfcWkyejlKeWlOUFA4OF9qeFVLRTV1VjBDUXdkeFRKNUpOaVM0Nnc2ekV6ZAmNIWUpweFZATMnY2X2MxejZAMWUw0MTlmR0k4UDE1WjhKdFdWNlNiRzRnazVtRGJXSQZDZD';
const IG_LIMIT = 12;

const IG_FIELDS = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp';
const IG_ENDPOINT = `https://graph.instagram.com/${IG_USER_ID}/media?fields=${IG_FIELDS}&access_token=${IG_ACCESS_TOKEN}&limit=${IG_LIMIT}`;

(async function loadInstagram() {
  const track = document.getElementById('ig-track');
  const dotsWrap = document.getElementById('ig-dots');
  const prevBtn = document.getElementById('ig-prev');
  const nextBtn = document.getElementById('ig-next');

  try {
    const res = await fetch(IG_ENDPOINT);
    if (!res.ok) throw new Error('Network');
    const data = await res.json();
    const items = (data.data || []).filter(Boolean);

    if (!items.length) throw new Error('Empty');

    // Bygg slides
    items.forEach(item => {
      const mediaUrl = item.media_type === 'VIDEO'
        ? (item.thumbnail_url || item.media_url)
        : item.media_url;

      const card = document.createElement('div');
      card.className = 'ig-card';

      const link = document.createElement('a');
      link.href = item.permalink;
      link.target = '_blank';
      link.rel = 'noopener';

      const img = document.createElement('img');
      img.src = mediaUrl;
      img.alt = item.caption || (item.media_type === 'VIDEO' ? 'Instagram video' : 'Instagram-bilde');

      link.appendChild(img);
      card.appendChild(link);
      track.appendChild(card);
    });

    // Slider
    const slides = Array.from(track.children);
    let index = 0;

    const update = () => {
      const slideWidth = slides[0].getBoundingClientRect().width;
      const sliderWidth = document.getElementById('ig-slider').getBoundingClientRect().width;
      const gap = 10;

      const offset = (sliderWidth / 2) - (slideWidth / 2) - (index * (slideWidth + gap));
      track.style.transform = `translate3d(${offset}px, 0, 0)`;

      dotsWrap.querySelectorAll('.ig-dot').forEach((d, i) =>
        d.setAttribute('aria-current', i === index ? 'true' : 'false')
      );
    };

    // Lag dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'ig-dot';
      dot.addEventListener('click', () => { index = i; update(); });
      dotsWrap.appendChild(dot);
    });

    // Navigasjon
    prevBtn.addEventListener('click', () => { index = Math.max(0, index - 1); update(); });
    nextBtn.addEventListener('click', () => { index = Math.min(slides.length - 1, index + 1); update(); });

    // Touch/drag
    let startX = 0, deltaX = 0, dragging = false;
    const slider = document.getElementById('ig-slider');
    const start = (x) => { dragging = true; startX = x; deltaX = 0; };
    const move = (x) => { if (!dragging) return; deltaX = x - startX; track.style.transform = `translate3d(calc(-${index} * 100% + ${deltaX}px),0,0)`; };
    const end = () => {
      if (!dragging) return;
      dragging = false;
      const threshold = 40;
      if (deltaX < -threshold && index < slides.length - 1) index++;
      if (deltaX > threshold && index > 0) index--;
      update();
    };

    slider.addEventListener('pointerdown', (e) => { slider.setPointerCapture(e.pointerId); start(e.clientX); });
    slider.addEventListener('pointermove', (e) => move(e.clientX));
    slider.addEventListener('pointerup', end);
    slider.addEventListener('pointercancel', end);
    window.addEventListener('resize', update);

    // Autoplay
    let autoplay = setInterval(() => { index = (index + 1) % slides.length; update(); }, 5000);
    slider.addEventListener('pointerdown', () => clearInterval(autoplay));

    // Init
    update();
  } catch (e) {
    document.getElementById('ig-error').hidden = false;
    console.warn('Instagram feed error:', e.message || e);
  }
})();

/* ---------- Contact Modal ---------- */
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
const formStatus = document.getElementById('formStatus');

document.getElementById('bookingForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  // Show loader state
  formStatus.hidden = false;
  formStatus.textContent = "Sending booking …";
  formStatus.className = "form-status loading";

  try {
    const res = await fetch("https://formspree.io/f/xrbljqlk", {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" }
    });

    if (res.ok) {
      form.reset();
      formStatus.textContent = "Your booking has been sent! <br> We’ll reach out to you shortly.";
      formStatus.className = "form-status success";

      // Hide modal after short delay
      // Hide modal after short delay
      setTimeout(() => {
        contactModal.classList.add("is-hiding");

        // Wait for CSS transition to finish, then fully hide + reset
        setTimeout(() => {
          contactModal.hidden = true;
          contactModal.classList.remove("is-hiding");
          formStatus.hidden = true;
        }, 400); // matches the CSS transition time
      }, 3000);
    } else {
      throw new Error("Network");
    }
  } catch (err) {
    formStatus.textContent = "Oops! Something went wrong. Please try again.";
    formStatus.className = "form-status error";
  }
});