(() => {
  const data = window.APP_DATA;
  let selectedStore = "all";
  const storesFor = ids => selectedStore === "all" ? ids.map(id => data.stores[id].short).join(" & ") : data.stores[selectedStore].short;
  const showOffers = () => {
    const shown = data.offers.filter(offer => selectedStore === "all" || offer.stores.includes(selectedStore));
    document.querySelector("#offers").innerHTML = shown.map(offer => `<article class="offer-card ${offer.tone}"><div class="offer-main"><p class="group">${offer.group}</p><h3>${offer.product}</h3><p class="detail">${offer.size} · ${offer.unit}</p><p class="market-name">${storesFor(offer.stores)}</p></div><p class="price">${offer.price}</p></article>`).join("") || `<p class="empty">Für diesen Markt ist noch kein bestätigter Treffer gespeichert.</p>`;
    document.querySelector("#hit-count").textContent = `${shown.length} Treffer`;
  };
  document.querySelector("#watchlist").innerHTML = data.watchlist.map(name => {
    const found = data.offers.some(offer => offer.group === name);
    return `<div class="watch-item"><span>${name}</span><span class="pill ${found ? "found" : "open"}">${found ? "Angebot" : "wird geprüft"}</span></div>`;
  }).join("");
  document.querySelector("#week-label").textContent = `Angebotswoche ${data.week}`;
  document.querySelector("#status-copy").textContent = `Zuletzt geprüft: ${new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(data.capturedAt))}. Nur bestätigte Filialangebote.`;
  document.querySelectorAll(".market").forEach(button => button.addEventListener("click", () => {
    selectedStore = button.dataset.store;
    document.querySelectorAll(".market").forEach(item => item.classList.toggle("active", item === button));
    showOffers();
  }));
  showOffers();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js");
})();
