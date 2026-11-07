"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPref, setPref } from "@/lib/prefs";

// The app sets no cookies and uses no trackers, so this is a notice rather than
// a consent prompt: it tells people what is kept in their browser and why.
export function StorageNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(getPref("noticeSeen") === null);
  }, []);

  if (!open) return null;

  return (
    <section className="notice" role="region" aria-label="저장 방식 안내">
      <p>
        my tea는 쿠키나 광고·분석 추적 도구를 쓰지 않아요. 차 기록과 사진은 이 기기의 브라우저에만 저장돼요.
      </p>
      <div className="notice-actions">
        <Link href="/cookies">자세히 보기</Link>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setPref("noticeSeen", "1");
            setOpen(false);
          }}
        >
          확인
        </button>
      </div>
    </section>
  );
}
