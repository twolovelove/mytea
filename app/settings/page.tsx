"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteAllTeas, listTeas } from "@/lib/db";
import { buildExportZip, downloadBlob } from "@/lib/export";
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
    try {
      const teas = await listTeas();
      const zip = await buildExportZip(teas);
      downloadBlob(zip, `my-tea-${new Date().toISOString().slice(0, 10)}.zip`);
      setMessage(`차 ${teas.length}개를 ZIP 파일로 내보냈어요.`);
    } catch {
      setMessage("내보내기에 실패했어요. 다시 시도해 주세요.");
    }
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
          <h2>홈 화면에 추가하기</h2>
          <p className="hint">앱처럼 아이콘으로 열 수 있어요. 기록은 연 곳마다 따로 저장되니 늘 같은 아이콘으로 열어 주세요.</p>
          <Link href="/install" className="btn-text" style={{ display: "inline-block" }}>
            방법 보기
          </Link>
        </li>
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
          <p className="hint">차 목록 표(CSV)와 사진을 ZIP 파일로 받으실 수 있어요. 표는 엑셀이나 구글 시트에서 열어 주세요.</p>
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
