// Messenger/SNS in-app browsers keep their own storage (so teas saved there
// don't show up in Chrome or Safari) and usually block file downloads.

export type InAppBrowser = "kakao" | "other";

export function detectInAppBrowser(): InAppBrowser | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/KAKAOTALK/i.test(ua)) return "kakao";
  if (/Instagram|FBAN|FBAV|NAVER\(inapp|Line\/|DaumApps|everytimeApp/i.test(ua)) return "other";
  return null;
}

export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

/** Whether `openInExternalBrowser` can leave this in-app browser on its own. */
export function canOpenExternally(browser: InAppBrowser): boolean {
  return browser === "kakao" || isAndroid();
}

export function openInExternalBrowser(browser: InAppBrowser) {
  const url = window.location.href;
  if (browser === "kakao") {
    // KakaoTalk hands the page to the phone's default browser.
    window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
  } else if (isAndroid()) {
    const { protocol, host, pathname, search } = window.location;
    window.location.href = `intent://${host}${pathname}${search}#Intent;scheme=${protocol.replace(":", "")};package=com.android.chrome;end`;
  }
}
