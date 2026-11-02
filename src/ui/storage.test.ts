import { afterEach, describe, expect, test } from "bun:test";
import { readItem, writeItem } from "./storage";

const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

function stub(storage: Partial<Storage>) {
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
}

afterEach(() => {
  if (original) Object.defineProperty(globalThis, "localStorage", original);
  else delete (globalThis as { localStorage?: Storage }).localStorage;
});

describe("storage", () => {
  test("reads and writes", () => {
    const data = new Map<string, string>();
    stub({
      getItem: (k) => data.get(k) ?? null,
      setItem: (k, v) => void data.set(k, v),
    });
    expect(writeItem("goodscan-x", "1")).toBe(true);
    expect(readItem("goodscan-x")).toBe("1");
  });

  test("a full or blocked storage never throws, and a write says it was not kept", () => {
    stub({
      getItem: () => {
        throw new DOMException("denied", "SecurityError");
      },
      setItem: () => {
        throw new DOMException("full", "QuotaExceededError");
      },
    });
    expect(writeItem("goodscan-x", "1")).toBe(false);
    expect(readItem("goodscan-x")).toBeNull();
  });
});
