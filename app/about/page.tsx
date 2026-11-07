import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { OPERATOR } from "@/lib/operator";

export const metadata: Metadata = { title: "운영자 정보 · my tea" };

export default function About() {
  const rows: [string, string][] = [
    ["상호", OPERATOR.name],
    ["대표자", OPERATOR.representative],
    ["사업자등록번호", OPERATOR.businessNumber],
    ["통신판매업 신고번호", OPERATOR.mailOrderNumber],
    ["주소", OPERATOR.address],
    ["이메일", OPERATOR.email],
    ["개인정보 보호책임자", OPERATOR.privacyOfficer],
  ];
  return (
    <LegalPage title="운영자 정보">
      <table>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <th scope="row">{k}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>사용한 오픈소스와 리소스</h2>
      <p>
        글꼴은 기기에 설치된 시스템 글꼴을 사용하고, 아이콘은 직접 그렸습니다. 서비스 코드에 사용한 오픈소스(Next.js, React, idb, Zod, fflate,
        Anthropic SDK)는 MIT 또는 Apache 2.0 라이선스를 따릅니다.
      </p>
    </LegalPage>
  );
}
