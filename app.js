(() => {
  const API_URL = "https://angebot-daten.ta-froelian.workers.dev/api/offers";
  const fallbackData = window.APP_DATA;
  let data = fallbackData;
  let selectedStore = "all";

  const storesFor = ids => selectedStore === "all"
    ? ids.map(id => data.stores[id].short).join(" & ")
    : data.stores[selectedStore].short;

  const updateStatus = live => {
    const dateValue = data.updatedAt || data.capturedAt;
    const date = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(dateValue));
    document.querySelector("#status-copy").textContent = live
      ? `Aktuell aus dem Angebotsdienst: ${date}. Nur bestätigte Filialangebote.`
      : `Letzter gespeicherter Stand: ${date}. Die Cloud-Aktualisierung ist gerade nicht erreichbar.`;
  };

  const render = live => {
    document.querySelector("#week-label").textContent = `Angebotswoche ${data.week}`;
    const shown = data.offers.filter(offer => selectedStore === "all" || offer.stores.includes(selectedStore));
    document.querySelector("#offers").innerHTML = shown.map(offer =>
      `<article class="offer-card ${offer.tone}"><div class="offer-main"><p class="group">${offer.group}</p><h3>${offer.product}</h3><p class="detail">${offer.size} · ${offer.unit}</p><p class="market-name">${storesFor(offer.stores)}</p></div><p class="price">${offer.price}</p></article>`
    ).join("") || `<p class="empty">Für diesen Markt ist noch kein bestätigter Treffer gespeichert.</p>`;
    document.querySelector("#hit-count").textContent = `${shown.length} Treffer`;
    document.querySelector("#watchlist").innerHTML = data.watchlist.map(name => {
      const found = data.offers.some(offer => offer.group === name);
      return `<div class="watch-item"><span>${name}</span><span class="pill ${found ? "found" : "open"}">${found ? "Angebot" : "wird geprüft"}</span></div>`;
    }).join("");
    updateStatus(live);
  };

  document.querySelectorAll(".market").forEach(button => button.addEventListener("click", () => {
    selectedStore = button.dataset.store;
    document.querySelectorAll(".market").forEach(item => item.classList.toggle("active", item === button));
    render(data !== fallbackData);
  }));

  let installPrompt;
  const installButton = document.querySelector("#install-button");
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });
  installButton.addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = undefined;
    installButton.hidden = true;
  });

  render(false);
  fetch(API_URL, { cache: "no-store" })
    .then(response => response.ok ? response.json() : Promise.reject(new Error("API nicht erreichbar")))
    .then(current => {
      if (!current.offers || !current.stores) throw new Error("ungültige Angebotsdaten");
      data = { ...fallbackData, ...current };
      render(true);
    })
    .catch(() => render(false));

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js");
})();
