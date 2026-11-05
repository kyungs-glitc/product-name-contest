// 검토, 투표, 결과 페이지가 함께 쓰는 자료. 어느 페이지가 열리는지는 응답 시트의 설정 탭이 정한다(site.js).

// { name, why, result: '통과' | '보류' | '탈락', note, finalist: 투표 후보인지 }
// 투표 후보의 name은 구글 폼 선택지와 글자까지 같아야 한다. 다르면 구글이 그 응답을 버린다.
export const REVIEWS = [];

export const finalists = REVIEWS.filter(r => r.finalist);

// 회차별 득표. 담당자 검수를 마친 숫자만 넣는다. 마지막 회차의 1위가 하나면 확정, 둘 이상이면 재투표다.
// { title, method, voters, results: [{ name, votes }] }
export const ROUNDS = [];
