document.documentElement.classList.add("js");

// Reveal sections on scroll. Falls back to fully visible when the browser
// lacks IntersectionObserver or the user prefers reduced motion.
(function initReveal() {
  const revealables = document.querySelectorAll(".reveal");

  if (!revealables.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealables.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    // threshold 0 fires as soon as any part enters, so sections taller than
    // the viewport still reveal reliably.
    { rootMargin: "0px 0px -12% 0px", threshold: 0 }
  );

  revealables.forEach((element) => observer.observe(element));

  // Safety net: if anything is still hidden once the page has fully loaded
  // (e.g. an observer that never fired), reveal it so content is never lost.
  window.addEventListener("load", () => {
    window.setTimeout(() => {
      revealables.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          element.classList.add("is-visible");
        }
      });
    }, 400);
  });
})();

const careerForm = document.querySelector("[data-career-form]");
const formStatus = document.querySelector("[data-form-status]");
const submitButton = careerForm?.querySelector("[data-submit-button]");
const customSelects = document.querySelectorAll("[data-custom-select]");

function setFormStatus(message = "", state = "") {
  if (!formStatus) {
    return;
  }

  formStatus.hidden = !message;
  formStatus.textContent = message;

  if (state) {
    formStatus.dataset.state = state;
  } else {
    delete formStatus.dataset.state;
  }
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

function getCustomSelectOptions(select) {
  return Array.from(select.querySelectorAll(".custom-select__option"));
}

function openCustomSelect(select, requestedIndex) {
  const trigger = select.querySelector(".custom-select__trigger");
  const menu = select.querySelector(".custom-select__menu");
  const options = getCustomSelectOptions(select);

  customSelects.forEach((item) => {
    if (item !== select) {
      closeCustomSelect(item);
    }
  });

  select.classList.add("is-open");
  trigger?.setAttribute("aria-expanded", "true");

  if (menu) {
    menu.hidden = false;
  }

  if (!options.length || requestedIndex === false) {
    return;
  }

  const activeIndex = options.findIndex((option) =>
    option.classList.contains("is-active")
  );
  const focusIndex =
    typeof requestedIndex === "number"
      ? requestedIndex
      : Math.max(activeIndex, 0);

  options[Math.min(Math.max(focusIndex, 0), options.length - 1)]?.focus();
}

function setCustomSelectValue(select, value, label) {
  const input = select.querySelector('input[type="hidden"]');
  const valueNode = select.querySelector(".custom-select__value");
  const options = getCustomSelectOptions(select);

  if (input) {
    input.value = value;
  }

  if (valueNode) {
    valueNode.textContent = label;
  }

  options.forEach((option) => {
    const isSelected = option.dataset.value === value;

    option.classList.toggle("is-active", isSelected);
    option.setAttribute("aria-selected", String(isSelected));
  });
}

function chooseCustomSelectOption(select, option) {
  const trigger = select.querySelector(".custom-select__trigger");
  const optionLabel =
    option.querySelector("strong")?.textContent.trim() ||
    option.textContent.trim();

  setCustomSelectValue(select, option.dataset.value || "", optionLabel);
  closeCustomSelect(select);
  trigger?.focus();
}

function focusAdjacentOption(select, currentOption, direction) {
  const options = getCustomSelectOptions(select);
  const currentIndex = options.indexOf(currentOption);
  const nextIndex = (currentIndex + direction + options.length) % options.length;

  options[nextIndex]?.focus();
}

customSelects.forEach((select) => {
  const trigger = select.querySelector(".custom-select__trigger");
  const options = getCustomSelectOptions(select);
  const initialOption = select.querySelector(".custom-select__option.is-active");

  if (initialOption) {
    const initialLabel =
      initialOption.querySelector("strong")?.textContent.trim() ||
      initialOption.textContent.trim();

    setCustomSelectValue(
      select,
      initialOption.dataset.value || "",
      initialLabel
    );
  }

  trigger?.addEventListener("click", () => {
    const isOpen = select.classList.contains("is-open");

    if (isOpen) {
      closeCustomSelect(select);
    } else {
      openCustomSelect(select, false);
    }
  });

  trigger?.addEventListener("keydown", (event) => {
    const isOpen = select.classList.contains("is-open");

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openCustomSelect(
        select,
        event.key === "ArrowUp" ? options.length - 1 : undefined
      );
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && !isOpen) {
      event.preventDefault();
      openCustomSelect(select);
    }
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      chooseCustomSelectOption(select, option);
    });

    option.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusAdjacentOption(select, option, 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        focusAdjacentOption(select, option, -1);
      } else if (event.key === "Home") {
        event.preventDefault();
        options[0]?.focus();
      } else if (event.key === "End") {
        event.preventDefault();
        options.at(-1)?.focus();
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        chooseCustomSelectOption(select, option);
      } else if (event.key === "Escape") {
        event.preventDefault();
        closeCustomSelect(select);
        trigger?.focus();
      } else if (event.key === "Tab") {
        closeCustomSelect(select);
      }
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
    customSelects.forEach((select) => {
      if (select.classList.contains("is-open")) {
        closeCustomSelect(select);
        select.querySelector(".custom-select__trigger")?.focus();
      }
    });
  }
});

if (careerForm) {
  let isSubmitting = false;

  careerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!careerForm.reportValidity()) {
      return;
    }

    const formData = new FormData(careerForm);
    const trapValue = String(formData.get("_gotcha") || "").trim();

    if (trapValue) {
      return;
    }

    setFormStatus("Envoi en cours...", "pending");
    isSubmitting = true;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    try {
      const response = await fetch(careerForm.action, {
        method: careerForm.method || "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage =
          Array.isArray(data.errors) && data.errors.length
            ? data.errors.map((item) => item.message).join(" ")
            : "L'envoi n'a pas abouti. Merci de v\u00e9rifier les informations puis de r\u00e9essayer.";

        throw new Error(errorMessage);
      }

      careerForm.reset();
      customSelects.forEach((select) => {
        const placeholderOption = select.querySelector(
          '.custom-select__option[data-value=""]'
        );

        if (placeholderOption) {
          const placeholderLabel =
            placeholderOption.querySelector("strong")?.textContent.trim() ||
            placeholderOption.textContent.trim();

          setCustomSelectValue(select, "", placeholderLabel);
        }

        closeCustomSelect(select);
      });
      setFormStatus(
        "Votre candidature a bien \u00e9t\u00e9 transmise. Merci.",
        "success"
      );
    } catch (error) {
      const networkIssue =
        error instanceof TypeError ||
        /Failed to fetch|NetworkError|Load failed/i.test(
          String(error?.message || "")
        );

      if (networkIssue) {
        setFormStatus(
          "La transmission est momentan\u00e9ment indisponible. Merci de r\u00e9essayer dans quelques instants.",
          "error"
        );
      } else {
        setFormStatus(error.message, "error");
      }
    } finally {
      isSubmitting = false;

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    }
  });
}
