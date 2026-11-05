// 실행: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize, parseCsv, toEntries, toRoster, remainingText, rankRound, parseSettings, stageReached, roundCandidates, minPicks, allVoted } from './logic.js';

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

test('남은 시간: 앞쪽 0 단위를 빼고, 지나면 0초', () => {
  assert.equal(remainingText((86400 + 7200 + 180 + 4) * 1000), '1일 2시간 3분 4초');
  assert.equal(remainingText(3600 * 1000), '1시간 0분 0초');
  assert.equal(remainingText(65 * 1000), '1분 5초');
  assert.equal(remainingText(500), '1초');
  assert.equal(remainingText(-1000), '0초');
});

test('회차 순위: 동률이면 같은 순위, 1위가 둘이면 tied', () => {
  const tie = rankRound([{ name: 'A', votes: 3 }, { name: 'B', votes: 9 }, { name: 'C', votes: 9 }]);
  assert.deepEqual(tie.rows.map(r => [r.name, r.rank]), [['B', 1], ['C', 1], ['A', 3]]);
  assert.deepEqual(tie.leaders, ['B', 'C']);
  assert.equal(tie.tied, true);
  const win = rankRound([{ name: 'A', votes: 12 }, { name: 'B', votes: 10 }]);
  assert.deepEqual(win.leaders, ['A']);
  assert.equal(win.tied, false);
});

test('설정 탭 읽기: 마감, 연장, 단계와 회차', () => {
  const rows = parseCsv('"마감 여부"," 예 ","안내"\n"연장 시간","2시간"\n"단계","투표 2차"\n');
  assert.deepEqual(parseSettings(rows), { closed: true, extendHours: 2, stage: '투표', round: 2 });
  assert.deepEqual(parseSettings(parseCsv('"마감 여부","아니오"\n')), { closed: false, extendHours: 0, stage: '공모', round: 1 });
  assert.deepEqual(parseSettings([]), { closed: false, extendHours: 0, stage: '공모', round: 1 });
  assert.equal(parseSettings([['a', ''], ['b', ''], ['c', '이상한 값']]).stage, '공모');
  assert.equal(parseSettings([['a', ''], ['b', ''], ['c', '결과 3차']]).round, 3);
});

test('단계 도달 여부', () => {
  assert.equal(stageReached('공모', '검토'), false);
  assert.equal(stageReached('투표', '검토'), true);
  assert.equal(stageReached('결과', '결과'), true);
});

test('회차 후보: 1차는 전체, 재투표는 직전 회차의 동률 후보만', () => {
  const f = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
  const r = [{ results: [{ name: 'A', votes: 5 }, { name: 'B', votes: 5 }, { name: 'C', votes: 1 }] }];
  assert.deepEqual(roundCandidates(1, f, []), f);
  assert.deepEqual(roundCandidates(2, f, r).map(x => x.name), ['A', 'B']);
  assert.deepEqual(roundCandidates(3, f, r), []);
});

test('최소 선택 수: 1차는 2개, 재투표는 1개, 후보가 하나뿐이면 1개', () => {
  assert.equal(minPicks(1, 4), 2);
  assert.equal(minPicks(1, 1), 1);
  assert.equal(minPicks(2, 2), 1);
  assert.equal(minPicks(3, 3), 1);
});

test('전원 투표 완료: 한 명이라도 남았거나 명단이 비어 있으면 아님', () => {
  assert.equal(allVoted([{ voted: true }, { voted: true }]), true);
  assert.equal(allVoted([{ voted: true }, { voted: false }]), false);
  assert.equal(allVoted([]), false);
});
