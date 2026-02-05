/**
 * Utility functions for handling currency values.
 * Stores values in smallest currency unit (paise) as integers to avoid precision loss.
 */
export const convertToPaise = (amountRupees: number): number => {
  if (!Number.isFinite(amountRupees) || amountRupees < 0) {
    throw new Error("Amount must be a non-negative number");
  }
  // round to two decimals then convert to paise
  return Math.round(Number((amountRupees * 100).toFixed(0)));
};

export const convertToINR = (paise: number): number => {
  return paise / 100;
};

export const formatCurrencyINR = (paise: number): string => {
  const rupees = convertToINR(paise);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(rupees);
};
