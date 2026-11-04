import { parseCsv, toRoster } from '../logic.js';

// 공개 전 할 일: 1) CANDIDATES와 구글 폼 선택지를 실제 후보로 바꾼다 2) 폼을 게시한다 3) DEADLINE을 정한다 4) READY를 true로 바꾼다
const READY = false;
const DEADLINE = null; // 예: new Date('2026-11-13T18:00:00+09:00'). 구글 폼의 응답 종료일과 같아야 한다

const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfdbIeRtS_T6rCsCfom0NxlhWYU9l2o6MwTG6AKbOycAZl8Ew/formResponse';
const FIELDS = { choice: 'entry.1198450613', voter: 'entry.401715241' };
// name은 구글 폼의 선택지와 글자까지 같아야 한다. 다르면 구글이 그 응답을 버린다.
// 지금은 화면 확인용 임시 후보다. 상표 검토를 통과한 실제 후보로 바꾼다.
const CANDIDATES = [
  { name: '임시 후보 하늘지기', why: '하늘을 지키는 파수꾼이라는 뜻' },
  { name: '임시 후보 새벽눈', why: '남들보다 먼저 위협을 알아보는 눈' },
  { name: '임시 후보 한울타리', why: '여러 센서를 하나로 묶는 울타리' },
  { name: '임시 후보 온누리망', why: '온 세상을 살피는 감시망' },
];
const PICKS = 2; // 정확히 이 개수를 골라야 제출된다
// 공개용 시트. 이름과 투표 여부만 들어 있다. 어떤 이름을 골랐는지는 비공개 투표 시트에만 있다.
const STATUS_SHEET_ID = '1YDHIWzrIaQCxTC6jFN-BWObWYUCMjI7LHaFLJsmXKdc';
const STATUS_GID = '1855686233';
const POLL_MS = 60_000;

const $ = id => document.getElementById(id);
let roster = [], loaded = false, justVoted = '';

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};
function setStatus(kind, text) {
  $('status').className = 'status' + (kind ? ' ' + kind : '');
  $('status').textContent = text;
}
function showNotice(text) {
  $('form').hidden = true;
  $('notice').hidden = false;
  $('notice').textContent = text;
}

$('choices').replaceChildren(...CANDIDATES.map((c, i) => {
  const label = el('label', 'choice');
  const box = el('input');
  box.type = 'checkbox';
  box.name = 'choice';
  box.value = c.name;
  box.id = 'c' + i;
  const text = el('span', 'choice-text');
  text.append(el('span', 'nm', c.name), el('span', 'why', c.why));
  label.append(box, el('span', 'check'), text);
  return label;
}));
const pickedBoxes = () => [...document.querySelectorAll('input[name="choice"]:checked')];
// 정해진 개수를 고르면 나머지 카드를 잠근다. 하나를 풀면 다시 열린다.
function syncPicks() {
  const count = pickedBoxes().length, full = count >= PICKS;
  $('picked').textContent = `${count} / ${PICKS}개 선택`;
  document.querySelectorAll('input[name="choice"]').forEach(box => {
    box.disabled = full && !box.checked;
    box.closest('.choice').classList.toggle('off', box.disabled);
  });
}
$('choices').addEventListener('change', syncPicks);
syncPicks();

function applyState() {
  if (!READY) showNotice('투표를 준비하고 있습니다. 후보가 확정되면 열립니다.');
  else if (DEADLINE && Date.now() >= DEADLINE.getTime()) showNotice('투표가 마감되었습니다. 참여해 주셔서 감사합니다.');
}

function renderVoters() {
  const select = $('f-voter'), current = select.value;
  const placeholder = el('option', '', loaded ? '내 이름을 고르세요' : '명단을 불러오는 중입니다');
  placeholder.value = '';
  select.replaceChildren(placeholder, ...roster.map(p => {
    const opt = el('option', '', p.voted ? `${p.name} (투표 완료)` : p.name);
    opt.value = p.name;
    opt.disabled = p.voted; // 이미 투표한 이름은 고를 수 없다. 잘못 눌렸으면 담당자가 시트에서 정리한다.
    return opt;
  }));
  if (roster.some(p => p.name === current && !p.voted)) select.value = current;
}
function renderStatus() {
  const done = roster.filter(p => p.voted).length;
  $('tally').textContent = roster.length ? `${done} / ${roster.length}명 완료` : '';
  $('people').replaceChildren(...roster.map(p => {
    const li = el('li', p.voted ? 'person done' : 'person');
    li.append(el('span', '', p.name));
    if (p.voted) li.append(el('span', 'tag', '투표 완료'));
    else if (p.name === justVoted) li.append(el('span', 'tag wait', '반영 대기'));
    return li;
  }));
}

async function load() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${STATUS_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${STATUS_GID}&headers=1&t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    roster = toRoster(parseCsv(await res.text()));
    loaded = true;
    $('status-note').hidden = true;
  } catch {
    // 이전 명단을 유지하고 다음 주기에 다시 읽는다.
    if (!loaded) {
      $('status-note').hidden = false;
      $('status-note').textContent = '명단을 불러오지 못했습니다. 잠시 후 저절로 다시 불러옵니다.';
    }
  }
  renderVoters();
  renderStatus();
}

$('form').addEventListener('submit', async e => {
  e.preventDefault();
  const picks = pickedBoxes().map(box => box.value);
  const voter = $('f-voter').value;
  if (!voter) return setStatus('warn', '내 이름을 골라 주세요.');
  if (picks.length !== PICKS) return setStatus('warn', `마음에 드는 이름을 ${PICKS}개 체크해 주세요.`);
  const btn = $('f-submit');
  btn.disabled = true;
  setStatus('', '투표하는 중입니다.');
  try {
    // ponytail: no-cors라 구글의 응답을 읽을 수 없다. 접수 여부는 현황에 완료로 바뀌는지로 판단한다.
    const body = new URLSearchParams({ [FIELDS.voter]: voter });
    picks.forEach(name => body.append(FIELDS.choice, name)); // 체크박스는 같은 칸 이름을 반복해서 보낸다
    await fetch(FORM_URL, { method: 'POST', mode: 'no-cors', body });
    justVoted = voter;
    showNotice(`${picks.map(n => `'${n}'`).join(', ')}에 투표했습니다. 잠시 후 아래 현황에 완료로 표시됩니다.`);
    renderStatus();
    setTimeout(load, 3000);
  } catch {
    setStatus('bad', '투표하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 눌러 주세요.');
    btn.disabled = false;
  }
});

applyState();
load();
setInterval(() => { applyState(); load(); }, POLL_MS);
