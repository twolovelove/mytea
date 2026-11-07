import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { IdentifyResult } from "@/lib/identify-schema";

export const runtime = "nodejs";

const MAX_BASE64_LENGTH = 5_000_000;

// The photo is analysed and discarded; this route stores nothing.
const SYSTEM_PROMPT = `You identify tea products from a photo for a personal tea-cabinet app. The photo may show a package, tin, tea bag or loose leaves.

Write display text (name, note) in Korean. Keep brand names as printed on the package.

- is_tea: false when no tea or herbal infusion is visible. Fill the other fields with your best placeholders in that case.
- name: the specific tea as printed or recognisable (e.g. "다즐링 퍼스트 플러시", "얼그레이"). If only the type can be told, use a generic name such as "녹차".
- category: the closest category. Flavoured blends of a base tea go to "blend".
- brew: if brewing instructions are legible on the package, use them and set source "package". Otherwise give typical western-style brewing for this kind of tea and set source "typical". time_sec is in seconds.
- expiry_date and net_amount: only when legibly printed. Never guess; use null. Dates as YYYY-MM-DD; for a month-only date use the last day of that month. net_amount unit is "g" for weight or "ea" for a count of tea bags.
- confidence: how sure you are about the identification itself.
- note: one short sentence naming what in the photo supports the identification. Do not make health or medical claims.`;

// Simple per-instance limiter so a public deployment can't be used to burn API credit.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();

function allow(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

function error(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (!allow(ip)) return error("잠시 후 다시 시도해 주세요.", 429);

  let body: { data?: unknown; mediaType?: unknown };
  try {
    body = await req.json();
  } catch {
    return error("잘못된 요청이에요.", 400);
  }
  const { data, mediaType } = body;
  if (mediaType !== "image/jpeg" || typeof data !== "string" || data.length === 0) {
    return error("잘못된 요청이에요.", 400);
  }
  if (data.length > MAX_BASE64_LENGTH) return error("사진이 너무 커요.", 413);

  try {
    const client = new Anthropic();
    const response = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 8000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(IdentifyResult) },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data } },
            { type: "text", text: "이 사진 속 차를 식별해 주세요." },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return error("이 사진은 분석하지 못했어요. 직접 입력해 주세요.", 422);
    }
    return Response.json(response.parsed_output);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return error("요청이 많아요. 잠시 후 다시 시도해 주세요.", 503);
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("identify: Anthropic credentials missing or invalid");
      return error("서버 설정에 문제가 있어요.", 500);
    }
    if (err instanceof Anthropic.APIError) {
      console.error("identify: API error", err.status);
      return error("분석 서비스에 연결하지 못했어요.", 502);
    }
    console.error("identify: unexpected error", err);
    return error("분석 중 문제가 생겼어요.", 500);
  }
}
