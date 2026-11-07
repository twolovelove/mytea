import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "쿠키정책 · my tea" };

export default function Cookies() {
  return (
    <LegalPage title="쿠키정책">
      <h2>쿠키를 쓰지 않아요</h2>
      <p>
        my tea는 쿠키를 설정하지 않으며, 광고·분석·추적 도구나 외부 SDK(구글 애널리틱스, 메타 픽셀 등)를 쓰지 않습니다. 글꼴과 아이콘도
        외부에서 불러오지 않습니다.
      </p>

      <h2>대신 브라우저 저장소를 써요</h2>
      <p>서비스가 동작하는 데 꼭 필요한 정보만 이용자 브라우저에 저장하며, 이 정보는 운영자에게 전송되지 않습니다.</p>
      <table>
        <thead>
          <tr>
            <th scope="col">저장 위치</th>
            <th scope="col">내용과 목적</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>IndexedDB &lsquo;my-tea&rsquo;</td>
            <td>차 기록과 사진. 찻장을 보여 주기 위해 필요합니다.</td>
          </tr>
          <tr>
            <td>localStorage &lsquo;mytea.aiConsent&rsquo;</td>
            <td>AI 사진 분석에 동의한 시각. 동의를 다시 묻지 않기 위해 저장합니다.</td>
          </tr>
          <tr>
            <td>localStorage &lsquo;mytea.noticeSeen&rsquo;</td>
            <td>저장 방식 안내를 확인했는지 여부.</td>
          </tr>
          <tr>
            <td>localStorage &lsquo;mytea.installCardClosed&rsquo;</td>
            <td>홈 화면 추가 안내 카드를 닫았는지 여부.</td>
          </tr>
        </tbody>
      </table>

      <h2>지우는 방법</h2>
      <p>설정의 &lsquo;모든 데이터 삭제&rsquo;를 누르거나 브라우저 설정에서 이 사이트의 데이터를 지우면 모두 삭제됩니다.</p>
    </LegalPage>
  );
}
