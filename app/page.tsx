"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PhotoThumb } from "@/components/PhotoThumb";
import { LeafIcon } from "@/components/icons";
import { LeafLoader } from "@/components/LeafLoader";
import { listTeas } from "@/lib/db";
import {
  CATEGORY_IDS,
  CATEGORY_LABELS,
  FORM_LABELS,
  UNIT_LABELS,
  daysUntil,
  expiryChip,
  formatMinutes,
  type CategoryId,
  type Tea,
} from "@/lib/types";

interface Pick {
  label: string;
  strong: string;
  soft: string;
}

// The headline under the count: nudge toward whatever expires soonest,
// otherwise rotate a "tea of the day".
function pickToday(teas: Tea[]): Pick | null {
  if (teas.length === 0) return null;
  const expiring = teas
    .filter((t) => t.expiry && daysUntil(t.expiry) <= 30)
    .sort((a, b) => daysUntil(a.expiry!) - daysUntil(b.expiry!));
  const first = expiring[0];
  if (first) {
    const d = daysUntil(first.expiry!);
    if (d < 0) return { label: "확인해 보세요", strong: first.name, soft: "유통기한이 지났어요" };
    return { label: "먼저 마시면 좋아요", strong: first.name, soft: d === 0 ? "유통기한이 오늘까지예요" : `유통기한이 ${d}일 남았어요` };
  }
  const day = Math.floor(Date.now() / 86_400_000);
  const tea = teas[day % teas.length];
  const parts = [tea.brew.tempC !== null ? `${tea.brew.tempC}°` : null, tea.brew.timeSec !== null ? formatMinutes(tea.brew.timeSec) : null].filter(Boolean);
  return { label: "오늘의 차", strong: tea.name, soft: parts.length ? parts.join(" · ") : CATEGORY_LABELS[tea.category] };
}

function meta(t: Tea): string {
  const parts = [CATEGORY_LABELS[t.category], FORM_LABELS[t.form]];
  if (t.amount.value !== null) parts.push(`${t.amount.value}${UNIT_LABELS[t.amount.unit]} 남음`);
  return parts.join(" · ");
}

export default function Home() {
  const [teas, setTeas] = useState<Tea[] | null>(null);
  const [filter, setFilter] = useState<CategoryId | "all">("all");

  useEffect(() => {
    listTeas()
      .then(setTeas)
      .catch(() => setTeas([]));
  }, []);

  const present = useMemo(() => CATEGORY_IDS.filter((id) => teas?.some((t) => t.category === id)), [teas]);
  const pick = useMemo(() => (teas ? pickToday(teas) : null), [teas]);
  const shown = (teas ?? []).filter((t) => filter === "all" || t.category === filter);

  return (
    <>
      <main id="main" className="page">
        <div className="topbar">
          <span style={{ fontWeight: 700 }}>my tea</span>
          <Link href="/settings">설정</Link>
        </div>

        {!teas && <LeafLoader label="찻장 불러오는 중…" delay={300} />}

        {teas && (
          <>
            <h1 className="big" aria-label={`찻장에 차 ${teas.length}가지`}>
              {teas.length}
              <LeafIcon />
            </h1>
            <p className="sub">찻장에 있는 차</p>

            {pick ? (
              <section className="block" aria-label={pick.label}>
                <p className="label">{pick.label}</p>
                <p className="headline">
                  {pick.strong} <span className="soft">{pick.soft}</span>
                </p>
              </section>
            ) : (
              <section className="block">
                <p className="label">시작하기</p>
                <p className="headline">
                  차 사진을 찍어 보세요 <span className="soft">종류는 알아서 찾아 정리해 둘게요</span>
                </p>
              </section>
            )}

            {teas.length > 0 && (
              <section className="block" aria-label="차 목록">
                {present.length > 1 && (
                  <div className="tabs" role="group" aria-label="종류별로 보기">
                    <button type="button" className="tab" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
                      전체
                    </button>
                    {present.map((id) => (
                      <button key={id} type="button" className="tab" aria-pressed={filter === id} onClick={() => setFilter(id)}>
                        {CATEGORY_LABELS[id]}
                      </button>
                    ))}
                  </div>
                )}
                <ul className="list">
                  {shown.map((t) => {
                    const chip = expiryChip(t.expiry);
                    return (
                      <li key={t.id}>
                        <Link className="row" href={`/tea/${t.id}`}>
                          <PhotoThumb photo={t.photos[0] ?? null} alt="" />
                          <span className="row-text">
                            <span className="row-name">{t.name}</span>
                            <span className="row-meta">{meta(t)}</span>
                          </span>
                          {chip && <span className="chip">{chip}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </>
        )}

      </main>

      <div className="bottom-bar">
        <div className="bottom-bar-inner">
          <Link href="/add" className="btn btn-primary btn-block">
            + 차 추가하기
          </Link>
        </div>
      </div>
    </>
  );
}
