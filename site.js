document.documentElement.classList.add("js");

const revealItems = document.querySelectorAll(".reveal");
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
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
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
      const optionLabel =
        option.querySelector("strong")?.textContent.trim() ||
        option.textContent.trim();

      setCustomSelectValue(select, option.dataset.value || "", optionLabel);
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
