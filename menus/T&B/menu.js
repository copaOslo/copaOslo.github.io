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

// Data -> add/remove drinks freely
const cocktails = [
  { name: "Nordic Chill", spirit: "Absolut Vodka" },
  { name: "Green Byte", spirit: "Absolut Vodka" },
  { name: "Golden Hour", spirit: "Absolut Vodka" },
  { name: "Dark Syntax", spirit: "Jack Daniel's Whiskey" },
  { name: "Tropical Merge", spirit: "Bacardi Carta Blanca" },
  { name: "Sunset Drift", spirit: "Bacardi Carta Blanca" },
  { name: "Gordon’s Garden", spirit: "Special London Dry Gin" }
];

// Group by spirit and render
(function renderCocktailGroups() {
  const groups = cocktails.reduce((acc, d) => {
    (acc[d.spirit] ||= []).push(d);
    return acc;
  }, {});

  // Optional: order of sections
  const order = ["Vodka", "Whiskey", "Rum", "Gin", "Tequila"];
  const spirits = Object.keys(groups).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  );

  const root = document.getElementById("cocktail-groups");
  root.innerHTML = spirits.map(spirit => `
      <div class="spirit">
        <h3 class="spirit-title">${spirit}</h3>
        <ul class="spirit-list">
          ${groups[spirit].map(d => `
            <li>
              ${d.name}${d.brand ? ` <span class="spirit">– ${d.brand}</span>` : ""}
            </li>
          `).join("")}
        </ul>
      </div>
    `).join("");
})();

// Data for wines & shots
const winesAndShots = [
  // Red
  { name: "JP. Chenet Cabernet–Syrah", type: "Red wine" },
  // White
  { name: "Matua Sauvignon Blanc", type: "White wine" }
];

const beer = ["Kronenbourg 1664 Blanc"];
const shot = ["Tequila Rose"];

(function renderWineGroups() {
  const groups = winesAndShots.reduce((m, x) => {
    (m[x.type] ||= []).push(x);
    return m;
  }, {});

  // Display order
  const order = ["Red wine", "White wine"];

  const html = order
    .filter(k => groups[k]?.length)
    .map(k => `
        <div class="spirit">
          <h3 class="spirit-title">${k}</h3>
          <ul class="spirit-list">
            ${groups[k].map(i => `<li>${i.name}</li>`).join("")}
          </ul>
        </div>
      `).join("");

  const beerHtml = beer.length
    ? `<div class="spirit"><h3 class="spirit-title">Beer</h3>
           <ul class="spirit-list">${beer.map(b => `<li>${b}</li>`).join("")}</ul>
         </div>`
    : "";

  const shotHtml = shot.length
    ? `<div class="spirit"><h3 class="spirit-title">Shots</h3>
           <ul class="spirit-list">${shot.map(b => `<li>${b}</li>`).join("")}</ul>
         </div>`
    : "";

  document.getElementById("wine-groups").innerHTML = html + beerHtml + shotHtml;
})();

// Mocktail data: tweak names/notes as you like
const mocktails = [
  { name: "Golden Ray", group: "Tropical & Bright" },
  { name: "Solar Glow", group: "Tropical & Bright" },
  { name: "Blush Serenade", group: "Floral & Sweet" },
  { name: "Velvet Bloom", group: "Floral & Sweet" },
  { name: "Crimson Whisper", group: "Floral & Sweet" },
  { name: "Emerald Spirit", group: "Vibrant & Fresh" },
  { name: "Azure Mist", group: "Vibrant & Fresh" }
];

(function renderMocktailGroups() {
  // Group by category
  const byGroup = mocktails.reduce((acc, d) => {
    (acc[d.group] ||= []).push(d);
    return acc;
  }, {});

  // Display order
  const order = ["Tropical & Bright", "Floral & Sweet", "Vibrant & Fresh"];

  const html = order
    .filter(g => byGroup[g]?.length)
    .map(g => `
  <div class="spirit">
    <h3 class="spirit-title">${g}</h3>
    <ul class="spirit-list">
      ${byGroup[g].map(d => `
              <li>${d.name}${d.note ? ` <span class="spirit">– ${d.note}</span>` : ""}</li>
            `).join("")}
    </ul>
  </div>
  `).join("");

  document.getElementById("mocktail-groups").innerHTML = html;
})();