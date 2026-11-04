// 검토, 투표, 결과 페이지가 함께 쓰는 자료. 이 파일 하나만 고치면 페이지와 상단 탭이 같이 바뀐다.
// 검토를 열 때: REVIEWS를 채우고 REVIEW_OPEN을 true로 바꾼다.
// 투표를 열 때: 구글 폼 선택지를 투표 후보와 똑같이 맞추고 폼을 게시한 뒤,
// 공개용 시트를 링크 뷰어로 공유하고 ballot.js의 DEADLINE을 정하고 VOTE_OPEN을 true로 바꾼다.
export const REVIEW_OPEN = false;
export const VOTE_OPEN = false;
export const RESULT_OPEN = false;

// { name, why, result: '통과' | '보류' | '탈락', note, finalist: 투표 후보인지 }
// 투표 후보의 name은 구글 폼 선택지와 글자까지 같아야 한다. 다르면 구글이 그 응답을 버린다.
export const REVIEWS = [];

export const finalists = REVIEWS.filter(r => r.finalist);

// 회차별 득표. 담당자 검수를 마친 숫자만 넣는다. 마지막 회차의 1위가 하나면 확정, 둘 이상이면 재투표다.
// { title, method, voters, results: [{ name, votes }] }
export const ROUNDS = [];
