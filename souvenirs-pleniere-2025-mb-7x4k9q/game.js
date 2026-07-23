const PAGE_EXPIRY = Date.parse("2026-08-06T23:59:59+02:00");

const locations = {
  annecy: {
    name: "Annecy",
    agencies: [
      { id: "caseo-annecy", name: "Cas\u00e9o" },
      { id: "cb-annecy", name: "Carrelage et Bain" },
      { id: "md-renov-annecy", name: "MD R\u00e9nov'" },
    ],
  },
  chalon: {
    name: "Chalon-sur-Sa\u00f4ne",
    agencies: [{ id: "caseo-chalon", name: "Cas\u00e9o" }],
  },
  chambery: {
    name: "Chamb\u00e9ry",
    agencies: [{ id: "caseo-chambery", name: "Cas\u00e9o" }],
  },
  chaponost: {
    name: "Chaponost",
    agencies: [{ id: "caseo-chaponost", name: "Cas\u00e9o" }],
  },
  grenoble: {
    name: "Grenoble",
    agencies: [
      { id: "caseo-grenoble", name: "Cas\u00e9o" },
      { id: "cb-grenoble", name: "Carrelage et Bain" },
    ],
  },
  macon: {
    name: "M\u00e2con",
    agencies: [{ id: "caseo-macon", name: "Cas\u00e9o" }],
  },
  montpellier: {
    name: "Montpellier",
    agencies: [{ id: "caseo-montpellier", name: "Cas\u00e9o" }],
  },
  "saint-priest": {
    name: "Saint-Priest",
    agencies: [{ id: "caseo-saint-priest", name: "Cas\u00e9o" }],
  },
};

const pageContent = document.querySelector("#page-content");
const locationButtons = document.querySelectorAll("[data-location-target]");
const directButtons = document.querySelectorAll("[data-agency-direct]");
const entityPicker = document.querySelector("[data-entity-picker]");
const entityTitle = document.querySelector("[data-entity-title]");
const entityList = document.querySelector("[data-entity-list]");
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
      <img src="/assets/fergy-holding-logo.svg" alt="Fergy Holding">
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

function setPressed(buttons, selectedButton) {
  buttons.forEach((button) => {
    const isSelected = button === selectedButton;

    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function revealVideos(agency, agencyName) {
  downloadLinks.forEach((link) => {
    link.hidden = agency !== "all" && link.dataset.agency !== agency;
  });

  videosTitle.textContent =
    agency === "all" ? "Tous les Fast & Curious" : `Fast & Curious \u00b7 ${agencyName}`;
  videos.hidden = false;
  videos.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showAgencyChoices(location) {
  entityList.replaceChildren();
  entityTitle.textContent = `Choisissez votre enseigne \u00e0 ${location.name}`;

  location.agencies.forEach((agency) => {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = agency.name;
    button.addEventListener("click", () => {
      setPressed(entityList.querySelectorAll("button"), button);
      revealVideos(agency.id, `${agency.name} ${location.name}`);
    });
    entityList.append(button);
  });

  videos.hidden = true;
  entityPicker.hidden = false;
  entityList.querySelector("button").focus();
}

function selectLocation(button) {
  const location = locations[button.dataset.locationTarget];

  setPressed(locationButtons, button);
  setPressed(directButtons, null);

  if (location.agencies.length > 1) {
    showAgencyChoices(location);
    return;
  }

  entityPicker.hidden = true;
  revealVideos(
    location.agencies[0].id,
    `${location.agencies[0].name} ${location.name}`,
  );
}

if (!checkExpiry()) {
  setPressed(locationButtons, null);
  setPressed(directButtons, null);

  locationButtons.forEach((button) => {
    button.addEventListener("click", () => selectLocation(button));
  });

  directButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setPressed(locationButtons, null);
      setPressed(directButtons, button);
      entityPicker.hidden = true;
      revealVideos(button.dataset.agencyDirect, button.textContent.trim());
    });
  });

  showAllButton.addEventListener("click", () => {
    setPressed(locationButtons, null);
    setPressed(directButtons, null);
    entityPicker.hidden = true;
    revealVideos("all", "");
  });

  window.setInterval(checkExpiry, 60_000);
}
