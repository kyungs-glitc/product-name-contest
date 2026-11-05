import { parseCsv, toRoster, stageReached, roundCandidates, minPicks, allVoted } from '../logic.js?v=4';
import { readSettings, applyTabs } from '../site.js?v=4';
import { finalists, ROUNDS } from './candidates.js?v=4';

const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfdbIeRtS_T6rCsCfom0NxlhWYU9l2o6MwTG6AKbOycAZl8Ew/formResponse';
// 세 칸 모두 단답형이다. 고른 이름은 ' | '로 이어 한 칸에 보내므로 후보가 바뀌어도 폼을 고칠 필요가 없다.
const FIELDS = { choice: 'entry.1198450613', voter: 'entry.401715241', round: 'entry.1977574647' };
// 공개용 시트. 이름과 현재 회차의 투표 여부만 들어 있다. 어떤 이름을 골랐는지는 비공개 투표 시트에만 있다.
const STATUS_SHEET_ID = '1YDHIWzrIaQCxTC6jFN-BWObWYUCMjI7LHaFLJsmXKdc';
const STATUS_GID = '1855686233';
const POLL_MS = 60_000;

const $ = id => document.getElementById(id);
let roster = [], loaded = false, justVoted = '', settings = null, builtRound = 0, votedRound = 0, minPick = 2;

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

const pickedBoxes = () => [...document.querySelectorAll('input[name="choice"]:checked')];
const syncPicks = () => { $('picked').textContent = `${pickedBoxes().length}개 선택`; };
$('choices').addEventListener('change', syncPicks);

// 회차가 바뀔 때만 카드를 다시 만든다. 주기적으로 읽을 때 체크가 풀리면 안 된다.
function buildChoices(round) {
  if (builtRound === round) return;
  builtRound = round;
  const candidates = roundCandidates(round, finalists, ROUNDS);
  minPick = minPicks(round, candidates.length);
  $('pick-legend').textContent = round === 1
    ? `마음에 드는 이름을 ${minPick}개 이상 체크해 주세요`
    : `${round}차 재투표: 동률 후보 중 1개만 골라 주세요`;
  $('choices').replaceChildren(...candidates.map((c, i) => {
    const label = el('label', 'choice');
    const box = el('input');
    box.type = round === 1 ? 'checkbox' : 'radio'; // 재투표는 1인 1표라 하나만 고를 수 있게 한다
    box.name = 'choice';
    box.value = c.name;
    box.id = 'c' + i;
    const text = el('span', 'choice-text');
    text.append(el('span', 'nm', c.name), el('span', 'why', c.why));
    label.append(box, el('span', 'check'), text);
    return label;
  }));
  syncPicks();
}

function renderVoters() {
  const select = $('f-voter'), current = select.value;
  const placeholder = el('option', '', loaded ? '내 이름을 고르세요' : '명단을 불러오는 중입니다');
  placeholder.value = '';
  // 이미 투표한 이름은 목록에서 뺀다. 잘못 눌렸으면 담당자가 시트에서 정리한다.
  select.replaceChildren(placeholder, ...roster.filter(p => !p.voted).map(p => {
    const opt = el('option', '', p.name);
    opt.value = p.name;
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
    if (p.voted) li.append(el('span', 'sr', '투표 완료')); // 색만으로 알리지 않도록 읽어 주는 글자를 둔다
    else if (p.name === justVoted) li.append(el('span', 'tag wait', '반영 대기'));
    return li;
  }));
}

function applyState() {
  const { stage, round } = settings;
  const started = stageReached(stage, '투표');
  document.querySelector('.board').hidden = !started;
  if (stage === '투표') {
    buildChoices(round);
    if (allVoted(roster)) {
      showNotice('모든 인원이 투표를 마쳐 투표가 마감되었습니다. 담당자가 확인한 뒤 결과 탭에 표시됩니다.');
    } else if (votedRound !== round) {
      justVoted = '';
      $('form').hidden = false;
      $('notice').hidden = true;
    }
  } else if (stage === '결과') {
    showNotice('투표가 마감되었습니다. 담당자가 확인한 뒤 결과 탭에 표시됩니다.');
  } else if (stage === '검토') {
    showNotice('투표 시작 전입니다. 투표가 열리면 이곳에서 투표할 수 있습니다.');
  } else {
    showNotice('투표를 준비하고 있습니다. 후보가 확정되면 열립니다.');
  }
}

async function readRoster() {
  const url = `https://docs.google.com/spreadsheets/d/${STATUS_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${STATUS_GID}&headers=1&t=${Date.now()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return toRoster(parseCsv(await res.text()));
}

async function load() {
  try {
    settings = await readSettings();
    applyTabs(settings);
    applyState();
  } catch {
    // 상태를 읽지 못하면 이전 화면을 유지하고 다음 주기에 다시 읽는다.
    if (!settings) showNotice('투표를 준비하고 있습니다. 후보가 확정되면 열립니다.');
    return;
  }
  // 투표가 시작되기 전에는 명단을 읽지 않는다.
  if (!stageReached(settings.stage, '투표')) return;
  try {
    roster = await readRoster();
    loaded = true;
    $('status-note').hidden = true;
  } catch {
    if (!loaded) {
      $('status-note').hidden = false;
      $('status-note').textContent = '명단을 불러오지 못했습니다. 잠시 후 저절로 다시 불러옵니다.';
    }
  }
  renderVoters();
  renderStatus();
  applyState(); // 명단을 읽은 뒤에야 전원 완료를 알 수 있다
}

$('form').addEventListener('submit', async e => {
  e.preventDefault();
  const chosen = pickedBoxes().map(box => box.value);
  const voter = $('f-voter').value;
  if (!voter) return setStatus('warn', '내 이름을 골라 주세요.');
  if (chosen.length < minPick) return setStatus('warn', $('pick-legend').textContent + '.');
  const btn = $('f-submit');
  btn.disabled = true;
  setStatus('', '투표하는 중입니다.');
  try {
    // ponytail: no-cors라 구글의 응답을 읽을 수 없다. 접수 여부는 현황에 완료로 바뀌는지로 판단한다.
    const body = new URLSearchParams({ [FIELDS.voter]: voter, [FIELDS.round]: `${settings.round}차`, [FIELDS.choice]: chosen.join(' | ') });
    await fetch(FORM_URL, { method: 'POST', mode: 'no-cors', body });
    justVoted = voter;
    votedRound = settings.round;
    setStatus('', '');
    showNotice(`${chosen.map(n => `'${n}'`).join(', ')}에 투표했습니다. 잠시 후 아래 현황에 완료로 표시됩니다.`);
    renderStatus();
    setTimeout(load, 3000);
  } catch {
    setStatus('bad', '투표하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 눌러 주세요.');
  } finally {
    btn.disabled = false;
  }
});

showNotice('투표를 준비하고 있습니다. 후보가 확정되면 열립니다.');
document.querySelector('.board').hidden = true;
load();
setInterval(load, POLL_MS);
