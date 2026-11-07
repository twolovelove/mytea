"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isStandalone } from "@/lib/install";
import { getPref, setPref } from "@/lib/prefs";

// Shown on the cabinet until the app is opened from the home screen or the
// card is closed. The guide stays reachable from settings.
export function InstallCard() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!isStandalone() && getPref("installCardClosed") === null);
  }, []);

  if (!show) return null;

  // On plain HTTP, Android only makes a bookmark-style shortcut that still opens
  // in the browser, so "standalone" can't be detected; let people say so.
  const close = () => {
    setPref("installCardClosed", "1");
    setShow(false);
  };

  return (
    <section className="install-card" aria-label="홈 화면에 추가 안내">
      <p className="install-card-title">홈 화면에 추가하면 앱처럼 쓸 수 있어요</p>
      <p className="hint">기록은 연 곳마다 따로 저장돼요. 늘 같은 아이콘으로 열어 주세요.</p>
      <div className="install-card-actions">
        <Link href="/install" className="btn btn-primary">
          방법 보기
        </Link>
        <button type="button" className="btn-text" onClick={close}>
          이미 추가했어요
        </button>
        <button type="button" className="btn-text" onClick={close}>
          닫기
        </button>
      </div>
    </section>
  );
}
