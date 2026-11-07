export const CATEGORY_IDS = [
  "green",
  "black",
  "oolong",
  "white",
  "yellow",
  "dark",
  "herbal",
  "blend",
  "other",
] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  green: "녹차",
  black: "홍차",
  oolong: "우롱차",
  white: "백차",
  yellow: "황차",
  dark: "보이차·흑차",
  herbal: "허브차",
  blend: "블렌드",
  other: "기타",
};

export const FORM_IDS = ["loose", "teabag", "powder", "other"] as const;
export type FormId = (typeof FORM_IDS)[number];

export const FORM_LABELS: Record<FormId, string> = {
  loose: "잎차",
  teabag: "티백",
  powder: "가루",
  other: "기타",
};

export type AmountUnit = "g" | "ea";
export const UNIT_LABELS: Record<AmountUnit, string> = { g: "g", ea: "개" };

export interface Brew {
  tempC: number | null;
  timeSec: number | null;
  grams: number | null;
  waterMl: number | null;
}

export interface Tea {
  id: string;
  name: string;
  brand: string;
  category: CategoryId;
  form: FormId;
  brew: Brew;
  /** YYYY-MM-DD */
  expiry: string | null;
  amount: { value: number | null; unit: AmountUnit };
  notes: string;
  /** Re-encoded thumbnails, first one is the cover; EXIF (incl. GPS) is stripped. */
  photos: Blob[];
  createdAt: number;
  updatedAt: number;
}

export const MAX_PHOTOS = 4;

export type TeaDraft = Omit<Tea, "id" | "createdAt" | "updatedAt">;

export function emptyDraft(photos: Blob[] = []): TeaDraft {
  return {
    name: "",
    brand: "",
    category: "other",
    form: "loose",
    brew: { tempC: null, timeSec: null, grams: null, waterMl: null },
    expiry: null,
    amount: { value: null, unit: "g" },
    notes: "",
    photos,
  };
}

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
}

/** Teas already in the cabinet that look like the same product. */
export function findSimilar(teas: Tea[], name: string, brand: string): Tea[] {
  const n = normalizeName(name);
  const b = normalizeName(brand);
  if (n.length < 2) return [];
  return teas
    .filter((t) => {
      const tn = normalizeName(t.name);
      const tb = normalizeName(t.brand);
      const nameMatch = tn === n || (Math.min(tn.length, n.length) >= 3 && (tn.includes(n) || n.includes(tn)));
      const brandConflict = b !== "" && tb !== "" && b !== tb;
      return nameMatch && !brandConflict;
    })
    .slice(0, 3);
}

/** Whole days from today until `date` (negative once past). */
export function daysUntil(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function formatMinutes(sec: number): string {
  const total = Math.round(sec);
  const min = Math.floor(total / 60);
  const rest = total % 60;
  if (min === 0) return `${rest}초`;
  return rest === 0 ? `${min}분` : `${min}분 ${rest}초`;
}

export function expiryChip(expiry: string | null): string | null {
  if (!expiry) return null;
  const d = daysUntil(expiry);
  if (d < 0) return "기한 지남";
  if (d <= 30) return `D-${d}`;
  return null;
}
