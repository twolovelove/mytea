"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { LeafLoader } from "@/components/LeafLoader";
import { PhotoThumb, usePhotoUrl } from "@/components/PhotoThumb";
import { TeaForm } from "@/components/TeaForm";
import { addTea, listTeas } from "@/lib/db";
import type { IdentifyResult } from "@/lib/identify-schema";
import { prepareImage, type AnalysisImage } from "@/lib/image";
import { getPref, setPref } from "@/lib/prefs";
import {
  CATEGORY_LABELS,
  FORM_LABELS,
  MAX_PHOTOS,
  emptyDraft,
  findSimilar,
  type Tea,
  type TeaDraft,
} from "@/lib/types";

type Status = "idle" | "preparing" | "collect" | "analyzing" | "duplicate" | "review" | "error";

interface Photo {
  analysis: AnalysisImage;
  thumb: Blob;
}

const CONFIDENCE_LABELS: Record<IdentifyResult["confidence"], string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

function draftFromAi(ai: IdentifyResult, photos: Blob[]): TeaDraft {
  return {
    name: ai.name,
    brand: ai.brand ?? "",
    category: ai.category,
    form: ai.form,
    brew: {
      tempC: ai.brew.temp_c,
      timeSec: ai.brew.time_sec,
      grams: ai.brew.grams,
      waterMl: ai.brew.water_ml,
    },
    expiry: ai.expiry_date && /^\d{4}-\d{2}-\d{2}$/.test(ai.expiry_date) ? ai.expiry_date : null,
    amount: { value: ai.net_amount.value, unit: ai.net_amount.unit },
    notes: "",
    photos,
  };
}

function PhotoTile({ blob, index, onRemove }: { blob: Blob; index: number; onRemove?: () => void }) {
  const url = usePhotoUrl(blob);
  return (
    <li className="tile">
      {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL */}
      {url && <img src={url} alt={`찍은 차 사진 ${index + 1}`} />}
      {onRemove && (
        <button type="button" className="tile-remove" onClick={onRemove} aria-label={`사진 ${index + 1} 빼기`}>
          ×
        </button>
      )}
    </li>
  );
}

