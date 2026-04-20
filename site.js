const revealItems = document.querySelectorAll(".reveal");
const careerForm = document.querySelector("[data-career-form]");
const formStatus = document.querySelector("[data-form-status]");

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
    const consent = formData.get("consent") === "on";

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

    if (!consent) {
      setFormStatus(
        "Merci d'accepter le traitement des donn\u00E9es avant l'envoi.",
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
