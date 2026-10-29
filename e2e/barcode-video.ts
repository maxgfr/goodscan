/**
 * A Y4M video of one EAN-13 barcode, for Chromium's fake camera
 * (--use-file-for-fake-video-capture): the camera test scans a real
 * barcode image, end to end, through the same reader as on a phone.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const L = [
  "0001101",
  "0011001",
  "0010011",
  "0111101",
  "0100011",
  "0110001",
  "0101111",
  "0111011",
  "0110111",
  "0001011",
];
const G = [
  "0100111",
  "0110011",
  "0011011",
  "0100001",
  "0011101",
  "0111001",
  "0000101",
  "0010001",
  "0001001",
  "0010111",
];
const R = [
  "1110010",
  "1100110",
  "1101100",
  "1000010",
  "1011100",
  "1001110",
  "1010000",
  "1000100",
  "1001000",
  "1110100",
];
const PARITY = [
  "LLLLLL",
  "LLGLGG",
  "LLGGLG",
  "LLGGGL",
  "LGLLGG",
  "LGGLLG",
  "LGGGLL",
  "LGLGLG",
  "LGLGGL",
  "LGGLGL",
];

/** The 95 modules of an EAN-13, 1 = bar. */
export function ean13Modules(code: string): string {
  if (!/^\d{13}$/.test(code)) throw new Error(`not an EAN-13: ${code}`);
  const d = code.split("").map(Number);
  const parity = PARITY[d[0] ?? 0] ?? "";
  let bits = "101";
  for (let i = 1; i <= 6; i++) bits += (parity[i - 1] === "G" ? G : L)[d[i] ?? 0];
  bits += "01010";
  for (let i = 7; i <= 12; i++) bits += R[d[i] ?? 0];
  return `${bits}101`;
}

export function writeBarcodeVideo(path: string, code: string, width = 640, height = 480): string {
  if (existsSync(path)) return path;
  mkdirSync(dirname(path), { recursive: true });
  const modules = ean13Modules(code);
  const module = 4;
  const barWidth = modules.length * module;
  const left = Math.floor((width - barWidth) / 2);
  const top = Math.floor(height * 0.25);
  const bottom = Math.floor(height * 0.75);
  const y = Buffer.alloc(width * height, 235);
  for (let row = top; row < bottom; row++) {
    for (let i = 0; i < modules.length; i++) {
      if (modules[i] !== "1") continue;
      y.fill(16, row * width + left + i * module, row * width + left + (i + 1) * module);
    }
  }
  const chroma = Buffer.alloc((width / 2) * (height / 2) * 2, 128);
  const header = Buffer.from(`YUV4MPEG2 W${width} H${height} F10:1 Ip A1:1 C420jpeg\n`);
  const frame = Buffer.concat([Buffer.from("FRAME\n"), y, chroma]);
  writeFileSync(path, Buffer.concat([header, frame, frame]));
  return path;
}
