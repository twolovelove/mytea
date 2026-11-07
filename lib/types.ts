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
  /** Re-encoded thumbnail; EXIF (incl. GPS) is stripped. */
  photo: Blob | null;
  createdAt: number;
  updatedAt: number;
}

export type TeaDraft = Omit<Tea, "id" | "createdAt" | "updatedAt">;

export function emptyDraft(photo: Blob | null = null): TeaDraft {
  return {
    name: "",
    brand: "",
    category: "other",
    form: "loose",
    brew: { tempC: null, timeSec: null, grams: null, waterMl: null },
    expiry: null,
    amount: { value: null, unit: "g" },
    notes: "",
    photo,
  };
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
  const min = sec / 60;
  return Number.isInteger(min) ? `${min}분` : `${Math.floor(min)}분 ${sec % 60}초`;
}

export function expiryChip(expiry: string | null): string | null {
  if (!expiry) return null;
  const d = daysUntil(expiry);
  if (d < 0) return "기한 지남";
  if (d <= 30) return `D-${d}`;
  return null;
}
