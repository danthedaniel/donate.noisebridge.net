/**
 *
 * @param {HTMLInputElement} customAmountInput
 * @param {HTMLInputElement} customTierRadio
 */
export function activateCustomOnClick(customAmountInput, customTierRadio) {
  // Touch devices
  customAmountInput.addEventListener("touchend", (e) => {
    if (!customAmountInput.readOnly) {
      return;
    }

    e.preventDefault();
    customTierRadio.checked = true;
    customAmountInput.readOnly = false;
    customAmountInput.focus();
  });

  // Non-touch devices
  customAmountInput.addEventListener("click", () => {
    if (!customAmountInput.readOnly) {
      return;
    }

    customTierRadio.checked = true;
    customAmountInput.readOnly = false;
  });
}

/**
 * @param {NodeListOf<HTMLInputElement>} amountRadios
 * @param {HTMLInputElement} customAmountInput
 */
export function activateCustomOnRadio(amountRadios, customAmountInput) {
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
