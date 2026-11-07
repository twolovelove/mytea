import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { OPERATOR } from "@/lib/operator";

export const metadata: Metadata = { title: "개인정보처리방침 · my tea" };

export default function Privacy() {
  return (
    <LegalPage title="개인정보처리방침">
      <p>
        {OPERATOR.name}(이하 &lsquo;운영자&rsquo;)는 my tea(이하 &lsquo;서비스&rsquo;)를 운영하며 「개인정보 보호법」을 지킵니다.
        서비스는 회원가입이 없고, 운영자 서버에 이용자의 정보를 저장하지 않도록 설계했습니다.
      </p>

      <h2>1. 수집하는 정보</h2>
      <p>운영자는 이름, 연락처, 이메일 등 이용자를 식별하는 정보를 수집하지 않습니다.</p>
      <ul>
        <li>
          <strong>이용자 기기에만 저장되는 정보:</strong> 이용자가 입력한 차 기록(이름, 종류, 우리는 방법, 유통기한, 남은 양, 메모)과 차
          사진. 이 정보는 이용자 브라우저의 저장소(IndexedDB)에만 보관되며 운영자에게 전송되지 않습니다.
        </li>
        <li>
          <strong>AI 분석을 위해 일시적으로 처리되는 정보:</strong> 이용자가 동의하고 사진 분석을 요청한 경우의 차 사진. 사진은 전송 전에
          이용자 기기에서 다시 저장되어 촬영 위치(GPS) 등 메타데이터가 제거됩니다.
        </li>
        <li>
          <strong>자동으로 생성되는 정보:</strong> 서비스를 호스팅하는 서버는 보안과 남용 방지를 위해 접속 IP 주소, 접속 시각 등을
          일시적으로 처리할 수 있습니다. 운영자는 이를 이용자 식별이나 마케팅에 쓰지 않습니다.
        </li>
      </ul>

      <h2 id="ai">2. 개인정보 처리 위탁 및 국외 이전</h2>
      <p>사진 분석 기능을 사용하면 사진이 아래와 같이 국외로 전송됩니다. 동의하지 않아도 직접 입력으로 서비스를 모두 이용할 수 있습니다.</p>
      <table>
        <tbody>
          <tr>
            <th scope="row">이전받는 자</th>
            <td>Anthropic, PBC (privacy@anthropic.com)</td>
          </tr>
          <tr>
            <th scope="row">이전 국가</th>
            <td>미국</td>
          </tr>
          <tr>
            <th scope="row">이전 일시 및 방법</th>
            <td>이용자가 사진 분석을 요청할 때마다 암호화된 네트워크(HTTPS)로 전송</td>
          </tr>
          <tr>
            <th scope="row">이전 항목</th>
            <td>차 사진 (위치정보 등 메타데이터 제거)</td>
          </tr>
          <tr>
            <th scope="row">이용 목적</th>
            <td>사진 속 차의 종류, 이름, 우리는 방법 등 분석</td>
          </tr>
          <tr>
            <th scope="row">보유 기간</th>
            <td>
              분석 후 운영자 서버에는 저장하지 않음. Anthropic의 보관 기간은 Anthropic의{" "}
              <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noreferrer">
                개인정보 처리방침
              </a>
              을 따름
            </td>
          </tr>
          <tr>
            <th scope="row">거부 방법</th>
            <td>사진 분석 동의를 하지 않거나 설정에서 철회. 거부해도 직접 입력 기능은 그대로 이용 가능</td>
          </tr>
        </tbody>
      </table>
      <p>사람의 얼굴 등 다른 사람의 정보가 사진에 담기지 않도록 차만 찍어 주세요.</p>

      <h2>3. 보유 기간과 파기</h2>
      <p>
        기기에 저장된 정보는 이용자가 직접 삭제할 때까지 보관됩니다. 설정의 &lsquo;모든 데이터 삭제&rsquo;를 누르거나 브라우저의 사이트
        데이터를 지우면 즉시 파기됩니다. 운영자는 이용자의 기기 데이터에 접근할 수 없어 대신 삭제해 드릴 수 없습니다.
      </p>

      <h2>4. 이용자의 권리</h2>
      <p>
        이용자는 언제든 자신의 정보를 열람, 수정, 삭제, 내보내기 할 수 있습니다. 차 상세 화면에서 수정·삭제하고, 설정에서 전체 내보내기와
        전체 삭제를 할 수 있습니다. AI 분석 동의도 설정에서 철회할 수 있습니다.
      </p>

      <h2>5. 만 14세 미만 아동</h2>
      <p>
        서비스는 이용자를 식별하는 개인정보를 수집하지 않으므로 아동의 개인정보도 수집하지 않습니다. 만 14세 미만 이용자는 사진 분석 기능을
        쓰기 전에 보호자와 함께 이 방침을 확인해 주세요.
      </p>

      <h2>6. 쿠키와 추적 도구</h2>
      <p>
        서비스는 쿠키, 광고 식별자, 분석·추적 도구를 쓰지 않습니다. 자세한 내용은 <Link href="/cookies">쿠키정책</Link>을 확인해 주세요.
      </p>

      <h2>7. 안전성 확보 조치</h2>
      <p>모든 통신은 HTTPS로 암호화되며, AI 분석 키는 서버에만 보관되어 브라우저에 노출되지 않습니다.</p>

      <h2>8. 개인정보 보호책임자</h2>
      <p>
        개인정보 보호책임자: {OPERATOR.privacyOfficer}
        <br />
        문의: {OPERATOR.email}
      </p>
      <p>
        개인정보 침해에 대한 상담은 개인정보침해신고센터(국번 없이 118, privacy.kisa.or.kr), 개인정보분쟁조정위원회(1833-6972,
        www.kopico.go.kr)에 문의할 수 있습니다.
      </p>

      <h2>9. 방침의 변경</h2>
      <p>이 방침이 바뀌면 시행 7일 전에 서비스 화면에 알립니다. 이용자에게 불리한 변경은 30일 전에 알립니다.</p>
    </LegalPage>
  );
}
