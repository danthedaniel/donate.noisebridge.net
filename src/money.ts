/**
 * HTML form data that can either be a preset dollar amount or one the user
 * typed in manually.
 */
export type AmountFormData =
  | { "amount-dollars": "custom"; "custom-amount": `${number}` }
  | { "amount-dollars": `${number}` };

export function validateAmountFormData(
  input: unknown,
): input is AmountFormData {
  console.log({ input });
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    console.log("A");
    return false;
  }

  if (!("amount-dollars" in input)) {
    console.log("B");
    return false;
  }
  if (typeof input["amount-dollars"] !== "string") {
    console.log("C");
    return false;
  }

  if (input["amount-dollars"] === "custom") {
    if (!("custom-amount" in input)) {
      console.log("D");
      return false;
    }
    if (typeof input["custom-amount"] !== "string") {
      console.log("E");
      return false;
    }

    const invalidAmount = Number.isNaN(parseFloat(input["custom-amount"]));
    return !invalidAmount;
  } else {
    const invalidAmount = Number.isNaN(parseFloat(input["amount-dollars"]));
    return !invalidAmount;
  }
}

/**
 * Get the string representation of a dollar amount from an `AmountFormData`.
 */
function getAmount(amountFormData: AmountFormData) {
  return amountFormData["amount-dollars"] === "custom"
    ? amountFormData["custom-amount"]
    : amountFormData["amount-dollars"];
}

/**
 * Tagged object to make financial mistakes less common.
 */
export interface Cents {
  cents: number;
}

export function parseToCents(
  amountFormData: string | AmountFormData,
): Cents | null {
  const parsedDollars = Number.parseFloat(
    typeof amountFormData === "string"
      ? amountFormData
      : getAmount(amountFormData),
  );
  if (Number.isNaN(parsedDollars)) {
    return null;
  }

  return { cents: Math.round(parsedDollars * 100) };
}
