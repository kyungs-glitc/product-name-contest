// 화면과 무관한 계산만 둔다. logic.test.mjs로 검사한다.

// 띄어쓰기·대소문자·기호만 다른 이름은 같은 이름으로 본다.
export const normalize = s => s.normalize('NFC').toLowerCase().replace(/[\s\-_.·]/g, '');

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

// 응답 CSV → 목록. 시트에 올라온 순서를 지키고, 같은 이름은 먼저 올라온 것만 남긴다.
export function toEntries(rows) {
  const [head = [], ...body] = rows;
  const [n, w] = ['제품 이름', '이름 의미'].map(t => head.findIndex(h => h.startsWith(t)));
  const seen = new Set();
  return body.flatMap(r => {
    const name = (r[n] ?? '').trim().slice(0, 30), key = normalize(name);
    if (!key || seen.has(key)) return [];
    seen.add(key);
    return [{ name, why: (r[w] ?? '').trim().slice(0, 200) }];
  });
}

// 투표 현황 CSV(직원 이름, 투표 여부) → 명단. 시트의 순서를 지킨다.
export function toRoster(rows) {
  return rows.slice(1).flatMap(r => {
    const name = (r[0] ?? '').trim();
    return name ? [{ name, voted: (r[1] ?? '').trim() === '투표 완료' }] : [];
  });
}

// 설정 탭의 B1이 '예'이면 담당자가 수동으로 마감한 것이다.
export const isClosedBySheet = rows => rows[0]?.[1]?.trim() === '예';

// 남은 시간(ms) → '1일 2시간 3분 4초'. 앞쪽의 0 단위는 생략한다.
export function remainingText(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const d = Math.floor(total / 86400), h = Math.floor(total / 3600) % 24, m = Math.floor(total / 60) % 60, s = total % 60;
  if (d) return `${d}일 ${h}시간 ${m}분 ${s}초`;
  if (h) return `${h}시간 ${m}분 ${s}초`;
  if (m) return `${m}분 ${s}초`;
  return `${s}초`;
}

// 한 회차 득표 → 득표순 순위. 같은 표는 같은 순위. 1위가 둘 이상이면 동률이다.
export function rankRound(results) {
  const sorted = [...results].sort((a, b) => b.votes - a.votes);
  const rows = sorted.map(r => ({ ...r, rank: sorted.findIndex(x => x.votes === r.votes) + 1 }));
  const leaders = rows.filter(r => r.rank === 1).map(r => r.name);
  return { rows, leaders, tied: leaders.length > 1 };
}
