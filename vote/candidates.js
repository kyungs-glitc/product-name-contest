// 검토, 투표, 결과 페이지가 함께 쓰는 자료. 어느 페이지가 열리는지는 응답 시트의 설정 탭이 정한다(site.js).

// { name, why, result: '통과' | '보류' | '탈락', note, finalist: 투표 후보인지 }
// note는 공개되므로 상표 권리자 이름을 넣지 않는다. 2026-11-05 최종 검토 결과다. 보류도 2026-11-06 담당자 결정으로 투표 후보에 넣었다(SkyWarden 제외).
export const REVIEWS = [
  {
    "name": "디킬 하이드",
    "why": "지킬앤하이드 를 떠올리는 각인 효과와 숨어있는 드론을(디) 킬을 하겠다는 의지를 내포",
    "result": "통과",
    "note": "유사 상표 없음",
    "finalist": true
  },
  {
    "name": "베일리스 AI (Veylith AI)",
    "why": "Veil에서 착안한 조어. 레이더·RF·영상에 흩어진 단서를 연결해 베일 뒤에 숨은 드론 위협을 드러낸다는 의미입니다.",
    "result": "통과",
    "note": "같은 이름 없음, 앞부분이 같은 이름 국내 출원 2건",
    "finalist": true
  },
  {
    "name": "TRACENTRA C2 (트라센트라)",
    "why": "Track(추적)과 Central(중앙)을 결합한 조어입니다.\n\n레이더·RF·영상 장비가 탐지한 드론을 통합 추적하고, 위협 평가와 대응 지시를 하나의 중앙 지휘체계에서 처리한다는 의미를 담았습니다.",
    "result": "통과",
    "note": "유사 상표 없음",
    "finalist": true
  },
  {
    "name": "SKYNTRA C2 (스카이앤트라)",
    "why": "Sky(공중)와 Central·Control(중앙 통제)의 개념을 결합한 조어입니다.\n\n공중에서 발생하는 여러 위협을 하나의 통합 관제 시스템으로 관리하고 대응한다는 의미입니다. 짧고 현대적인 느낌으로, 시스템 로고나 제품 UI에도 잘 어울립니다.",
    "result": "통과",
    "note": "같은 이름 없음, 한 글자 차이 이름 있음",
    "finalist": true
  },
  {
    "name": "SCUTAVEN (스쿠타벤)",
    "why": "SCUTUM + HAVEN\n고대 로마 군단의 방패를 뜻하는 라틴어 Scutum과 안전한 피난처를 뜻하는 Haven에서 착안한 이름입니다.\n적 드론의 침투로부터 보호구역을 방어하는 거대한 공중 방패라는 의미를 담았습니다.",
    "result": "통과",
    "note": "유사 상표 없음",
    "finalist": true
  },
  {
    "name": "DEFENROK C2",
    "why": "Defense(방어)와 Lock(고정·차단)을 바탕으로 만든 조어입니다.\n군사기지와 국가 중요시설을 위협하는 드론을 탐지하고, 대응체계를 하나로 연결해 방어한다는 의미입니다.\n핵심 이미지: 철통 방어 · 강력한 보호 · 통합방어체계\n슬로건: One System. Total Defense.",
    "result": "통과",
    "note": "유사 상표 없음",
    "finalist": true
  },
  {
    "name": "LOCK DOWN",
    "why": "대드론 솔루션으로 다 떨구자 라는 의미를 가지고 있으며\n스타크래프트의 고스트의 락다운 기술(유닛 정지)에서 가져왔음",
    "result": "보류",
    "note": "해외 같은 이름 15건: 미국 6, EU 2, 영국 2 등",
    "finalist": true
  },
  {
    "name": "PORTUS(포르투스)",
    "why": "모든 센서가 들어오는 하나의 관문.\n라틴어로 항구. 영어 port의 뿌리이고, 로마 신 포르투누스의 이름도 여기서 나왔습니다.",
    "result": "보류",
    "note": "해외 같은 이름 6건: EU, 영국, 미국, 일본, WIPO",
    "finalist": true
  },
  {
    "name": "스카이퓨전AI (SkyFusionAI)",
    "why": "레이더, RF, 영상 센서의 탐지 정보를 융합해 하나의 공중 상황도를 만든다는 의미입니다.",
    "result": "보류",
    "note": "해외 같은 이름: 인도 2건",
    "finalist": true
  },
  {
    "name": "VERAO(베라오)",
    "why": "받침 없이 부드럽게 이어져 부르기 편함",
    "result": "보류",
    "note": "해외 같은 이름: 브라질 1건",
    "finalist": true
  },
  {
    "name": "Retiaer (레티아에르)",
    "why": "그물(Rete)과 공중(Aer)을 합성한 말로 거미줄처럼 촘촘하고 빈틈없는 공중 탐지망을 뜻함",
    "result": "보류",
    "note": "국내 제9류에 비슷한 이름 등록",
    "finalist": true
  },
  {
    "name": "스카이워든 (SkyWarden)",
    "why": "하늘을 지키는 감시자. 여러 센서에서 탐지한 드론을 한 화면에서 추적하고 대응을 지휘한다는 의미입니다.",
    "result": "보류",
    "note": "해외에 같은 업계의 같은 이름 제품 있음",
    "finalist": false
  },
  {
    "name": "Overmind(오버마인드)",
    "why": "초월체(Overmind)는 스타크래프트 세계관에서 저그 군단 전체를 하나로 묶고 통제하는 '중앙 집권형 지휘 두뇌이자 단일 의식 그 자체'입니다.\n\n군사 통제 시스템 관점에서 보면, 저그라는 거대한 분산 네트워크의 최상위 중앙 서버이자 C2(지휘통제) 코어 역할을 수행합니다.",
    "result": "보류",
    "note": "국내 제9류에 비슷한 이름 등록",
    "finalist": true
  },
  {
    "name": "에어센티널 (AirSentinel)",
    "why": "공중 위협을 먼저 발견하는 초병. 드론을 조기에 탐지하고 경보를 전달하는 역할을 강조합니다.",
    "result": "보류",
    "note": "국내 제9류에 핵심어가 같은 이름 등록",
    "finalist": true
  },
  {
    "name": "에어실드 커맨드 (AirShield Command)",
    "why": "공중 위협으로부터 시설을 보호하는 지휘본부. 위협 판단부터 대응 지시까지 중앙에서 통제한다는 의미입니다.",
    "result": "보류",
    "note": "국내 제9·42류에 비슷한 이름 등록",
    "finalist": true
  },
  {
    "name": "D-Fend(디펜드)",
    "why": "Drone(드론)을 막아낸다(Fend off)는 의미를 담고 있습니다.",
    "result": "보류",
    "note": "국내 제9류에 비슷한 이름 출원",
    "finalist": true
  },
  {
    "name": "AEGIS(이지스,아이기스)",
    "why": "탐지부터 위협 분석, 대응까지 아우르는 통합 방어 이미지",
    "result": "탈락",
    "note": "국내 제9류에 같은 이름 등록",
    "finalist": false
  },
  {
    "name": "VANTIS(밴티스)",
    "why": "짧고 발음하기 쉬움",
    "result": "탈락",
    "note": "국내 제42류에 같은 이름 등록",
    "finalist": false
  },
  {
    "name": "AERION(에어리언)",
    "why": "공중 영역과 AI 기반 통합 운영을 강조하는 이름.",
    "result": "탈락",
    "note": "국내 제9류에 같은 이름 출원",
    "finalist": false
  },
  {
    "name": "STRATOS(스트라토스)",
    "why": "해외 시장에서도 비교적 발음하기 쉬움",
    "result": "탈락",
    "note": "국내 제9·42류에 같은 이름 출원",
    "finalist": false
  },
  {
    "name": "에어링크 C2 (AirLink C2)",
    "why": "센서와 관제센터, 현장 대응팀을 하나로 연결하는 지휘통제 체계. 탐지 장비를 추가하며 감시 범위를 넓힐 수 있다는 점을 담았습니다.",
    "result": "탈락",
    "note": "국내 제9·42류에 같은 이름 등록",
    "finalist": false
  },
  {
    "name": "오르비온 AI (Orvion AI)",
    "why": "궤도를 뜻하는 Orbit에서 착안한 조어. 여러 드론의 이동 궤적을 하나의 공중 상황도에 모아 어느 표적부터 대응할지 판단을 돕는다는 의미입니다.",
    "result": "탈락",
    "note": "국내 제9류에 같은 이름 등록",
    "finalist": false
  },
  {
    "name": "CATCH (캐치)",
    "why": "레이더·RF·영상 센서가 탐지한 드론을 놓치지 않고 잡아낸다(Catch)는 의미입니다.\n탐지부터 추적, 대응까지 한 번에 끝내는 통합 대드론 솔루션의 성격을 직관적으로 담았습니다.",
    "result": "탈락",
    "note": "국내 제9류에 같은 이름 등록",
    "finalist": false
  }
];

export const finalists = REVIEWS.filter(r => r.finalist);

// 회차별 득표. 담당자 검수를 마친 숫자만 넣는다. 1차는 순위표만 보여 준다. 2차부터는 마지막 회차의 1위가 하나면 확정, 둘 이상이면 재투표다.
// { title, method, voters, results: [{ name, votes }] }
export const ROUNDS = [];
