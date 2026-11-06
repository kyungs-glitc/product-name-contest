import { stageReached } from '../logic.js?v=6';
import { readSettings, applyTabs } from '../site.js?v=6';
import { REVIEWS, finalists } from './candidates.js?v=8';

const POLL_MS = 60_000;
const $ = id => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};
const RESULT_CLASS = { 통과: 'pass', 보류: 'hold', 탈락: 'fail' };

$('finals').replaceChildren(...finalists.map(r => {
  const li = el('li', 'final');
  li.append(el('span', 'nm', r.name), el('span', 'why', r.why));
  return li;
}));
$('reviews').replaceChildren(...REVIEWS.map(r => {
  const tr = el('tr');
  const name = el('td', 'name-cell', r.name);
  if (r.finalist) name.append(' ', el('span', 'tag', '투표 후보'));
  const result = el('td');
  result.append(el('span', `result ${RESULT_CLASS[r.result] ?? ''}`, r.result));
  tr.append(name, el('td', '', r.why), result, el('td', '', r.note));
  return tr;
}));

function render(settings) {
  applyTabs(settings);
  const open = stageReached(settings.stage, '검토') && REVIEWS.length > 0;
  $('content').hidden = !open;
  $('notice').hidden = open;
  if (!open) $('notice').textContent = '상표 검토를 진행하고 있습니다. 결과가 확정되면 이곳에 표시됩니다.';
  const voting = settings.stage === '투표';
  $('vote-open').hidden = !voting;
  $('go-vote').hidden = !voting;
}

async function load() {
  try {
    render(await readSettings());
  } catch {
    // 이전 화면을 유지하고 다음 주기에 다시 읽는다.
  }
}

$('notice').hidden = false;
$('notice').textContent = '상표 검토를 진행하고 있습니다. 결과가 확정되면 이곳에 표시됩니다.';
$('content').hidden = true;
load();
setInterval(load, POLL_MS);
