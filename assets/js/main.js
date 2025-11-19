// Set current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("early-access");
const messageEl = document.getElementById("form-message");
const successBox = document.getElementById("success-state");
const submitBtn = document.getElementById("submit-btn");
const btnLabel = submitBtn.querySelector(".btn-label");
const btnSpinner = submitBtn.querySelector(".btn-spinner");

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

  if (hasClientErrors()) {
    showMessage("Please fill in all required fields.", "error");
    return;
  }

  // visual loading state
  submitBtn.disabled = true;
  submitBtn.classList.add("loading");

  try {
    const formData = new FormData(form);

    const res = await fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (res.ok) {
      // clear form, hide message, show success box
      form.reset();
      showMessage("");
      successBox.hidden = false;
      showMessage("You're on the list – check your inbox soon.", "ok");
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
