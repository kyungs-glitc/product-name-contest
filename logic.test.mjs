// 실행: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize, parseCsv, toEntries, toRoster, isClosedBySheet } from './logic.js';

test('투표 현황 → 명단: 머리글과 빈 행을 빼고 완료 여부를 읽음', () => {
  const rows = parseCsv('"직원 이름","투표 여부"\n"직원 가","투표 완료"\n"직원 나",""\n"",""\n');
  assert.deepEqual(toRoster(rows), [
    { name: '직원 가', voted: true },
    { name: '직원 나', voted: false },
  ]);
  assert.deepEqual(toRoster([]), []);
});

test('띄어쓰기·대소문자·기호만 다르면 같은 이름', () => {
  assert.equal(normalize('Sky-Guard A'), normalize('skyguard_a'));
  assert.notEqual(normalize('스카이'), normalize('스카이가드'));
});

test('CSV: 칸 안의 쉼표·따옴표·줄바꿈과 CRLF를 처리', () => {
  const csv = 'a,b\r\n"1,2","say ""hi"""\r\n"줄\n바꿈",\r\n';
  assert.deepEqual(parseCsv(csv), [['a', 'b'], ['1,2', 'say "hi"'], ['줄\n바꿈', '']]);
});

test('CSV: 끝에 줄바꿈이 없어도 마지막 행을 읽음', () => {
  assert.deepEqual(parseCsv('a,b\n1,2'), [['a', 'b'], ['1', '2']]);
  assert.deepEqual(parseCsv(''), []);
});

const HEAD = ['타임스탬프', '제품 이름', '이름 의미', '제안자 이름 (비워 두면 익명으로 표시됩니다)'];

test('응답 → 목록: 순서 유지, 중복은 먼저 올라온 것만, 제안자 칸은 읽지 않음', () => {
  const entries = toEntries([
    HEAD,
    ['t1', ' 첫 이름 ', '뜻 하나', '김하늘'],
    ['t2', '둘째', '뜻 둘', ''],
    ['t3', '첫이름', '늦게 올린 중복', '이도윤'],
    ['t4', '', '이름 없는 행', ''],
  ]);
  assert.deepEqual(entries, [
    { name: '첫 이름', why: '뜻 하나' },
    { name: '둘째', why: '뜻 둘' },
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
