"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { usePhotoUrl } from "@/components/PhotoThumb";
import { TeaForm } from "@/components/TeaForm";
import { addTea } from "@/lib/db";
import type { IdentifyResult } from "@/lib/identify-schema";
import { prepareImage } from "@/lib/image";
import { getPref, setPref } from "@/lib/prefs";
import { CATEGORY_LABELS, emptyDraft, type TeaDraft } from "@/lib/types";

type Status = "idle" | "analyzing" | "review" | "error";

const CONFIDENCE_LABELS: Record<IdentifyResult["confidence"], string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

function draftFromAi(ai: IdentifyResult, photo: Blob): TeaDraft {
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
    photo,
  };
}

export default function AddTea() {
  const router = useRouter();
  const cameraRef = useRef<HTMLInputElement>(null);
  const albumRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const [consented, setConsented] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [ai, setAi] = useState<IdentifyResult | null>(null);
  const [draft, setDraft] = useState<TeaDraft | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const previewUrl = usePhotoUrl(photo);

  useEffect(() => {
    setConsented(getPref("aiConsent") !== null);
  }, []);

  useEffect(() => {
    if (status !== "idle") statusRef.current?.focus();
  }, [status]);

  function toggleConsent(checked: boolean) {
    setConsented(checked);
    setPref("aiConsent", checked ? new Date().toISOString() : null);
  }

  function reset() {
    setStatus("idle");
    setPhoto(null);
    setAi(null);
    setDraft(null);
  }

  function enterManually() {
    setAi(null);
    setDraft(emptyDraft(photo));
    setStatus("review");
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setStatus("analyzing");
    try {
      const { analysis, thumb } = await prepareImage(file);
      setPhoto(thumb);
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(analysis),
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
      setDraft(draftFromAi(result, thumb));
      setStatus("review");
    } catch (err) {
      setErrorMessage(err instanceof Error && err.message ? err.message : "분석에 실패했어요.");
      setStatus("error");
    }
  }

  async function save(next: TeaDraft) {
    await addTea(next);
    router.push("/");
  }

  return (
    <main id="main" className="page">
      <div className="topbar">
        <Link href="/">← 찻장</Link>
      </div>

      <h1 className="headline">차 추가하기</h1>

      {status === "idle" && (
        <div className="stack" style={{ marginTop: 28, gap: 16 }}>
          <p className="hint" style={{ fontSize: 15 }}>
            포장이나 찻잎이 잘 보이게 찍으면 AI가 차 종류와 우리는 방법을 찾아 줘요. 결과는 저장 전에 직접 확인하고 고칠 수 있어요.
          </p>

          <label className="check">
            <input type="checkbox" checked={consented} onChange={(e) => toggleConsent(e.target.checked)} />
            <span>
              (필수) 차 종류 분석을 위해 사진이 AI 분석 서비스(Anthropic, 미국)로 전송되는 데 동의합니다. 사진의 위치정보는 전송 전에
              지워지며, my tea 서버에는 저장되지 않아요.{" "}
              <Link href="/privacy#ai">자세히</Link>
            </span>
          </label>

          <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
          <input ref={albumRef} type="file" accept="image/*" hidden onChange={onFile} />

          <button type="button" className="btn btn-primary btn-block" disabled={!consented} onClick={() => cameraRef.current?.click()}>
            사진 찍기
          </button>
          <button type="button" className="btn btn-block" disabled={!consented} onClick={() => albumRef.current?.click()}>
            앨범에서 고르기
          </button>
          <button type="button" className="btn-text" onClick={enterManually}>
            사진 없이 직접 입력하기
          </button>
        </div>
      )}

      {status !== "idle" && (
        <div ref={statusRef} tabIndex={-1} aria-live="polite" style={{ marginTop: 24, outline: "none" }}>
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- local blob URL
            <img className="photo" src={previewUrl} alt={draft?.name ? `${draft.name} 사진` : "찍은 차 사진"} />
          )}

          {status === "analyzing" && (
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 24 }}>
              <div className="spinner" aria-hidden="true" />
              <p className="sub">어떤 차인지 살펴보는 중…</p>
            </div>
          )}

          {status === "error" && (
            <div className="stack" style={{ marginTop: 24 }}>
              <p className="error" role="alert">
                {errorMessage}
              </p>
              <button type="button" className="btn btn-primary btn-block" onClick={reset}>
                다시 찍기
              </button>
              <button type="button" className="btn btn-block" onClick={enterManually}>
                직접 입력하기
              </button>
            </div>
          )}

          {status === "review" && draft && (
            <>
              {ai && (
                <section className="block" style={{ marginTop: 28 }} aria-label="AI 분석 결과">
                  <p className="label">
                    AI 추정 · 확신도 {CONFIDENCE_LABELS[ai.confidence]}
                  </p>
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
