"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { canPromptInstall, detectPlatform, isStandalone, promptInstall, type Platform } from "@/lib/install";

const GUIDES: Record<Platform, { title: string; steps: string[] }> = {
  ios: {
    title: "아이폰 · 사파리",
    steps: [
      "사파리에서 이 페이지를 열어 주세요. 인스타그램이나 카카오톡 안이라면 먼저 ··· 메뉴에서 ‘Safari로 열기’를 눌러 주세요.",
      "화면 아래 가운데의 공유 버튼(네모에서 화살표가 나오는 모양)을 눌러 주세요.",
      "목록을 아래로 내려 ‘홈 화면에 추가’를 눌러 주세요.",
      "오른쪽 위 ‘추가’를 누르면 홈 화면에 my tea 아이콘이 생겨요.",
    ],
  },
  android: {
    title: "안드로이드 · 크롬",
    steps: [
      "크롬에서 이 페이지를 열어 주세요.",
      "오른쪽 위 ⋮ 메뉴를 눌러 주세요.",
      "‘홈 화면에 추가’ 또는 ‘앱 설치’를 눌러 주세요.",
      "‘추가’ 또는 ‘설치’를 누르면 홈 화면에 my tea 아이콘이 생겨요.",
    ],
  },
  samsung: {
    title: "갤럭시 · 삼성 인터넷",
    steps: [
      "삼성 인터넷에서 이 페이지를 열어 주세요.",
      "화면 아래 ≡ 메뉴를 눌러 주세요.",
      "‘현재 페이지 추가’를 누르고 ‘홈 화면’을 골라 주세요.",
      "‘추가’를 누르면 홈 화면에 my tea 아이콘이 생겨요.",
    ],
  },
  desktop: {
    title: "컴퓨터",
    steps: [
      "my tea는 휴대폰에서 쓰기 좋게 만들었어요.",
      "휴대폰 브라우저에서 이 주소를 열고 위의 방법대로 홈 화면에 추가해 주세요.",
    ],
  },
};

const ORDER: Platform[] = ["ios", "android", "samsung"];

function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="steps">
      {steps.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ol>
  );
}

export default function Install() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [installed, setInstalled] = useState(false);
  const [nativePrompt, setNativePrompt] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(isStandalone());
    setNativePrompt(canPromptInstall());
  }, []);

  if (!platform) return <main id="main" className="page" />;

  const guide = GUIDES[platform];
  const others = ORDER.filter((p) => p !== platform);

  return (
    <main id="main" className="page">
      <div className="topbar">
        <Link href="/">← 찻장</Link>
      </div>

      <p className="label">앱처럼 쓰기</p>
      <h1 className="headline">
        홈 화면에 추가하기 <span className="soft">아이콘을 누르면 바로 찻장이 열려요</span>
      </h1>

      {installed ? (
        <p className="sub" style={{ marginTop: 32 }}>
          이미 홈 화면 앱으로 쓰고 있어요.
        </p>
      ) : (
        <>
          {nativePrompt && (
            <button
              type="button"
              className="btn btn-primary btn-block"
              style={{ marginTop: 32 }}
              onClick={async () => {
                if (await promptInstall()) setInstalled(true);
                setNativePrompt(false);
              }}
            >
              홈 화면에 추가
            </button>
          )}

          <section className="block" aria-label={guide.title}>
            <p className="label">{guide.title}</p>
            <Steps steps={guide.steps} />
          </section>
        </>
      )}

      <section className="block">
        <p className="label">꼭 알아 두세요</p>
        <p className="sub">
          차 기록은 이 휴대폰 안, 그리고 연 곳(브라우저나 홈 화면 앱)마다 따로 저장돼요. 홈 화면에 추가한 뒤에는 늘 그 아이콘으로 열어
          주세요.
          {platform === "ios" && " 아이폰은 사파리와 홈 화면 앱의 기록도 서로 달라요."}
        </p>
        <p className="hint" style={{ marginTop: 8 }}>
          휴대폰을 바꿀 때는 설정의 &lsquo;파일로 내보내기&rsquo;로 백업해 두세요.
        </p>
      </section>

      {platform !== "desktop" &&
        others.map((p) => (
          <details key={p} className="other-guide">
            <summary>{GUIDES[p].title}에서는</summary>
            <Steps steps={GUIDES[p].steps} />
          </details>
        ))}
      {platform === "desktop" &&
        ORDER.map((p) => (
          <section key={p} className="block">
            <p className="label">{GUIDES[p].title}</p>
            <Steps steps={GUIDES[p].steps} />
          </section>
        ))}
    </main>
  );
}
