// @ts-check

document.addEventListener('DOMContentLoaded', () => {
  const customAmountInput = /** @type {HTMLInputElement} */ (
    document.querySelector(".custom-amount-input")
  );

  const customTierRadio = /** @type {HTMLInputElement} */ (
    document.getElementById("tier-custom")
  );

  customAmountInput.addEventListener("input", () => {
    customTierRadio.checked = true;
  });
  customAmountInput.onclick = () => {
    customTierRadio.checked = true;
  };
});
