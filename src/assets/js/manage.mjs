// @ts-check

import { initMessages } from "./messages.mjs";
import { enforcePattern, validateMinAmount } from "./validate.mjs";

function customAmountHandler() {
  const customTierRadio = /** @type {HTMLInputElement} */ (
    document.getElementById("tier-custom")
  );

  const customAmountInput = /** @type {HTMLInputElement} */ (
    document.getElementById("custom-amount")
  );

  enforcePattern(customAmountInput, /^(\d+(\.\d{0,2})?)?$/);

  customAmountInput.addEventListener("input", () => {
    customTierRadio.checked = true;
    validateMinAmount(customAmountInput);
  });
  customAmountInput.addEventListener("click", () => {
    customTierRadio.checked = true;
  });

  // Set required field for the custom amount depending on which tier is
  // selected.
  const radioButtons = /** @type {NodeListOf<HTMLInputElement>} */ (
    document.querySelectorAll(".tier-options input[type=radio]")
  );
  radioButtons.forEach((radioButton) => {
    radioButton.addEventListener("change", () => {
      customAmountInput.required = customTierRadio.checked;
    });
  });
}

function cancelFormHandler() {
  // Handle cancel button confirmation
  const cancelForm = /** @type {HTMLFormElement | null} */ (
    document.querySelector(".cancel-subscription-form")
  );
  if (!cancelForm) {
    // There is no cancel form if there is no current subscription.
    return;
  }

  const cancelButton = /** @type {HTMLButtonElement} */ (
    cancelForm.querySelector('button[type="submit"]')
  );

  let confirmClicked = false;
  const originalText = cancelButton.textContent || "Cancel Monthly Donation";

  cancelButton.addEventListener("click", (event) => {
    if (!confirmClicked) {
      event.preventDefault();
      confirmClicked = true;
      cancelButton.textContent = "Press again to confirm";
    }
  });

  // Reset if user clicks away
  cancelForm.addEventListener(
    "blur",
    () => {
      if (confirmClicked) {
        confirmClicked = false;
        cancelButton.textContent = originalText;
      }
    },
    true,
  );
}

document.addEventListener("DOMContentLoaded", () => {
  initMessages();
  customAmountHandler();
  cancelFormHandler();
});
