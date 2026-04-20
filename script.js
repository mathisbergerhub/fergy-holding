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

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };

    reader.onerror = () => reject(new Error("Impossible de lire le fichier."));
    reader.readAsDataURL(file);
  });
}

if (careerForm) {
  const submitButton = careerForm.querySelector('button[type="submit"]');

  careerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(careerForm);
    const trapValue = String(formData.get("company") || "").trim();

    if (trapValue) {
      return;
    }

    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const entity = String(formData.get("entity") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const consent = formData.get("consent") === "on";
    const cv = formData.get("cv");

    if (!firstName || !lastName || !email) {
      setFormStatus("Merci de renseigner le prénom, le nom et l'email.", "error");
      return;
    }

    if (!(cv instanceof File) || cv.size === 0) {
      setFormStatus("Merci d'ajouter un CV au format PDF.", "error");
      return;
    }

    if (cv.type !== "application/pdf") {
      setFormStatus("Le CV doit être envoyé en PDF.", "error");
      return;
    }

    if (cv.size > 5 * 1024 * 1024) {
      setFormStatus("Le fichier dépasse la limite de 5 Mo.", "error");
      return;
    }

    if (!consent) {
      setFormStatus("Merci d'accepter le traitement des données avant l'envoi.", "error");
      return;
    }

    setFormStatus("Envoi en cours...", "pending");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    try {
      const payload = {
        firstName,
        lastName,
        email,
        phone,
        entity,
        message,
        consent,
        cvBase64: await fileToBase64(cv),
        cvName: cv.name,
        cvType: cv.type,
        cvSize: cv.size,
      };

      const response = await fetch("/api/candidature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || "Une erreur est survenue lors de l'envoi de la candidature."
        );
      }

      careerForm.reset();
      setFormStatus(
        "Votre candidature a bien été transmise. Merci.",
        "success"
      );
    } catch (error) {
      setFormStatus(error.message, "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    }
  });
}
