/**
 * Retail barcodes: EAN-13, EAN-8, UPC-A and UPC-E. Open Food Facts keys its
 * products by the digits as printed, and a UPC-A is an EAN-13 with a leading 0,
 * so a lookup tries the code as scanned, then its EAN-13 form.
 */

/** GS1 check digit of the digits before it. */
export function checkDigit(body: string): number {
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    const d = Number(body[body.length - 1 - i]);
    sum += i % 2 === 0 ? d * 3 : d;
  }
  return (10 - (sum % 10)) % 10;
}

export function validCheckDigit(code: string): boolean {
  if (!/^\d{8}$|^\d{12,14}$/.test(code)) return false;
  return checkDigit(code.slice(0, -1)) === Number(code.at(-1));
}

/** A UPC-E (8 digits, number system 0 or 1) expanded to its UPC-A. */
export function upcEToA(code: string): string | null {
  if (!/^[01]\d{7}$/.test(code)) return null;
  const [ns, d1, d2, d3, d4, d5, d6, check] = code.split("") as [string, ...string[]];
  let body: string;
  switch (d6) {
    case "0":
    case "1":
    case "2":
      body = `${d1}${d2}${d6}0000${d3}${d4}${d5}`;
      break;
    case "3":
      body = `${d1}${d2}${d3}00000${d4}${d5}`;
      break;
    case "4":
      body = `${d1}${d2}${d3}${d4}00000${d5}`;
      break;
    default:
      body = `${d1}${d2}${d3}${d4}${d5}0000${d6}`;
  }
  const upcA = `${ns}${body}${check}`;
  return validCheckDigit(upcA) ? upcA : null;
}

/** Digits only, or null when it cannot be a retail barcode. */
export function cleanCode(raw: string): string | null {
  const code = raw.replace(/[\s-]/g, "");
  return /^\d{8}$|^\d{12,14}$/.test(code) ? code : null;
}

/**
 * The codes to look up, most likely first: as scanned, then the 13-digit form
 * (UPC-A with a 0 in front, UPC-E expanded first), then without the zeros a
 * GTIN-14 pads with.
 */
export function lookupCodes(raw: string): string[] {
  const code = cleanCode(raw);
  if (!code) return [];
  const out = [code];
  const upcA = code.length === 8 ? upcEToA(code) : null;
  if (code.length === 12) out.push(`0${code}`);
  if (code.length === 14 && code.startsWith("0")) out.push(code.slice(1));
  if (code.length === 13 && code.startsWith("0")) out.push(code.slice(1));
  if (upcA) out.push(`0${upcA}`, upcA);
  return [...new Set(out)];
}
