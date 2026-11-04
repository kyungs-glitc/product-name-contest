import { rankRound } from '../logic.js?v=3';
import { RESULT_OPEN, VOTE_OPEN, ROUNDS } from './candidates.js?v=3';

const $ = id => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};

if (!RESULT_OPEN || !ROUNDS.length) {
  $('content').hidden = true;
  $('notice').hidden = false;
  $('notice').textContent = '투표가 끝나고 집계가 확정되면 결과가 표시됩니다.';
} else {
  const ranked = ROUNDS.map(r => ({ ...r, ...rankRound(r.results) }));
  const last = ranked[ranked.length - 1];

  const verdict = $('verdict');
  if (last.tied) {
    verdict.classList.add('tied');
    verdict.append(
      el('span', 'verdict-label', `${last.title} 결과 동률`),
      el('strong', 'verdict-name', last.leaders.join(', ')),
      el('span', '', '이 후보들로 재투표를 진행합니다.'),
    );
    if (VOTE_OPEN) {
      const go = el('a', 'primary', '재투표하러 가기');
      go.href = './ballot.html';
      verdict.append(go);
    }
  } else {
    verdict.append(el('span', 'verdict-label', '새 이름이 정해졌습니다'), el('strong', 'verdict-name', last.leaders[0]));
  }

  // 최근 회차가 위로
  $('rounds').replaceChildren(...[...ranked].reverse().map((r, i) => {
    const box = el('section', 'round');
    const top = el('div', 'board-head');
    top.append(el('h3', '', r.title), el('p', 'tally', `${r.voters}명 참여 · ${r.method}`));
    const wrap = el('div', 'table-wrap');
    const table = el('table', 'round-table');
    const thead = el('thead'), hr = el('tr');
    ['순위', '이름', '득표'].forEach(t => { const th = el('th', '', t); th.scope = 'col'; hr.append(th); });
    thead.append(hr);
    const tbody = el('tbody');
    r.rows.forEach(row => {
      const lead = row.rank === 1;
      const tr = el('tr', lead ? 'lead' : '');
      const name = el('td', 'name-cell', row.name);
      if (lead && r.tied) name.append(' ', el('span', 'tag tie', '동률'));
      if (lead && !r.tied && i === 0) name.append(' ', el('span', 'tag win', '선정'));
      tr.append(el('td', 'num', String(row.rank)), name, el('td', 'num', String(row.votes)));
      tbody.append(tr);
    });
    table.append(thead, tbody);
    wrap.append(table);
    box.append(top, wrap);
    return box;
  }));
}
