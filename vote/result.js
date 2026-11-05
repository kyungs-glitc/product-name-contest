import { rankRound, stageReached, MAX_ROUNDS } from '../logic.js?v=5';
import { readSettings, applyTabs } from '../site.js?v=5';
import { ROUNDS } from './candidates.js?v=5';

const POLL_MS = 60_000;
const $ = id => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};
const ranked = ROUNDS.map(r => ({ ...r, ...rankRound(r.results) }));
const last = ranked[ranked.length - 1];

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

function renderVerdict(settings) {
  const verdict = $('verdict');
  verdict.className = 'verdict';
  verdict.replaceChildren();
  const posted = ranked.length >= settings.round;
  if (settings.stage === '투표' && settings.round > ranked.length) {
    verdict.classList.add('tied');
    verdict.append(
      el('span', 'verdict-label', `${settings.round}차 재투표 진행 중`),
      el('strong', 'verdict-name', last.leaders.join(', ')),
    );
    const go = el('a', 'primary', '재투표하러 가기');
    go.href = './ballot.html';
    verdict.append(go);
  } else if (!posted) {
    verdict.classList.add('tied');
    verdict.append(el('span', 'verdict-label', `${settings.round}차 투표를 집계하고 있습니다`));
  } else if (last.tied) {
    verdict.classList.add('tied');
    verdict.append(
      el('span', 'verdict-label', `${last.title} 결과 동률`),
      el('strong', 'verdict-name', last.leaders.join(', ')),
      el('span', '', settings.round >= MAX_ROUNDS ? '담당자가 최종 이름을 결정합니다.' : '이 후보들로 재투표를 진행합니다.'),
    );
  } else {
    verdict.append(el('span', 'verdict-label', '새 이름이 정해졌습니다'), el('strong', 'verdict-name', last.leaders[0]));
  }
}

function render(settings) {
  applyTabs(settings);
  const open = stageReached(settings.stage, '결과') || (settings.stage === '투표' && settings.round > 1);
  const hasRounds = ranked.length > 0;
  $('content').hidden = !open || !(hasRounds || settings.stage === '결과');
  $('notice').hidden = !$('content').hidden;
  if (!$('content').hidden) renderVerdict(settings);
  $('rounds-section').hidden = !hasRounds;
}

async function load() {
  try {
    render(await readSettings());
  } catch {
    // 이전 화면을 유지하고 다음 주기에 다시 읽는다.
  }
}

$('content').hidden = true;
$('notice').hidden = false;
$('notice').textContent = '투표가 끝나고 집계가 확정되면 결과가 표시됩니다.';
load();
setInterval(load, POLL_MS);
