/* 카카오톡 채널 1:1 채팅 설정 — 채널 「안박사」
   ──────────────────────────────────────────────────────────────
   · channelPublicId  (필수, 이미 채워져 있음)
       카카오톡 채널 홈 주소 https://pf.kakao.com/_xhxgwxaX 의 _xhxgwxaX 부분.
       이 값만 있어도 '카카오톡으로 문의하기' 단추가 동작합니다
       (채널 1:1 채팅 주소를 새 창으로 엽니다).

   · javascriptKey    (선택, 채우면 더 매끄러워짐)
       developers.kakao.com → 내 애플리케이션 → 앱 설정 → 앱 키 → JavaScript 키.
       채우면 Kakao JS SDK 의 Kakao.Channel.chat() 으로 열어, 카카오톡 앱이 있으면
       앱에서 바로 채팅방이 열립니다. 비워 두면 위의 주소 방식으로 동작합니다.

       채우기 전에 개발자 콘솔에서 미리 해 두실 일
       1) 애플리케이션 추가 → 카카오톡 채널 「안박사」를 앱에 연결
       2) 앱 → 플랫폼 → Web → 사이트 도메인에 아래를 등록
            https://akhbeing-design.github.io
            http://localhost:8791        (내 PC 미리보기용, 선택)
       도메인을 등록하지 않으면 SDK 호출이 막히는데, 그때는 주소 방식으로 넘어갑니다.
*/
window.KAKAO_CHANNEL = {
  channelPublicId: "_xhxgwxaX",
  javascriptKey: ""
};
