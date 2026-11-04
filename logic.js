// 화면과 무관한 계산만 둔다. logic.test.mjs로 검사한다.

// RFC 4180. 시트의 CSV는 칸 안의 쉼표·줄바꿈·따옴표를 따옴표로 감싸서 내보낸다.
export function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

// 응답 CSV → 목록. 시트에 올라온 순서를 지킨다. 같은 이름도 각각 올릴 수 있다.
export function toEntries(rows) {
  const [head = [], ...body] = rows;
  const [n, w, p] = ['제품 이름', '이름 의미', '제안자'].map(t => head.findIndex(h => h.startsWith(t)));
  return body.flatMap(r => {
    const name = (r[n] ?? '').trim().slice(0, 30);
    if (!name) return [];
    return [{ name, why: (r[w] ?? '').trim().slice(0, 200), who: (r[p] ?? '').trim().slice(0, 30) }];
  });
}

// 설정 탭의 B1이 '예'이면 담당자가 수동으로 마감한 것이다.
export const isClosedBySheet = rows => rows[0]?.[1]?.trim() === '예';
