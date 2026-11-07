import Link from "next/link";
import { POLICY_EFFECTIVE_DATE } from "@/lib/operator";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main id="main" className="page legal">
      <div className="topbar">
        <Link href="/">← 찻장</Link>
      </div>
      <h1>{title}</h1>
      <p className="label">시행일: {POLICY_EFFECTIVE_DATE}</p>
      {children}
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
