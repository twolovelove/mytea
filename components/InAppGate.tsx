"use client";

import { useEffect, useState } from "react";
import { canOpenExternally, detectInAppBrowser, openInExternalBrowser, type InAppBrowser } from "@/lib/inapp";

// Records saved inside a messenger's browser stay trapped there and downloads
// are blocked, so the app only runs in a regular browser. Where possible we
// hand the page over automatically; otherwise we explain how.
export function InAppGate({ children }: { children: React.ReactNode }) {
  const [browser, setBrowser] = useState<InAppBrowser | null>(null);

  useEffect(() => {
    const detected = detectInAppBrowser();
    setBrowser(detected);
    if (detected && canOpenExternally(detected)) openInExternalBrowser(detected);
  }, []);

  if (!browser) return <>{children}</>;

  const auto = canOpenExternally(browser);
  return (
    <main id="main" className="page gate">
      <p className="label">my tea</p>
      <h1 className="headline">
        <span className="soft">{browser === "kakao" ? "카카오톡" : "이 앱"} 안에서는 기록 저장과 파일 받기가 되지 않아</span>{" "}
        {auto ? "브라우저로 열고 있어요" : "사파리로 열어 주세요"}
      </h1>
      {auto ? (
        <div className="stack" style={{ marginTop: 32 }}>
          <p className="hint">자동으로 열리지 않으면 아래 버튼을 눌러 주세요.</p>
          <button type="button" className="btn btn-primary btn-block" onClick={() => openInExternalBrowser(browser)}>
            브라우저로 열기
          </button>
        </div>
      ) : (
        <p className="sub" style={{ marginTop: 32 }}>
          화면 아래나 위의 <strong>···</strong> 또는 공유 버튼을 누르고 &lsquo;Safari로 열기&rsquo;(또는 &lsquo;기본 브라우저로 열기&rsquo;)를
          선택해 주세요.
        </p>
      )}
      <p className="hint" style={{ marginTop: 24 }}>
        브라우저에서 연 뒤 &lsquo;홈 화면에 추가&rsquo;를 해 두면 다음부터는 아이콘으로 바로 열 수 있어요.
      </p>
    </main>
  );
}
