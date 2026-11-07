"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePhotoUrl } from "@/components/PhotoThumb";

function Photo({ blob, alt }: { blob: Blob; alt: string }) {
  const url = usePhotoUrl(blob);
  // eslint-disable-next-line @next/next/no-img-element -- local blob URL
  return url ? <img className="photo" src={url} alt={alt} /> : null;
}
import { TeaForm } from "@/components/TeaForm";
import { deleteTea, getTea, updateTea } from "@/lib/db";
import {
  CATEGORY_LABELS,
  FORM_LABELS,
  UNIT_LABELS,
  daysUntil,
  formatMinutes,
  type Tea,
  type TeaDraft,
} from "@/lib/types";

function expiryText(expiry: string): { strong: string; soft: string } {
  const d = daysUntil(expiry);
  const date = expiry.replaceAll("-", ".");
  if (d < 0) return { strong: "기한이 지났어요", soft: `${date}까지였어요` };
  if (d === 0) return { strong: "오늘까지", soft: date };
  return { strong: `${d}일 남았어요`, soft: `${date}까지` };
}

export default function TeaDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tea, setTea] = useState<Tea | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    getTea(id)
      .then((t) => setTea(t ?? null))
      .catch(() => setTea(null));
  }, [id]);

  if (tea === undefined) return <main id="main" className="page" />;

  if (tea === null) {
    return (
      <main id="main" className="page">
        <div className="topbar">
          <Link href="/">← 찻장</Link>
        </div>
        <h1 className="headline">이 차를 찾을 수 없어요</h1>
      </main>
    );
  }

  async function save(draft: TeaDraft) {
    setTea(await updateTea(id, draft));
    setEditing(false);
    window.scrollTo(0, 0);
  }

  async function remove() {
    if (!tea || !window.confirm(`'${tea.name}'을(를) 찻장에서 삭제할까요? 되돌릴 수 없어요.`)) return;
    await deleteTea(id);
    router.replace("/");
  }

  if (editing) {
    return (
      <main id="main" className="page">
        <div className="topbar">
          <button type="button" onClick={() => setEditing(false)}>
            ← 돌아가기
          </button>
        </div>
        <h1 className="headline">수정하기</h1>
        <TeaForm initial={tea} submitLabel="저장" onSubmit={save} onCancel={() => setEditing(false)} />
      </main>
    );
  }

  const { brew } = tea;
  const brewDetails = [
    brew.timeSec !== null ? formatMinutes(brew.timeSec) : null,
    brew.grams !== null ? `찻잎 ${brew.grams}g` : null,
    brew.waterMl !== null ? `물 ${brew.waterMl}ml` : null,
  ].filter(Boolean);
  const expiry = tea.expiry ? expiryText(tea.expiry) : null;

  return (
    <main id="main" className="page">
      <div className="topbar">
        <Link href="/">← 찻장</Link>
        <button type="button" onClick={() => setEditing(true)}>
          수정
        </button>
      </div>

      <p className="label">{[CATEGORY_LABELS[tea.category], FORM_LABELS[tea.form], tea.brand].filter(Boolean).join(" · ")}</p>
      <h1 className="headline" style={{ fontSize: 40 }}>
        {tea.name}
      </h1>

      {brew.tempC !== null ? (
        <>
          <p className="big" aria-label={`물 온도 ${brew.tempC}도`}>
            {brew.tempC}
            <sup aria-hidden="true">°C</sup>
          </p>
          <p className="sub">{brewDetails.length ? brewDetails.join(" · ") : "우리는 시간을 추가해 보세요"}</p>
        </>
      ) : (
        <section className="block">
          <p className="label">우리는 방법</p>
          <p className="headline">
            {brewDetails.length ? brewDetails.join(" · ") : "아직 몰라요"}{" "}
            {!brewDetails.length && <span className="soft">수정에서 추가할 수 있어요</span>}
          </p>
        </section>
      )}

      <section className="block">
        <p className="label">유통기한</p>
        <p className="headline">
          {expiry ? (
            <>
              {expiry.strong} <span className="soft">{expiry.soft}</span>
            </>
          ) : (
            <span className="soft">입력하지 않았어요</span>
          )}
        </p>
      </section>

      <section className="block">
        <p className="label">남은 양</p>
        <p className="headline">
          {tea.amount.value !== null ? (
            `${tea.amount.value}${UNIT_LABELS[tea.amount.unit]}`
          ) : (
            <span className="soft">입력하지 않았어요</span>
          )}
        </p>
      </section>

      {tea.notes && (
        <section className="block">
          <p className="label">메모</p>
          <p className="sub" style={{ whiteSpace: "pre-wrap" }}>
            {tea.notes}
          </p>
        </section>
      )}

      {tea.photos.length > 0 && (
        <section className="block stack" aria-label="사진">
          {tea.photos.map((blob, i) => (
            <Photo key={i} blob={blob} alt={`${tea.name} 사진 ${i + 1}`} />
          ))}
        </section>
      )}

      <div className="block">
        <button type="button" className="btn-text btn-danger" onClick={remove}>
          이 차 삭제하기
        </button>
      </div>
    </main>
  );
}
