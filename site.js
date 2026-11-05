// 네 페이지가 함께 쓰는 사이트 상태. 응답 시트의 설정 탭이 유일한 원본이다.
// B1 마감 여부(예/아니오), B2 연장 시간(예: 2시간), B3 단계(공모, 검토, 투표 2차, 결과 2차).
import { parseCsv, parseSettings, stageReached } from './logic.js?v=6';

const SHEET_ID = '1xhNUG1WI_LKoT8WZmwP66g3z_U-er4KTHw45KideVC8';
const SETTINGS_GID = '1532990872';

export async function readSettings() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SETTINGS_GID}&headers=0&t=${Date.now()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return parseSettings(parseCsv(await res.text()));
}

// 투표 탭은 검토가 끝나면 열린다. 투표 입력은 B3이 투표가 되어야 열린다.
const TAB_STAGE = { review: '검토', vote: '검토', result: '결과' };

// 도달한 단계의 탭에만 링크를 건다. 나머지는 비활성으로 둔다.
export function applyTabs(settings) {
  document.querySelectorAll('.pages a[data-tab]').forEach(a => {
    const open = stageReached(settings.stage, TAB_STAGE[a.dataset.tab])
      || (a.dataset.tab === 'result' && settings.round > 1); // 재투표 중에도 앞 회차 결과를 볼 수 있다
    if (open) {
      a.href = a.dataset.href;
      a.removeAttribute('aria-disabled');
    } else {
      a.removeAttribute('href');
      a.setAttribute('aria-disabled', 'true');
    }
  });
}

applyTabs({ stage: '공모', round: 1 }); // 설정을 읽기 전에는 잠가 둔다
