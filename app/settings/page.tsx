"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteAllTeas, listTeas } from "@/lib/db";
import { blobToDataUrl } from "@/lib/image";
import { clearPrefs, getPref, setPref } from "@/lib/prefs";

export default function Settings() {
  const [consentedAt, setConsentedAt] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setConsentedAt(getPref("aiConsent"));
  }, []);

  function withdrawConsent() {
    setPref("aiConsent", null);
    setConsentedAt(null);
    setMessage("AI 사진 분석 동의를 철회했어요.");
  }

  async function exportData() {
    const teas = await listTeas();
    const data = await Promise.all(
      teas.map(async (t) => ({ ...t, photo: t.photo ? await blobToDataUrl(t.photo) : null })),
    );
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), teas: data }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-tea-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage(`차 ${teas.length}개를 파일로 내보냈어요.`);
  }

  async function deleteEverything() {
    if (!window.confirm("이 기기에 저장된 모든 차 기록, 사진, 설정을 삭제할까요? 되돌릴 수 없어요.")) return;
    await deleteAllTeas();
    clearPrefs();
    setConsentedAt(null);
    setMessage("모든 데이터를 삭제했어요.");
  }

  return (
    <main id="main" className="page">
      <div className="topbar">
        <Link href="/">← 찻장</Link>
      </div>
      <h1 className="headline">설정</h1>

      <p className="hint" role="status" aria-live="polite" style={{ minHeight: 24, marginTop: 12 }}>
        {message}
      </p>

      <ul className="settings-list">
        <li>
          <h2>AI 사진 분석 동의</h2>
          <p className="hint">
            {consentedAt
              ? `${new Date(consentedAt).toLocaleDateString("ko-KR")}에 동의했어요. 철회하면 사진 분석 대신 직접 입력으로 추가할 수 있어요.`
              : "동의하지 않은 상태예요. 차를 추가할 때 다시 동의할 수 있어요."}
          </p>
          {consentedAt && (
            <button type="button" className="btn-text" onClick={withdrawConsent}>
              동의 철회하기
            </button>
          )}
        </li>
        <li>
          <h2>내 데이터 내보내기</h2>
          <p className="hint">저장된 차 기록과 사진을 JSON 파일로 받아요.</p>
          <button type="button" className="btn-text" onClick={exportData}>
            파일로 내보내기
          </button>
        </li>
        <li>
          <h2>모든 데이터 삭제</h2>
          <p className="hint">
            my tea는 서버에 개인정보를 보관하지 않아요. 이 기기에 저장된 기록을 지우면 모든 데이터가 삭제돼요.
          </p>
          <button type="button" className="btn-text btn-danger" onClick={deleteEverything}>
            모든 데이터 삭제하기
          </button>
        </li>
      </ul>

      <nav className="footer-links" aria-label="정책 및 운영 정보">
        <Link href="/privacy">개인정보처리방침</Link>
        <Link href="/terms">이용약관</Link>
        <Link href="/refund">환불정책</Link>
        <Link href="/cookies">쿠키정책</Link>
        <Link href="/about">운영자 정보</Link>
      </nav>
    </main>
  );
}
