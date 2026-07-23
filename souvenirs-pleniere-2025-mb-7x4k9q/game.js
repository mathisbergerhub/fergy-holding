const PAGE_EXPIRY = Date.parse("2026-08-06T23:59:59+02:00");

const pageContent = document.querySelector("#page-content");
const agencyButtons = document.querySelectorAll("[data-agency-target]");
const showAllButton = document.querySelector("[data-show-all]");
const videos = document.querySelector("[data-videos]");
const videosTitle = document.querySelector("[data-videos-title]");
const downloadLinks = document.querySelectorAll("[data-agency]");

function showExpiredPage() {
  document.title = "Page expir\u00e9e | Fergy Holding";
  document.body.dataset.expired = "true";

  pageContent.className = "expired";
  pageContent.innerHTML = `
    <div class="expired__content">
      <img src="../assets/fergy-holding-logo.svg" alt="Fergy Holding">
      <h1>Cette page temporaire a expir\u00e9.</h1>
      <p>Les souvenirs de la pl\u00e9ni\u00e8re 2025 ne sont plus disponibles depuis cette adresse.</p>
    </div>
  `;
}

function checkExpiry() {
  if (Date.now() >= PAGE_EXPIRY) {
    showExpiredPage();
    return true;
  }

  return false;
}

function revealVideos(agency, agencyName) {
  agencyButtons.forEach((button) => {
    const isSelected = button.dataset.agencyTarget === agency;

    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  downloadLinks.forEach((link) => {
    link.hidden = agency !== "all" && link.dataset.agency !== agency;
  });

  videosTitle.textContent =
    agency === "all" ? "Tous les Fast & Curious" : `Fast & Curious \u00b7 ${agencyName}`;
  videos.hidden = false;
  videos.scrollIntoView({ behavior: "smooth", block: "start" });
}

if (!checkExpiry()) {
  agencyButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      revealVideos(button.dataset.agencyTarget, button.textContent.trim());
    });
  });

  showAllButton.addEventListener("click", () => revealVideos("all", ""));
  window.setInterval(checkExpiry, 60_000);
}
