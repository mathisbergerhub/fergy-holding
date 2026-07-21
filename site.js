const revealItems = document.querySelectorAll(".reveal");
const careerForm = document.querySelector("[data-career-form]");
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
  careerForm.addEventListener("reset", () => {
    customSelects.forEach((select) => {
      const placeholderOption = select.querySelector(
        '.custom-select__option[data-value=""]'
      );

      if (placeholderOption) {
        setCustomSelectValue(select, "", placeholderOption.textContent.trim());
      }
      closeCustomSelect(select);
    });
  });
}
