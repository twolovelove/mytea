import type { Metadata, Viewport } from "next";
import { InAppGate } from "@/components/InAppGate";
import { StorageNotice } from "@/components/StorageNotice";
import "./globals.css";

export const metadata: Metadata = {
  title: "my tea",
  description: "사진 한 장으로 정리하는 나의 찻장",
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "my tea", statusBarStyle: "default" },
  // Next.js only emits the generic `mobile-web-app-capable`; older iOS versions
  // still need the Apple-specific tag to open from the home screen without Safari UI.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <a className="skip-link" href="#main">
          본문으로 건너뛰기
        </a>
        <InAppGate>{children}</InAppGate>
        <StorageNotice />
      </body>
    </html>
  );
}
