/** Real Open Food Facts answers (bun run fixtures). Data © Open Food Facts contributors, ODbL. */
import cheerios from "./0016000275287.json";
import dietCoke from "./0049000028911.json";
import nutellaFr from "./3017620422003.json";
import water from "./3274080005003.json";
import ritter from "./4000417025005.json";
import nutellaDe from "./4008400402222.json";
import cokeZero from "./5449000131805.json";

export const RAW = { dietCoke, cheerios, nutellaFr, nutellaDe, ritter, water, cokeZero } as Record<
  "dietCoke" | "cheerios" | "nutellaFr" | "nutellaDe" | "ritter" | "water" | "cokeZero",
  Record<string, unknown>
>;
