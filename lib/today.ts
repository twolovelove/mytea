import { CATEGORY_LABELS, daysUntil, formatMinutes, type CategoryId, type Tea } from "./types";

export interface TodayPick {
  label: string;
  strong: string;
  soft: string;
  /** Short reason shown under the pick, under 100 characters. */
  reason: string;
}

interface Hint {
  categories: CategoryId[];
  /** Used when both time and season match, e.g. "선선한 가을 오후". */
  word: string;
  reason: (label: string) => string;
}

// Suggestions are a matter of taste, so reasons say what fits the moment
// rather than claiming any effect. Every category label ends in a vowel, so "를" is safe.
function timeHint(hour: number): Hint {
  if (hour >= 5 && hour < 11) {
    return { categories: ["black", "blend", "dark", "oolong"], word: "아침", reason: (l) => `아침이라 진하고 또렷한 ${l}를 추천해 드려요.` };
  }
  if (hour >= 11 && hour < 17) {
    return { categories: ["green", "white", "yellow", "oolong"], word: "오후", reason: (l) => `오후엔 가볍게 마시기 좋은 ${l}를 추천해 드려요.` };
  }
  return { categories: ["herbal"], word: "저녁", reason: (l) => `저녁이라 편하게 마시기 좋은 ${l}를 추천해 드려요.` };
}

function seasonHint(month: number): Hint {
  if (month >= 3 && month <= 5) {
    return { categories: ["green", "white"], word: "햇차가 나오는 봄", reason: (l) => `햇차가 나오는 봄이라 ${l}를 추천해 드려요.` };
  }
  if (month >= 6 && month <= 8) {
    return { categories: ["green", "white", "yellow", "herbal"], word: "더운 여름", reason: (l) => `더운 계절이라 산뜻한 ${l}를 추천해 드려요.` };
  }
  if (month >= 9 && month <= 11) {
    return { categories: ["oolong", "black"], word: "선선한 가을", reason: (l) => `선선한 가을이라 ${l}를 추천해 드려요.` };
  }
  return { categories: ["black", "dark", "blend"], word: "추운 겨울", reason: (l) => `추운 날이라 묵직한 ${l}를 추천해 드려요.` };
}

function brewSummary(tea: Tea): string {
  const parts = [
    tea.brew.tempC !== null ? `${tea.brew.tempC}°` : null,
    tea.brew.timeSec !== null ? formatMinutes(tea.brew.timeSec) : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : CATEGORY_LABELS[tea.category];
}

/**
 * 1. A tea expiring within 30 days (or already expired) comes first.
 * 2. Otherwise score by time of day (+2) and season (+1); among the best,
 *    rotate by date so the pick changes daily.
 */
export function pickToday(teas: Tea[], now = new Date()): TodayPick | null {
  if (teas.length === 0) return null;

  const expiring = teas
    .filter((t) => t.expiry && daysUntil(t.expiry) <= 30)
    .sort((a, b) => daysUntil(a.expiry!) - daysUntil(b.expiry!));
  const first = expiring[0];
  if (first) {
    const d = daysUntil(first.expiry!);
    if (d < 0) {
      return {
        label: "확인해 주세요",
        strong: first.name,
        soft: "유통기한이 지났어요",
        reason: "유통기한이 지난 차가 있어서 먼저 알려 드려요.",
      };
    }
    return {
      label: "먼저 마시면 좋아요",
      strong: first.name,
      soft: d === 0 ? "유통기한이 오늘까지예요" : `유통기한이 ${d}일 남았어요`,
      reason: "유통기한이 가까운 차부터 먼저 추천해 드려요.",
    };
  }

  const time = timeHint(now.getHours());
  const season = seasonHint(now.getMonth() + 1);
  const score = (t: Tea) =>
    (time.categories.includes(t.category) ? 2 : 0) + (season.categories.includes(t.category) ? 1 : 0);

  const best = Math.max(...teas.map(score));
  const candidates = teas.filter((t) => score(t) === best).sort((a, b) => a.createdAt - b.createdAt);
  const day = Math.floor((now.getTime() - now.getTimezoneOffset() * 60_000) / 86_400_000);
  const tea = candidates[day % candidates.length];

  const label = CATEGORY_LABELS[tea.category];
  const reason =
    best === 3
      ? `${season.word} ${time.word}, ${label}를 추천해 드려요.`
      : best === 2
        ? time.reason(label)
        : best === 1
          ? season.reason(label)
          : "찻장의 차를 하루씩 돌아가며 추천해 드려요.";
  return { label: "오늘의 차", strong: tea.name, soft: brewSummary(tea), reason };
}
