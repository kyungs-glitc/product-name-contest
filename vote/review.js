import { READY, REVIEWS, finalists } from './candidates.js';

const $ = id => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};
const RESULT_CLASS = { 통과: 'pass', 보류: 'hold', 탈락: 'fail' };

if (!READY) {
  $('content').hidden = true;
  $('notice').hidden = false;
  $('notice').textContent = '상표 검토를 진행하고 있습니다. 결과가 확정되면 이곳에 표시됩니다.';
} else {
  $('count-all').textContent = REVIEWS.length;
  $('count-pass').textContent = REVIEWS.filter(r => r.result === '통과').length;
  $('count-final').textContent = finalists.length;

  $('finals').replaceChildren(...finalists.map(r => {
    const li = el('li', 'final');
    li.append(el('span', 'nm', r.name), el('span', 'why', r.why));
    return li;
  }));

  $('reviews').replaceChildren(...REVIEWS.map(r => {
    const tr = el('tr');
    const name = el('td', 'name-cell', r.name);
    if (r.finalist) name.append(' ', el('span', 'tag', '최종 후보'));
    const result = el('td');
    result.append(el('span', `result ${RESULT_CLASS[r.result] ?? ''}`, r.result));
    tr.append(name, el('td', '', r.why), result, el('td', '', r.note));
    return tr;
  }));
}
