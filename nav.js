import { REVIEW_OPEN, VOTE_OPEN } from './vote/candidates.js';

// 열리지 않은 탭은 링크 없이 비활성으로 둔다. 스크립트가 실패해도 잠긴 채로 남는다.
const OPEN = { review: REVIEW_OPEN, vote: VOTE_OPEN };
document.querySelectorAll('.pages a[data-tab]').forEach(a => {
  if (OPEN[a.dataset.tab]) a.href = a.dataset.href;
  else a.setAttribute('aria-disabled', 'true');
});
