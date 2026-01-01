// @ts-check

import { initMessages } from "./messages.mjs";
import { enforcePattern, validateMinAmount } from "./validate.mjs";

function handleCustomInput() {
  const customAmountInput = /** @type {HTMLInputElement} */ (
    document.getElementById("custom-amount")
  );
  const amountRadios = /** @type {NodeListOf<HTMLInputElement>} */ (
    document.querySelectorAll('input[name="amount-dollars"]')
  );

  const customAmountRadio = /** @type {HTMLInputElement} */ (
    document.getElementById("amount-custom")
  );

  // Switch to custom amount when the input box is clicked
  customAmountInput.addEventListener("click", () => {
    if (!customAmountInput.readOnly) {
      return;
    }

    customAmountRadio.click();
  });

  enforcePattern(customAmountInput, /^(\d+(\.\d{0,2})?)?$/);

  // Validate min amount on input
  customAmountInput.addEventListener("input", () => {
    validateMinAmount(customAmountInput);
  });

  amountRadios.forEach((radio) => {
    /** @type {(event: Event) => void} */
    const eventHandler = (event) => {
      const radio = /** @type {HTMLInputElement} */ (event.target);

      if (radio.value === "custom" && radio.checked) {
        customAmountInput.readOnly = false;
        customAmountInput.focus();
      } else {
        customAmountInput.readOnly = true;
        customAmountInput.setCustomValidity("");
      }
    };

    radio.addEventListener("input", eventHandler);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMessages();
  handleCustomInput();
});
