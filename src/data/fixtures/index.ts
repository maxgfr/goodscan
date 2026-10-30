/** Real Open Food Facts answers (bun run fixtures). Data © Open Food Facts contributors, ODbL. */
import cheerios from "./0016000275287.json";
import dietCoke from "./0049000028911.json";
import nutellaFr from "./3017620422003.json";
import charal from "./3181232220286.json";
import water from "./3274080005003.json";
import grisons from "./3449865367250.json";
import ritter from "./4000417025005.json";
import nutellaDe from "./4008400402222.json";
import cokeZero from "./5449000131805.json";
import maggiVeal from "./7613039829264.json";

export const RAW = {
  dietCoke,
  cheerios,
  nutellaFr,
  nutellaDe,
  ritter,
  water,
  cokeZero,
  grisons,
  charal,
  maggiVeal,
} as Record<
  | "dietCoke"
  | "cheerios"
  | "nutellaFr"
  | "nutellaDe"
  | "ritter"
  | "water"
  | "cokeZero"
  | "grisons"
  | "charal"
  | "maggiVeal",
  Record<string, unknown>
>;

/** Real Open Beauty Facts answers (bun run fixtures). Data © Open Beauty Facts contributors, ODbL. */
import secret from "./obf/0037000123439.json";
import cerave from "./obf/3337875598996.json";
import garnier from "./obf/3600540539397.json";
import nivea from "./obf/4005900964441.json";

export const RAW_OBF = { garnier, cerave, nivea, secret } as Record<
  "garnier" | "cerave" | "nivea" | "secret",
  Record<string, unknown>
>;
