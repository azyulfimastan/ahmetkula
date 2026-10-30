export type Theme = "forest" | "ivory";
export type PaletteName = "default" | "alt";
export type Tone = "dark" | "light" | "coral";

export type RGB = [number, number, number];
export type ToneColors = { bg: RGB; fg: RGB; muted: RGB; accent: RGB; signal: RGB };

const FOREST: RGB = [16, 31, 28];
const INK: RGB = [23, 32, 29];
const IVORY: RGB = [237, 233, 223];
const CORAL: RGB = [255, 101, 66];
const LIME: RGB = [214, 244, 106];
const SAND: RGB = [216, 205, 186];
const STONE: RGB = [142, 148, 140];

/** Okunabilirlik için açık zeminlerde kullanılan koyulaştırılmış tonlar. */
const CORAL_DEEP: RGB = [200, 48, 18];
const OLIVE: RGB = [88, 110, 8];
const MUTED_ON_LIGHT: RGB = [78, 86, 80];

export function resolveTone(tone: Tone, theme: Theme, palette: PaletteName): ToneColors {
  const alt = palette === "alt";

  if (tone === "coral") {
    return {
      bg: alt ? LIME : CORAL,
      fg: FOREST,
      muted: [48, 40, 30],
      accent: FOREST,
      signal: IVORY,
    };
  }

  // Ivory Mode: koyu bölümler de açık tona geçer, açık bölümler kum rengine.
  const effective: "dark" | "light" = tone === "dark" && theme === "ivory" ? "light" : tone;
  const sandy = tone === "light" && theme === "ivory";

  if (effective === "dark") {
    return {
      bg: alt ? INK : FOREST,
      fg: IVORY,
      muted: STONE,
      accent: alt ? LIME : CORAL,
      signal: alt ? CORAL : LIME,
    };
  }

  return {
    bg: sandy ? SAND : alt ? SAND : IVORY,
    fg: INK,
    muted: MUTED_ON_LIGHT,
    accent: alt ? OLIVE : CORAL_DEEP,
    signal: alt ? CORAL_DEEP : OLIVE,
  };
}

export const rgbToVar = (c: RGB) => `${Math.round(c[0])} ${Math.round(c[1])} ${Math.round(c[2])}`;
export const rgbToCss = (c: RGB) => `rgb(${Math.round(c[0])} ${Math.round(c[1])} ${Math.round(c[2])})`;
