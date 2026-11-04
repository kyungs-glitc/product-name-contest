// 실행: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, toEntries, isClosedBySheet } from './logic.js';

test('CSV: 칸 안의 쉼표·따옴표·줄바꿈과 CRLF를 처리', () => {
  const csv = 'a,b\r\n"1,2","say ""hi"""\r\n"줄\n바꿈",\r\n';
  assert.deepEqual(parseCsv(csv), [['a', 'b'], ['1,2', 'say "hi"'], ['줄\n바꿈', '']]);
});

test('CSV: 끝에 줄바꿈이 없어도 마지막 행을 읽음', () => {
  assert.deepEqual(parseCsv('a,b\n1,2'), [['a', 'b'], ['1', '2']]);
  assert.deepEqual(parseCsv(''), []);
});

const HEAD = ['타임스탬프', '제품 이름', '이름 의미', '제안자 이름 (비워 두면 익명으로 표시됩니다)'];

test('응답 → 목록: 순서 유지, 같은 이름도 각각 표시, 제안자는 선택', () => {
  const entries = toEntries([
    HEAD,
    ['t1', ' 첫 이름 ', '뜻 하나', '김하늘'],
    ['t2', '둘째', '뜻 둘', ''],
    ['t3', '첫 이름', '같은 이름 다른 뜻', '이도윤'],
    ['t4', '', '이름 없는 행', ''],
  ]);
  assert.deepEqual(entries, [
    { name: '첫 이름', why: '뜻 하나', who: '김하늘' },
    { name: '둘째', why: '뜻 둘', who: '' },
    { name: '첫 이름', why: '같은 이름 다른 뜻', who: '이도윤' },
  ]);
});

test('응답 → 목록: 응답이 없거나 머리글이 달라도 깨지지 않음', () => {
  assert.deepEqual(toEntries([]), []);
  assert.deepEqual(toEntries([HEAD]), []);
  assert.deepEqual(toEntries([['다른 칸'], ['값']]), []);
});

test('수동 마감: B1이 예일 때만', () => {
  assert.equal(isClosedBySheet([['마감 여부', '예', '안내']]), true);
  assert.equal(isClosedBySheet([['마감 여부', ' 예 ']]), true);
  assert.equal(isClosedBySheet([['마감 여부', '아니오']]), false);
  assert.equal(isClosedBySheet([]), false);
});
