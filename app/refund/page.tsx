import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { OPERATOR } from "@/lib/operator";

export const metadata: Metadata = { title: "환불정책 · my tea" };

export default function Refund() {
  return (
    <LegalPage title="환불정책">
      <h2>현재: 무료 서비스</h2>
      <p>my tea는 현재 모든 기능을 무료로 제공합니다. 결제, 구독, 인앱 구매가 없으므로 환불할 금액도 발생하지 않습니다.</p>

      <h2>유료 기능을 도입할 경우</h2>
      <ul>
        <li>결제 전에 가격, 결제 주기, 해지 방법을 한 화면에 명확히 보여 드립니다.</li>
        <li>무료 체험이 유료로 전환되는 경우 전환 전에 미리 알립니다.</li>
        <li>해지는 가입만큼 쉬운 방법으로 할 수 있게 합니다.</li>
        <li>
          청약철회와 환불은 「전자상거래 등에서의 소비자보호에 관한 법률」을 따르며, 앱 마켓을 통한 결제는 해당 마켓의 환불 절차도 함께
          안내합니다.
        </li>
      </ul>
      <p>유료 기능 도입 시 이 정책을 구체적으로 개정하고, 시행 전에 서비스 화면에 알립니다.</p>

      <h2>문의</h2>
      <p>{OPERATOR.email}</p>
    </LegalPage>
  );
}
