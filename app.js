import { normalize, parseCsv, toEntries, remainingText } from './logic.js?v=5';
import { readSettings, applyTabs } from './site.js?v=5';

const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScrlWmUM1ZKDFdGTg7XmzUHIqunk4-maDLF785r5-6hqzXPIQ/formResponse';
// who는 시트에만 남기고 화면에는 표시하지 않는다.
const FIELDS = { name: 'entry.69007877', why: 'entry.971116462', who: 'entry.1176835550' };
// 응답 시트. 링크 권한은 뷰어다. 편집 권한을 열면 이 주소를 아는 누구나 응답을 고칠 수 있다.
const SHEET_ID = '1xhNUG1WI_LKoT8WZmwP66g3z_U-er4KTHw45KideVC8';
const RESPONSES_GID = '1290317035';
// 기본 마감. 실제 마감은 여기에 설정 탭의 연장 시간을 더한 값이다. 구글 폼 종료일은 연장을 고려해 더 늦게 둔다.
const BASE_DEADLINE = new Date('2026-11-06T15:00:00+09:00').getTime();

const POLL_MS = 60_000;
// 제출 후 이 시간이 지나도 시트에 나타나지 않으면 접수되지 않은 것으로 안내한다.
const PENDING_LIMIT_MS = 10 * 60_000;
const SWEEP_SECONDS = 6; // CSS의 spin·ping 주기와 같아야 한다

const $ = id => document.getElementById(id);
let entries = [], pending = [], loaded = false;
let site = { closed: false, extendHours: 0, stage: '공모', round: 1 };
const deadline = () => BASE_DEADLINE + site.extendHours * 3_600_000;
const fmtDeadline = t => new Date(t).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric', weekday: 'short', hour: 'numeric', minute: '2-digit' });

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};
const isDuplicate = name => [...entries, ...pending].some(e => normalize(e.name) === normalize(name));
function setStatus(kind, text) {
  $('status').className = 'status' + (kind ? ' ' + kind : '');
  $('status').textContent = text;
}

function hash(s) {
  let h = 2166136261;
  for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// 같은 이름은 언제나 같은 자리에 찍힌다. 가운데 숫자를 가리지 않도록 안쪽은 비운다.
function blip(entry) {
  const h = hash(entry.name), deg = h % 360, r = 0.4 + 0.54 * ((h >>> 9) % 1000) / 1000;
  const rad = deg * Math.PI / 180, b = el('span', 'blip');
  b.style.left = (50 + 50 * r * Math.sin(rad)) + '%';
  b.style.top = (50 - 50 * r * Math.cos(rad)) + '%';
  b.style.animationDelay = ((deg / 360 - 1) * SWEEP_SECONDS) + 's'; // 스윕이 지나는 순간 밝아진다
  b.title = entry.name;
  return b;
}

function row(entry, index) {
  const li = el('li', 'row'), why = el('span', 'why', entry.why);
  li.append(
    el('span', 'no', 'T-' + String(index + 1).padStart(3, '0')),
    el('span', 'nm', entry.name),
    why,
  );
  if (entry.sentAt) {
    const late = Date.now() - entry.sentAt > PENDING_LIMIT_MS;
    why.append(el('span', late ? 'tag bad' : 'tag', late ? '접수 안 됨. 다시 제출해 주세요' : '반영 대기'));
  }
  return li;
}

function render() {
  const all = [...entries, ...pending];
  $('scope-count').textContent = all.length;
  $('tally').textContent = all.length ? `${all.length}개` : '';
  $('blips').replaceChildren(...all.map(blip));
  $('list').replaceChildren(...all.map(row).reverse()); // 새 이름이 위로, 번호는 올라온 순서
  $('list-note').hidden = all.length > 0;
  if (!all.length && loaded) $('list-note').textContent = '아직 올라온 이름이 없습니다. 첫 번째 이름을 올려 주세요.';
  const closed = site.closed || site.stage !== '공모' || Date.now() >= deadline();
  $('form').hidden = closed;
  $('closed').hidden = !closed;
  $('closed').textContent = site.stage === '공모'
    ? "상표 검토 진행 중입니다.\n검토 완료 후 상단의 '검토'와 투표 탭이 활성화 됩니다."
    : '공모가 마감되었습니다. 다음 단계는 위의 탭에서 확인해 주세요.';
}

// ponytail: gviz는 한 열의 값을 다수 자료형으로 맞춘다. 글자 이름 사이의 숫자만 있는 이름은 빈칸으로 올 수 있다(시트에는 남는다).
async function readCsv(gid, headers) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}&headers=${headers}&t=${Date.now()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return parseCsv(await res.text());
}
async function load() {
  try {
    const [responses, settings] = await Promise.all([readCsv(RESPONSES_GID, 1), readSettings()]);
    entries = toEntries(responses);
    site = settings;
    applyTabs(site);
    pending = pending.filter(p => !entries.some(e => normalize(e.name) === normalize(p.name)));
    loaded = true;
  } catch {
    // 이전 목록을 유지하고 다음 주기에 다시 읽는다.
    if (!loaded) $('list-note').textContent = '목록을 불러오지 못했습니다. 제출은 할 수 있고, 목록은 잠시 후 다시 불러옵니다.';
  }
  render();
}

$('f-name').addEventListener('input', () => {
  const name = $('f-name').value.trim();
  if (name && isDuplicate(name)) setStatus('warn', `'${name}'은(는) 이미 올라와 있습니다. 다른 이름을 적어 주세요.`);
  else if (name) setStatus('ok', `'${name}'은(는) 아직 올라오지 않은 이름입니다.`);
  else setStatus('', '');
});

$('form').addEventListener('submit', async e => {
  e.preventDefault();
  const name = $('f-name').value.trim(), why = $('f-why').value.trim(), who = $('f-who').value.trim();
  if (!name || !why) return setStatus('warn', '제품 이름과 이름 의미를 모두 적어 주세요.');
  if (isDuplicate(name)) return setStatus('warn', `'${name}'은(는) 이미 올라와 있습니다. 다른 이름을 적어 주세요.`);
  const btn = $('f-submit');
  btn.disabled = true;
  setStatus('', '제출하는 중입니다.');
  try {
    // ponytail: no-cors라 구글의 응답을 읽을 수 없다. 접수 여부는 목록에 나타나는지로 판단한다(PENDING_LIMIT_MS).
    await fetch(FORM_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: new URLSearchParams({ [FIELDS.name]: name, [FIELDS.why]: why, [FIELDS.who]: who }),
    });
    pending.push({ name, why, sentAt: Date.now() });
    $('f-name').value = '';
    $('f-why').value = '';
    $('f-who').value = '';
    setStatus('ok', `'${name}'을(를) 제출했습니다. 잠시 후 목록에 반영됩니다.`);
    render();
    $('f-name').focus();
    setTimeout(load, 3000);
  } catch {
    setStatus('bad', '제출하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 눌러 주세요.');
  } finally {
    btn.disabled = false;
  }
});

// 마감까지 남은 시간을 1초마다 고치고, 시각이 되면 입력칸을 닫는다.
function tick() {
  const left = deadline() - Date.now();
  const timer = $('timer'), label = $('timer-label'); // 캐시된 옛 화면에는 이 칸이 없다
  if (timer) timer.textContent = remainingText(left) + ' 남음';
  if (label) label.textContent = `${fmtDeadline(deadline())} 마감`;
  if (left <= 0 && !$('form').hidden) render();
}
setInterval(tick, 1000);
tick();

load();
setInterval(load, POLL_MS);
