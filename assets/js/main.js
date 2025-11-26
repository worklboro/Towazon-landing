// Set current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("early-access");
const messageEl = document.getElementById("form-message");
const successBox = document.getElementById("success-state");
const submitBtn = document.getElementById("submit-btn");
const btnLabel = submitBtn.querySelector(".btn-label");
const btnSpinner = submitBtn.querySelector(".btn-spinner");
const SHEETDB_ENDPOINT = "https://sheetdb.io/api/v1/v3gqxp0dzd4fl";
const successModal = document.getElementById("success-modal");
const modalCloseBtn = document.getElementById("modal-close");
const modalCtaBtn = document.getElementById("modal-cta");

// simple modal helpers
function openModal() {
  if (!successModal) return;
  successModal.hidden = false;
  requestAnimationFrame(() => successModal.classList.add("visible"));
  document.body.classList.add("modal-open");
  (modalCtaBtn || modalCloseBtn)?.focus();
}

function closeModal() {
  if (!successModal) return;
  successModal.classList.remove("visible");
  document.body.classList.remove("modal-open");
  setTimeout(() => {
    if (!successModal.classList.contains("visible")) {
      successModal.hidden = true;
    }
  }, 220);
}

modalCloseBtn?.addEventListener("click", closeModal);
modalCtaBtn?.addEventListener("click", closeModal);
successModal?.addEventListener("click", (e) => {
  if (e.target === successModal) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && successModal && !successModal.hidden) {
    closeModal();
  }
});

// helper to show messages
function showMessage(text, type = "ok") {
  messageEl.textContent = text;
  messageEl.classList.remove("ok", "error");
  messageEl.classList.add(type);
}

// simple client-side validation for required fields
function hasClientErrors() {
  const requiredFields = form.querySelectorAll("[required]");
  for (const field of requiredFields) {
    if (field.type === "checkbox" && !field.checked) {
      field.focus();
      return true;
    }
    if (!field.value.trim()) {
      field.focus();
      return true;
    }
  }
  return false;
}

// submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  messageEl.textContent = "";

  // honeypot trap – if filled, ignore (bot)
  if (form.website && form.website.value) {
    return;
  }

  if (!SHEETDB_ENDPOINT || SHEETDB_ENDPOINT.includes("YOUR_SHEETDB_ID")) {
    showMessage("SheetDB endpoint not configured. Please add your SheetDB ID.", "error");
    return;
  }

  if (hasClientErrors()) {
    showMessage("Please fill in all required fields.", "error");
    return;
  }

  // visual loading state
  submitBtn.disabled = true;
  submitBtn.classList.add("loading");

  try {
    const formData = new FormData(form);
    const payload = {
      data: [
        {
          name: formData.get("name"),
          email: formData.get("email"),
          postcode: formData.get("postcode"),
          role: formData.get("role"),
          notes: formData.get("notes") || "",
          consent: formData.get("consent") ? "yes" : "no",
          submitted_at: new Date().toISOString(),
        },
      ],
    };

    const res = await fetch(SHEETDB_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      // clear form, hide message, show success box
      form.reset();
      showMessage("");
      successBox.hidden = false;
      showMessage("You're on the list – check your inbox soon.", "ok");
      openModal();
    } else {
      showMessage("Something went wrong sending your request. Please try again.", "error");
    }
  } catch (err) {
    console.error(err);
    showMessage("Network error – please check your connection and try again.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
  }
});
