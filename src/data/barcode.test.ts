import { describe, expect, test } from "bun:test";
import { checkDigit, cleanCode, lookupCodes, upcEToA, validCheckDigit } from "./barcode";

describe("barcodes", () => {
  test("check digits of real products", () => {
    expect(validCheckDigit("3017620422003")).toBe(true); // Nutella
    expect(validCheckDigit("4000417025005")).toBe(true); // Ritter Sport
    expect(validCheckDigit("049000028911")).toBe(true); // Diet Coke, UPC-A
    expect(validCheckDigit("3017620422004")).toBe(false);
    expect(checkDigit("301762042200")).toBe(3);
  });

  test("cleans what people type", () => {
    expect(cleanCode(" 3017 6204-22003 ")).toBe("3017620422003");
    expect(cleanCode("12345")).toBeNull();
    expect(cleanCode("abc")).toBeNull();
  });

  test("a UPC-A is also looked up as its EAN-13", () => {
    expect(lookupCodes("049000028911")).toEqual(["049000028911", "0049000028911"]);
    expect(lookupCodes("0049000028911")).toEqual(["0049000028911", "049000028911"]);
    expect(lookupCodes("3017620422003")).toEqual(["3017620422003"]);
  });

  test("UPC-E expands to UPC-A", () => {
    // Coca-Cola 12 oz can, UPC-E 04963406 = UPC-A 049000006346
    expect(upcEToA("04963406")).toBe("049000006346");
    expect(lookupCodes("04963406")).toContain("0049000006346");
  });
});
