"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PhotoThumb } from "@/components/PhotoThumb";
import { LeafIcon } from "@/components/icons";
import { InstallCard } from "@/components/InstallCard";
import { LeafLoader } from "@/components/LeafLoader";
import { listTeas } from "@/lib/db";
import { pickToday } from "@/lib/today";
import {
  CATEGORY_IDS,
  CATEGORY_LABELS,
  FORM_LABELS,
  UNIT_LABELS,
  expiryChip,
  type CategoryId,
  type Tea,
} from "@/lib/types";

const PAGE_SIZE = 10;

function meta(t: Tea): string {
  const parts = [CATEGORY_LABELS[t.category], FORM_LABELS[t.form]];
  if (t.amount.value !== null) parts.push(`${t.amount.value}${UNIT_LABELS[t.amount.unit]} 남음`);
  return parts.join(" · ");
}

export default function Home() {
  const [teas, setTeas] = useState<Tea[] | null>(null);
  const [filter, setFilter] = useState<CategoryId | "all">("all");
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLElement>(null);

  useEffect(() => {
    listTeas()
      .then(setTeas)
      .catch(() => setTeas([]));
  }, []);

  const present = useMemo(() => CATEGORY_IDS.filter((id) => teas?.some((t) => t.category === id)), [teas]);
  const pick = useMemo(() => (teas ? pickToday(teas) : null), [teas]);
  const filtered = (teas ?? []).filter((t) => filter === "all" || t.category === filter);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const shown = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function goTo(next: number) {
    setPage(next);
    listRef.current?.scrollIntoView({ block: "start" });
  }

  function changeFilter(next: CategoryId | "all") {
    setFilter(next);
    setPage(1);
  }

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
                <p className="hint" style={{ marginTop: 10 }}>
                  {pick.reason}
                </p>
              </section>
            ) : (
              <section className="block">
                <p className="label">시작하기</p>
                <p className="headline">
                  차 사진을 추가해 주세요 <span className="soft">어떤 차인지 제가 찾아서 정리해 드릴게요</span>
                </p>
              </section>
            )}

            <InstallCard />

            {teas.length > 0 && (
              <section ref={listRef} className="block list-section" aria-label="차 목록">
                {present.length > 1 && (
                  <div className="tabs" role="group" aria-label="종류별로 보기">
                    <button type="button" className="tab" aria-pressed={filter === "all"} onClick={() => changeFilter("all")}>
                      전체
                    </button>
                    {present.map((id) => (
                      <button key={id} type="button" className="tab" aria-pressed={filter === id} onClick={() => changeFilter(id)}>
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
                {pageCount > 1 && (
                  <nav className="pager" aria-label="목록 페이지">
                    <button type="button" className="btn-text" disabled={currentPage === 1} onClick={() => goTo(currentPage - 1)}>
                      ← 이전
                    </button>
                    <span aria-current="page">
                      {currentPage} / {pageCount}
                    </span>
                    <button type="button" className="btn-text" disabled={currentPage === pageCount} onClick={() => goTo(currentPage + 1)}>
                      다음 →
                    </button>
                  </nav>
                )}
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