export default function AddTea() {
  const router = useRouter();
  const cameraRef = useRef<HTMLInputElement>(null);
  const albumRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Ask for consent only until it has been given once; it can be withdrawn in settings.
  const [needsConsent, setNeedsConsent] = useState(false);
  const [consented, setConsented] = useState(false);
  const [teas, setTeas] = useState<Tea[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [ai, setAi] = useState<IdentifyResult | null>(null);
  const [draft, setDraft] = useState<TeaDraft | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [similar, setSimilar] = useState<Tea[]>([]);
  const [pending, setPending] = useState<TeaDraft | null>(null);
  const [askedDuplicate, setAskedDuplicate] = useState(false);

  useEffect(() => {
    const given = getPref("aiConsent") !== null;
    setNeedsConsent(!given);
    setConsented(given);
    listTeas()
      .then(setTeas)
      .catch(() => setTeas([]));
  }, []);

  useEffect(() => {
    if (status !== "idle") statusRef.current?.focus();
  }, [status]);

  const thumbs = photos.map((p) => p.thumb);
  const remaining = MAX_PHOTOS - photos.length;

  function toggleConsent(checked: boolean) {
    setConsented(checked);
    setPref("aiConsent", checked ? new Date().toISOString() : null);
  }

  function reset() {
    setStatus("idle");
    setPhotos([]);
    setAi(null);
    setDraft(null);
    setPending(null);
    setAskedDuplicate(false);
  }

  function enterManually() {
    setAi(null);
    setDraft(emptyDraft(thumbs));
    setStatus("review");
  }

  async function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, remaining);
    e.target.value = "";
    if (files.length === 0) return;
    // Shrinking full-size phone photos takes a moment; show it instead of a frozen screen.
    setStatus("preparing");
    try {
      const prepared = await Promise.all(files.map(prepareImage));
      setPhotos((prev) => [...prev, ...prepared].slice(0, MAX_PHOTOS));
      setStatus("collect");
    } catch {
      setErrorMessage("사진을 불러오지 못했어요. 다른 사진으로 해 주세요.");
      setStatus("error");
    }
  }

  async function analyze() {
    setStatus("analyzing");
    try {
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ images: photos.map((p) => p.analysis) }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "분석에 실패했어요.");

      const result = json as IdentifyResult;
      if (!result.is_tea) {
        setErrorMessage("사진에서 차를 찾지 못했어요. 포장이나 찻잎이 잘 보이게 다시 찍어 주세요.");
        setStatus("error");
        return;
      }
      setAi(result);
      setDraft(draftFromAi(result, thumbs));

      const matches = findSimilar(teas, result.name, result.brand ?? "");
      if (matches.length > 0) {
        setSimilar(matches);
        setAskedDuplicate(true);
        setStatus("duplicate");
      } else {
        setStatus("review");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error && err.message ? err.message : "분석에 실패했어요.");
      setStatus("error");
    }
  }

  async function save(next: TeaDraft) {
    if (!askedDuplicate) {
      const matches = findSimilar(teas, next.name, next.brand);
      if (matches.length > 0) {
        setSimilar(matches);
        setPending(next);
        setAskedDuplicate(true);
        setStatus("duplicate");
        return;
      }
    }
    await addTea(next);
    router.push("/");
  }

  async function addAsNew() {
    if (pending) {
      await addTea(pending);
      router.push("/");
    } else {
      setStatus("review");
    }
  }

  const pickButtons = (primaryLabel: string) => (
    <>
      <button type="button" className="btn btn-primary btn-block" disabled={!consented} onClick={() => cameraRef.current?.click()}>
        {primaryLabel}
      </button>
      <button type="button" className="btn btn-block" disabled={!consented} onClick={() => albumRef.current?.click()}>
        앨범에서 고르기
      </button>
    </>
  );

  return (
    <main id="main" className="page">
      <div className="topbar">
        <Link href="/">← 찻장</Link>
      </div>

      <h1 className="headline">차 추가하기</h1>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={onFiles} />
      <input ref={albumRef} type="file" accept="image/*" multiple hidden onChange={onFiles} />

      {status === "idle" && (
        <div className="stack" style={{ marginTop: 28, gap: 16 }}>
          <section className="tip" aria-label="촬영 팁">
            <p className="tip-title">차의 정보가 보이면 더 정확하게 분석돼요</p>
            <p className="hint">
              포장에 적힌 이름, 브랜드, 우리는 방법, 유통기한이 보이게 찍어 주세요. 틴케이스라면 앞면과 뒷면 라벨처럼 여러 장(최대{" "}
              {MAX_PHOTOS}장)을 찍을 수 있어요.
            </p>
          </section>

          {needsConsent && (
            <label className="check">
              <input type="checkbox" checked={consented} onChange={(e) => toggleConsent(e.target.checked)} />
              <span>
                (필수) 차 종류 분석을 위해 사진이 AI 분석 서비스(Anthropic, 미국)로 전송되는 데 동의합니다. 사진의 위치정보는 전송 전에
                지워지며, my tea 서버에는 저장되지 않아요. <Link href="/privacy#ai">자세히</Link>
              </span>
            </label>
          )}

          {pickButtons("사진 추가하기")}
          <button type="button" className="btn-text" onClick={enterManually}>
            사진 없이 직접 입력하기
          </button>
        </div>
      )}

      {status !== "idle" && (
        <div ref={statusRef} tabIndex={-1} aria-live="polite" style={{ marginTop: 24, outline: "none" }}>
          {status !== "duplicate" && photos.length > 0 && (
            <ul className="tiles" aria-label={`사진 ${photos.length}장`}>
              {photos.map((p, i) => (
                <PhotoTile
                  key={i}
                  blob={p.thumb}
                  index={i}
                  onRemove={
                    status === "collect"
                      ? () => {
                          const next = photos.filter((_, j) => j !== i);
                          setPhotos(next);
                          if (next.length === 0) setStatus("idle");
                        }
                      : undefined
                  }
                />
              ))}
            </ul>
          )}

          {status === "collect" && (
            <div className="stack" style={{ marginTop: 20 }}>
              <p className="hint">
                {remaining > 0
                  ? `뒷면 라벨이나 찻잎 사진을 ${remaining}장 더 추가할 수 있어요. (${photos.length}/${MAX_PHOTOS})`
                  : `사진을 ${MAX_PHOTOS}장 모두 추가했어요.`}
              </p>
              <button type="button" className="btn btn-primary btn-block" onClick={analyze}>
                {photos.length}장으로 분석하기
              </button>
              {remaining > 0 && (
                <div className="grid-2">
                  <button type="button" className="btn" onClick={() => cameraRef.current?.click()}>
                    + 사진 추가하기
                  </button>
                  <button type="button" className="btn" onClick={() => albumRef.current?.click()}>
                    + 앨범
                  </button>
                </div>
              )}
              <button type="button" className="btn-text" onClick={enterManually}>
                분석 없이 직접 입력하기
              </button>
            </div>
          )}

          {status === "analyzing" && (
            <LeafLoader label="어떤 차인지 살펴보는 중…" />
          )}

          {status === "preparing" && <LeafLoader label="사진 준비 중…" />}

          {status === "error" && (
            <div className="stack" style={{ marginTop: 24 }}>
              <p className="error" role="alert">
                {errorMessage}
              </p>
              <button type="button" className="btn btn-primary btn-block" onClick={() => setStatus(photos.length ? "collect" : "idle")}>
                사진 다시 고르기
              </button>
              <button type="button" className="btn btn-block" onClick={enterManually}>
                직접 입력하기
              </button>
            </div>
          )}

          {status === "duplicate" && (
            <section aria-label="비슷한 차 확인">
              <p className="label">찻장에 비슷한 차가 있어요</p>
              <p className="headline">혹시 이 차인가요?</p>
              <ul className="list">
                {similar.map((t) => (
                  <li key={t.id}>
                    <Link className="row" href={`/tea/${t.id}`}>
                      <PhotoThumb photo={t.photos[0] ?? null} alt="" />
                      <span className="row-text">
                        <span className="row-name">{t.name}</span>
                        <span className="row-meta">
                          {[t.brand, CATEGORY_LABELS[t.category], FORM_LABELS[t.form]].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <span className="chip">네, 이 차예요</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="hint" style={{ marginTop: 12 }}>
                같은 차라면 눌러서 남은 양이나 유통기한을 고칠 수 있어요.
              </p>
              <div className="stack" style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-block" onClick={addAsNew}>
                  아니요, 새로 추가할게요
                </button>
              </div>
            </section>
          )}

          {status === "review" && draft && (
            <>
              {ai && (
                <section className="block" style={{ marginTop: 28 }} aria-label="AI 분석 결과">
                  <p className="label">AI 추정 · 확신도 {CONFIDENCE_LABELS[ai.confidence]}</p>
                  <p className="headline">
                    {ai.name} <span className="soft">{CATEGORY_LABELS[ai.category]}</span>
                  </p>
                  <p className="hint" style={{ marginTop: 10 }}>
                    {ai.note}
                    {ai.brew.source === "typical" && " 우리는 방법은 포장에서 읽은 값이 아니라 이 종류의 일반적인 방법이에요."}
                  </p>
                  <p className="hint" style={{ marginTop: 6 }}>
                    AI 결과는 틀릴 수 있어요. 저장하기 전에 확인해 주세요.
                  </p>
                </section>
              )}
              <TeaForm initial={draft} submitLabel="찻장에 저장" onSubmit={save} onCancel={reset} />
            </>
          )}
        </div>
      )}
    </main>
  );
}
