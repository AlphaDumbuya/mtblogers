// Human-friendly identifiers used across the fund.

function randomSuffix(len = 6) {
  return Math.random()
    .toString(36)
    .slice(2, 2 + len)
    .toUpperCase();
}

/** Contribution payment reference, e.g. MTB-202609-A1B2C3 */
export function contributionReference() {
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `MTB-${yyyymm}-${randomSuffix(6)}`;
}

/** Sequential-style code from a numeric counter, e.g. MTB-M-000123 */
export function paddedCode(prefix: string, n: number) {
  return `MTB-${prefix}-${String(n).padStart(6, "0")}`;
}

export function memberCode(n: number) {
  return paddedCode("M", n);
}

export function requestCode(n: number) {
  return paddedCode("R", n);
}

export function payoutCode(n: number) {
  return paddedCode("P", n);
}
