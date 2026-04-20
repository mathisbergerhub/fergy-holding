const revealItems = document.querySelectorAll(".reveal");
const careerForm = document.querySelector("[data-career-form]");
const formStatus = document.querySelector("[data-form-status]");
const customSelects = document.querySelectorAll("[data-custom-select]");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

function setFormStatus(message, state) {
  if (!formStatus) {
    return;
  }

  formStatus.textContent = message;
  formStatus.dataset.state = state;
}

function closeCustomSelect(select) {
  const trigger = select.querySelector(".custom-select__trigger");
  const menu = select.querySelector(".custom-select__menu");

  select.classList.remove("is-open");
  trigger?.setAttribute("aria-expanded", "false");

  if (menu) {
    menu.hidden = true;
  }
}

function setCustomSelectValue(select, value, label) {
  const input = select.querySelector('input[type="hidden"]');
  const valueNode = select.querySelector(".custom-select__value");
  const options = select.querySelectorAll(".custom-select__option");

  if (input) {
    input.value = value;
  }

  if (valueNode) {
    valueNode.textContent = label;
  }

  options.forEach((option) => {
    option.classList.toggle("is-active", option.dataset.value === value);
  });
}

customSelects.forEach((select) => {
  const trigger = select.querySelector(".custom-select__trigger");
  const menu = select.querySelector(".custom-select__menu");
  const options = select.querySelectorAll(".custom-select__option");
  const initialOption = select.querySelector(".custom-select__option.is-active");

  if (initialOption) {
    setCustomSelectValue(
      select,
      initialOption.dataset.value || "",
      initialOption.textContent.trim()
    );
  }

  trigger?.addEventListener("click", () => {
    const isOpen = select.classList.contains("is-open");

    customSelects.forEach((item) => closeCustomSelect(item));

    if (!isOpen) {
      select.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      if (menu) {
        menu.hidden = false;
      }
    }
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      setCustomSelectValue(
        select,
        option.dataset.value || "",
        option.textContent.trim()
      );
      closeCustomSelect(select);
      trigger?.focus();
    });
  });
});

document.addEventListener("click", (event) => {
  customSelects.forEach((select) => {
    if (!select.contains(event.target)) {
      closeCustomSelect(select);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    customSelects.forEach((select) => closeCustomSelect(select));
  }
});

if (careerForm) {
  const submitButton = careerForm.querySelector('button[type="submit"]');

  careerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(careerForm);
    const trapValue = String(formData.get("company") || "").trim();
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const profileLink = String(formData.get("profileLink") || "").trim();
    const privacyAcknowledgement =
      formData.get("privacyAcknowledgement") === "on";

    if (trapValue) {
      return;
    }

    if (!firstName || !lastName || !email) {
      setFormStatus(
        "Merci de renseigner le pr\u00E9nom, le nom et l'email.",
        "error"
      );
      return;
    }

    if (profileLink && !/^https?:\/\//i.test(profileLink)) {
      setFormStatus(
        "Merci d'indiquer un lien complet commen\u00E7ant par https://",
        "error"
      );
      return;
    }

    if (!privacyAcknowledgement) {
      setFormStatus(
        "Merci de confirmer la prise de connaissance des mentions l\u00E9gales avant l'envoi.",
        "error"
      );
      return;
    }

    setFormStatus("Envoi en cours...", "pending");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    try {
      const response = await fetch(careerForm.action, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.errors?.[0]?.message ||
            data.error ||
            "Une erreur est survenue lors de l'envoi de la candidature."
        );
      }

      careerForm.reset();
      customSelects.forEach((select) => {
        const placeholderOption = select.querySelector('.custom-select__option[data-value=""]');

        if (placeholderOption) {
          setCustomSelectValue(
            select,
            "",
            placeholderOption.textContent.trim()
          );
        }
      });
      setFormStatus(
        "Votre candidature a bien \u00E9t\u00E9 transmise. Merci.",
        "success"
      );
    } catch (error) {
      setFormStatus(
        error?.message ||
          "L'envoi n'a pas pu aboutir. Merci de r\u00E9essayer dans quelques instants.",
        "error"
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    }
  });
}
