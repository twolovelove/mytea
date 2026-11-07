import type { Metadata, Viewport } from "next";
import { StorageNotice } from "@/components/StorageNotice";
import "./globals.css";

export const metadata: Metadata = {
  title: "my tea",
  description: "사진 한 장으로 정리하는 나의 찻장",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
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
        {children}
        <StorageNotice />
      </body>
    </html>
  );
}
