const items = [
  { label: "1 cent", cents: 1, type: "coin" },
  { label: "2 cent", cents: 2, type: "coin" },
  { label: "5 cent", cents: 5, type: "coin" },
  { label: "10 cent", cents: 10, type: "coin" },
  { label: "20 cent", cents: 20, type: "coin" },
  { label: "50 cent", cents: 50, type: "coin" },
  { label: "€ 1", cents: 100, type: "coin" },
  { label: "€ 2", cents: 200, type: "coin" },
  { label: "€ 5", cents: 500, type: "note" },
  { label: "€ 10", cents: 1000, type: "note" },
  { label: "€ 20", cents: 2000, type: "note" },
  { label: "€ 50", cents: 5000, type: "note" },
  { label: "€ 100", cents: 10000, type: "note" },
  { label: "€ 200", cents: 20000, type: "note" },
  { label: "€ 500", cents: 50000, type: "note" }
];
const STORAGE_KEY = "euro-teller-counts-v1";
let counts = items.map(() => 0);
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (Array.isArray(saved) && saved.length === items.length) {
    counts = saved.map(n => Number.isSafeInteger(n) && n >= 0 ? n : 0);
  }
} catch (_) {}

const euro = cents => (cents / 100).toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
const totalCents = () => counts.reduce((sum, count, i) => sum + count * items[i].cents, 0);
const coins = document.querySelector("#coins");
const notes = document.querySelector("#notes");

function makeCard(item, index) {
  const card = document.createElement("article");
  card.className = "money-card";
  card.innerHTML = `
    <div class="money-top">
      <span class="denomination"></span>
      <span class="count"></span>
    </div>
    <p class="subtotal"></p>
    <div class="controls">
      <button class="minus" type="button" aria-label="Eén ${item.label} aftrekken">−</button>
      <button class="plus" type="button" aria-label="Eén ${item.label} toevoegen">+</button>
    </div>`;
  card.querySelector(".denomination").textContent = item.label;
  card.querySelector(".minus").addEventListener("click", () => change(index, -1));
  card.querySelector(".plus").addEventListener("click", () => change(index, 1));
  return card;
}

const cards = items.map((item, i) => {
  const card = makeCard(item, i);
  (item.type === "coin" ? coins : notes).append(card);
  return card;
});

function change(index, amount) {
  counts[index] = Math.max(0, counts[index] + amount);
  saveAndRender();
}
function saveAndRender() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(counts)); } catch (_) {}
  render();
}
function render() {
  const total = totalCents();
  document.querySelector("#total").textContent = euro(total);
  document.querySelector("#summaryTotal").textContent = euro(total);
  document.querySelector("#pieceCount").textContent =
    `${counts.reduce((a, b) => a + b, 0)} stuks geld`;
  cards.forEach((card, i) => {
    card.querySelector(".count").textContent = `${counts[i]}×`;
    card.querySelector(".subtotal").textContent = euro(counts[i] * items[i].cents);
    card.querySelector(".minus").disabled = counts[i] === 0;
  });
  const rows = document.querySelector("#summaryRows");
  rows.replaceChildren();
  const active = items.map((item, i) => ({ item, count: counts[i] })).filter(x => x.count > 0);
  if (!active.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Er is nog geen geld geteld.";
    rows.append(empty);
  } else {
    active.forEach(({ item, count }) => {
      const row = document.createElement("div");
      row.className = "summary-row";
      const label = document.createElement("span");
      const value = document.createElement("strong");
      label.textContent = `${item.label} × ${count}`;
      value.textContent = euro(item.cents * count);
      row.append(label, value);
      rows.append(row);
    });
  }
}
document.querySelector("#reset").addEventListener("click", () => {
  if (counts.every(n => n === 0) || confirm("Weet je zeker dat je alle tellingen wilt resetten?")) {
    counts = items.map(() => 0);
    saveAndRender();
  }
});
document.querySelector("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("euro-teller-theme", document.body.classList.contains("dark") ? "dark" : "light");
});
if (localStorage.getItem("euro-teller-theme") === "dark") document.body.classList.add("dark");
render();
