// 두 페이지가 함께 쓰는 후보 자료. 이 파일 하나만 고치면 검토 결과와 투표 화면이 같이 바뀐다.
// 공개 전 할 일: 1) REVIEWS를 실제 검토 결과로 바꾼다 2) 구글 폼 선택지를 최종 후보와 똑같이 맞춘다
// 3) 폼을 게시한다 4) ballot.js의 DEADLINE을 정한다 5) READY를 true로 바꾼다
export const READY = false;

// result: 통과 · 보류 · 탈락. finalist: 투표에 올릴 최종 후보.
// 최종 후보의 name은 구글 폼 선택지와 글자까지 같아야 한다. 다르면 구글이 그 응답을 버린다.
// 지금은 화면 확인용 임시 값이다. 실제 상표 검토 결과가 아니다.
export const REVIEWS = [
  { name: '임시 후보 하늘지기', why: '하늘을 지키는 파수꾼이라는 뜻', result: '통과', note: '유사 상표 없음', finalist: true },
  { name: '임시 후보 새벽눈', why: '남들보다 먼저 위협을 알아보는 눈', result: '통과', note: '유사 상표 없음', finalist: true },
  { name: '임시 후보 한울타리', why: '여러 센서를 하나로 묶는 울타리', result: '통과', note: '유사 상표 없음', finalist: true },
  { name: '임시 후보 온누리망', why: '온 세상을 살피는 감시망', result: '통과', note: '유사 상표 없음', finalist: true },
  { name: '임시 후보 빛그물', why: '빛처럼 빠르게 펼치는 그물', result: '보류', note: '유사 상표 1건, 추가 확인 필요', finalist: false },
  { name: '임시 후보 파수대', why: '높은 곳에서 지켜보는 자리', result: '탈락', note: '같은 이름의 등록 상표 있음', finalist: false },
];

export const finalists = REVIEWS.filter(r => r.finalist);
