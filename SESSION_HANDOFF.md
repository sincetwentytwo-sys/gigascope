# GIGASCOPE — Session Handoff (2026-06-06)

> 다른 세션이 이 문서만 읽고 이어받기 위한 핸드오프. 사실만 기록.
> 더 깊은 비즈니스/컴플라이언스 맥락: `G:\jb\gigascope-session-context-2026-05-27.md`
> (섹션 10에 2026-06-01 비즈니스 상태 업데이트 있음).

## ✅ 2026-09-27 — Terafab Grimes(본체) 1단계 개간지 윤곽 (commit d292a1e)

- 위치: Gibbons Creek 저수지 남동쪽. **Sentinel-2 9/22 기준 1단계 개간지 ~555에이커**(1.9×1.5km, 중심 30.6189,-96.0246) + 남쪽 ~60에이커 패드. 6/29 숲 → 7/31 개간 시작.
- 교차검증: OSM way 1549483610 "Terafab"(8/13, Tegtmeyer 드론 기반, 2,020에이커 — 개간지는 NE로 일부 밖), Tegtmeyer 8/23 "10단계 중 1단계, 부지 서쪽 저수지 근처", Robinson 9/5 "저수지 남동쪽", KBTX 8/11 소방서 확인, JETI J0035~J0042(TeraFab AI, LLC — 22,429에이커 경계, 단계당 투자; 필지 1순위 R11032 1,987에이커 Gibbons Creek Rd).
- JETI 서류엔 건물 배치도 없음. TCEQ 대기허가(가스터빈) 신청서는 아직 못 찾음 → 나오면 발전소 좌표 확인 가능.
- ⚠ `footprint`는 **9/22 시점 개간지** 윤곽 — 개간이 넓어지면 갱신 필요(주간 프레임 보고 수동). captureCenter는 기존 핀(30.6165,-96.0233) 유지.

## ✅ 2026-09-27 — Terafab Austin(ATCF) 위치 확정 → 실제 윤곽 표시 (commit ad84dd9)

- **확정 위치: 기가텍사스 본관 동쪽, Tesla Road 남쪽** (북쪽 캠퍼스 아님). 윤곽 = OSM way 1553482280 "Advanced Technology Chip Fab"(2026-08-29 등록, 약 500×175m, 모서리 깎인 남북 직사각형), 중심 30.22356, -97.60843.
- 교차검증 4가지: ① Sentinel-2에서 같은 직사각형이 5/25 정지 → 7/6 모서리 깎인 기초 윤곽 → 9/22 슬래브 작업 ② Tom's Hardware(8/3, Tegtmeyer 드론): "직사각형, 남쪽으로 연장, 렌더의 깎인 모서리", 별도 "시공사 트레일러 단지" 허가 4건 ③ TDLR TABS2026028764 "Austin Semiconductor Fab" 489,600 sq ft 신축(등록 8/25, 완공 2029-12-31, 1 Harold Green Rd — 주소는 명목상) ④ 다른 블로그의 "기존 캠퍼스 위" 언급.
- 신규 `footprint` 필드 → 지도 L.polygon + Before/Now·타임랩스 SVG 윤곽. `zoneRadiusKm`은 terafab에서 제거(기능은 남김).
- 앞선 두 핀(30.228,-97.612 / 30.2372,-97.5966)은 모두 틀림. 두 번째(회색 패드)는 시공사 트레일러 단지로 추정.
- 참고: "North Campus Manufacturing" TDLR TABS2026028761(약 700만 sq ft, 2029 완공)은 별개 — Optimus 공장 쪽으로 보임.

## ↩ 2026-09-27 — 위 단일 패드 핀 철회 → 북쪽 캠퍼스 "구역" 표시 (commit 05b1558) — ⚠ 위 섹션으로 대체됨

- 오너가 "부지가 작아 보인다"고 지적 → 재검증 결과 회색 자갈 패드는 7월 초부터 차량 크기 점들과 컨테이너 같은 흰 줄이 보임(= **공사 주차장/야적장 가능성 높음**). 또 칩 팹 부지 작업은 4월부터 보도됐는데(Tegtmeyer 4/27 영상 제목) 그 패드는 5월 말까지 풀밭이었음. → **아래 e36dd42의 핀 위치는 틀렸다고 보고 철회.**
- 10m Sentinel-2로는 칩 팹 기초를 주변 토공과 구분 불가. 신규 `zoneRadiusKm` → 지도는 점선 원(L.circle), Before/Now·타임랩스도 점선 구역. terafab = 중심 30.2385,-97.6010, r 0.75km(Optimus 공장 포함 북쪽 캠퍼스 공사 전체).
- 파란 지붕 대형 건물 = Optimus 공장은 높은 확신(9월 "철골이 북쪽 끝 5칸 전" + 남쪽 구조물/북쪽 맨땅 모습 일치).
- 정확한 팹 위치를 확정하려면 고해상도 이미지(드론 영상 프레임, 상용 위성)나 공식 도면이 필요. 확인되면 lat/lng 옮기고 `zoneRadiusKm` 제거.
- 교훈: 10m 위성에서 "어느 건물이 X다"를 주장하려면 시계열·형태·규모를 교차검증한 뒤에. 한 가지 일치(자갈+7월)로 결론 내리지 말 것.

## 📍 2026-09-27 — Terafab Austin 핀 위치 수정 (commit e36dd42) — ⚠ 위 섹션에서 철회됨

- 기존 핀(30.228, -97.612)은 기존 셀/양극재 건물 위 — Terafab 공사와 ~2km 떨어져 있었음. Sentinel-2 비교로 **5월엔 없고 7월 말 생긴 자갈 기초 패드(30.2372, -97.5966)** 를 Terafab 연구 팹으로 추정(Tegtmeyer 7월 말 "직사각형 기초+자갈+GeoPier" 묘사와 일치). 바로 서쪽 파란 지붕 대형 건물(30.2388, -97.6020)은 Optimus 공장. **공식 좌표 미공개 → 추정**이라고 `locationNote`에 명시.
- 신규 필드 `captureCenter`(타임랩스 촬영 중심, 핀과 분리 — 51프레임 구도 유지), `locationNote`(지도 아래 표시). `FramePin`이 Before/Now·타임랩스 위에 위치 링 표시(construction 또는 captureCenter 있는 사이트).
- ⚠ 위치 추정이 틀렸다는 새 보도가 나오면 terafab lat/lng만 바꾸면 됨(캡처는 captureCenter 기준이라 영향 없음).

## 🔍 2026-09-27 — 사이트 전체 점검 (commit 043ecad)

- 22개 사이트 사실 재검증(에이전트 3개, 2026-09 출처) → 고신뢰 항목만 반영. 핵심: giga-mexico(중단인데 가짜 공사 마일스톤 ✓ → paused/0%), colossus(Colossus 2 수치 오기재 → ~220K GPU·Anthropic 임대), colossus-2(1월 가동 → expanding 45%), neuralink-austin(기존 캠퍼스 확장), vandenberg(SLC-6은 Falcon 패드), cape(Starship 승인), starbase(Flight 13/14), vegas-loop(2021년부터 운행), Tesla Q1/Q2-26 수치. terafab Austin의 $16.8B는 Grimes 것(9/22 내 오류) 정정.
- `update-factories.mjs`가 `sources` 배열 자리에 객체를 써서 11개 사이트 출처가 안 떴음 → 스크립트 수정 + 데이터 복구.
- 홈 그리드에 `joint`(Terafab 2곳) 누락 → 추가. 없는 slug가 200(소프트 404) → `dynamicParams=false`로 404. `DATA_LAST_UPDATED`는 사이트별 최신값에서 계산. /spacex-ipo 모바일 넘침 + IPO 전 문구 정리.
- **미반영(중간 신뢰도, 추후 확인)**: giga-buffalo "Solar Roof v4" 마일스톤 출처 없음, vegas-loop 터널 길이(2.2 vs ~4 mi), colossus-2 좌표 미검증, starship 제품 "Raptor 2" 표기(V3는 Raptor 3), mcgregor 15 test stands.
- **다음**: Starship Flight 14(2026-09-28) 결과 나오면 starbase-launch 마일스톤 done 처리. Cape 첫 Starship(NET 10-30).
- 검증: tsc·vitest 166·build OK, Vercel success, 전 페이지 크롤 깨진 링크 0, 모바일 가로 넘침 0.

## 🛰 2026-09-27 — 캡처 신선도 수정 + Terafab Grimes 개간 반영

- **캡처가 오래된 장면을 골랐음**: `capture.mjs`가 30일 창 전체를 `leastCC` 모자이크 → 라벨은 실행일인데 실제는 수주 전 장면일 수 있었음. 이제 CDSE catalog로 실제 촬영일을 조회해 **≤10% 구름 중 최신**(없으면 ≤30% 중 최소 구름) 1일만 렌더, **프레임 이름 = 실제 촬영일**. 저장된 최신보다 새롭지 않으면 스킵. catalog 실패 시 옛 방식 폴백. `FRAME_DATE`(dispatch 입력 `frame_date`) = 그 날짜 기준 백필.
- ⚠ 구름 판정은 타일 단위라 부지 위에 구름이 걸릴 수 있음(Grimes 08-28이 그랬고 수동 삭제 후 08-20으로 교체). 부지 bbox 단위 구름 판정(SCL)은 미구현.
- `build.mjs`: index에 `first`, `sig`(전체 프레임 목록 해시) 기록 → 중간 프레임 교체도 재빌드. `ONLY_SLUG` 실행은 항상 재빌드.
- `freshness.mjs`(신규): variants/썸네일 재생성 판정을 mtime(CI 체크아웃에선 무작위) → **git 상 소스 MP4 변경 여부**로. 변화 없는 실행에서 모바일 영상 재인코딩·무의미 커밋 → (스케줄 실행 시) 트윗 발동되던 것 차단.
- **트윗 버그**: `post-video-to-x.mjs`가 주간 프레임 수를 '년'으로 계산 → 2026-09-21 실제 게시물 "Vandenberg SFB — 50 years of construction… 1976 → 2026" (틀린 내용, 오너가 삭제 판단). 문구 수정 + 링크 gigascope.xyz. **수동 dispatch는 `tweet=true` 없으면 트윗 안 함.**
- Terafab Austin: 2026-09-22 장면(구름 ~1%) 반영, 51프레임.
- **terafab-grimes**: 좌표를 저수지 중심 → 개간 부지(30.6165, -96.0233)로 이동, 옛 크롭 프레임 삭제 후 백필 4장(06-29 숲 → 07-31 개간 시작 → 08-20 → 09-22). status construction / 2%(부지 조성만, 정식 착공 12-01 신고). Sentinel-2상 개간은 **7/31에 이미 보임 — 첫 보도(KBTX 8/11)보다 빠름**. `timelapseSlug: null` 제거(영상 표시).
- 검증: vitest 166, next build OK, Vercel success, `/site/terafab`·`/site/terafab-grimes` Latest 2026-09-22 라이브.

---

## 🛰 2026-09-22 — 위성 파이프라인 4개월 정지 복구 + Terafab 공사중 반영

**증상**: 전 사이트 타임랩스가 5/15 프레임에서 멈춤. Terafab은 `announced/progress 0/"no groundbreaking"`.
**원인 (3겹)**: ① 주간 Action이 매주 돌긴 했으나 `spawnSync ffmpeg ENOENT` — ubuntu-24.04 러너에 ffmpeg가
빠졌는데 build.mjs가 "기본 설치"로 가정. 캡처는 매주 성공해 Release에 프레임만 쌓임(terafab 52장).
② 썸네일 스크립트가 "있으면 스킵"이고 어느 워크플로우에도 안 물려 → /site "Now"가 5/23에 동결.
③ 홈 히어로 `<video>`는 `-mobile/.av1` 변형을 **먼저** 재생하는데 그 변형은 5월 수동 생성 후 재생성 안 됨
→ **홈 첫 화면이 여름 내내 5월 영상.** + starbase-launch가 legacy `starbase.*`를 alias로 참조해 동결.
**수정 (커밋 80507aa→1abc6c5, Actions 3회 성공)**:
- timelapse.yml: ffmpeg apt 설치 스텝 / 썸네일 스텝 / 변형 재생성 스텝(`scripts/timelapse/variants.mjs`, hero
  2곳: giga-texas·starbase-launch, libsvtav1 best-effort) 추가.
- build.mjs: 릴리즈 다운로드 **재시도**(5/15/45s — 첫 재실행이 GitHub 500으로 죽어서 넣음, 다음 실행에서
  giga-shanghai 500을 바로 살림) / index 고아 prune(단 `timelapseSlug` alias는 live 취급).
- thumbnails: mp4가 더 새로우면 재생성, 변형 mp4는 스킵.
- **Starbase 풀히스토리**: legacy 35프레임(2018-02→2026-05)을 `timelapse-frames-starbase-launch` 릴리즈에
  합침(날짜 겹침 0) → starbase-launch.mp4 = 8년 히스토리+주간 갱신. alias 제거, 히어로/spacex-ipo/x-queue
  repoint, legacy `starbase.*`·`colossus-mobile.mp4`·잡 썸네일 13개 삭제.
- **데이터**: terafab → `construction`, progress 8(추정, 주석), 4월 착공·7월 기초공사(위성으로 5→9월 정지작업
  확인)·8월 $16.8B 1단계, 출처 TechCrunch/Fortune/Wikipedia. **신규 `terafab-grimes`**(Gibbons Creek 6,000에이커,
  착공 2026-12-01 신고, 30.63/-96.06 halfKm 4, `timelapseSlug:null` — 첫 프레임 캡처됨, 2장 되면 자동 빌드).
**남은 오너 액션**: "Factories Data Update" Action이 PR 생성에서 `GitHub Actions is not permitted to create or
approve pull requests` → 레포 Settings → Actions → General → Workflow permissions → **"Allow GitHub Actions to
create and approve pull requests" 체크** (권한 설정이라 오너만). ⚠ 파이프라인 복구로 "Post video tweet"
스텝이 오늘 2회 success — `X_VIDEO_AUTOPOST` 켜져 있으면 @gigascopehq에 영상이 올라갔을 수 있음, 확인 요.
**내 실수 기록**: 재시도 헬퍼를 heredoc→Python으로 넣다 역슬래시-n 이스케이프가 진짜 개행으로 변해
build.mjs가 깨진 채 커밋·푸시·실행됨(`node --check` 실패가 다음 줄과 `&&`로 안 묶임). 즉시 취소·수정.
교훈 2개: ① 검증→커밋은 반드시 `&&` 체인, ② heredoc+Python 층을 거치는 문자열에 이스케이프 넣지 말 것
(이 문단 자체도 처음엔 같은 함정에 걸렸다 — Edit 툴로 직접 고침).

---

## 🔴 2026-08-09 — 30일 go/no-go 결과: **NO-GO** (+ 뉴스 최신화 반영)

6/7 스쿱 발사 후 **2개월 경과. 지표 완전 정지**:
- 무료가입 **2 → 2** (증가 0), charter 의향클릭 **0** (baseline과 동일)
- 언론 제보(Electrek/Teslarati) **픽업 0**, X 앰플리파이어 리포스트 **0**
- permit 번호(`SP-2026-0021`/`2026-064079`) 웹검색 → **여전히 아무 데도 안 나옴**
- SPCX IPO 어텐션 창(= 최고의 시간제한 기회)도 그냥 지나감
→ kill criteria("IPO 주간에도 25가입/10클릭 못 깨면 비타민 확정") **그대로 충족. 판정 NO-GO.**
결제는 계속 OFF(fake-door) 상태 유지가 맞음. **더 폴리싱 금지** — 다음은 오너의 방향 결정
(thesis-call 피벗 / 무료 자산화 / 접기) 사안이지 코드 사안이 아님.

### 이번에 고친 것 = 뉴스 최신화 (`6403614`)
2개월치 실제 뉴스가 사이트에 반영 안 돼 **거짓 주장**이 돼 있었음:
- **SpaceX 상장**(2026-06-12, Nasdaq **SPCX**, $135/주, 555,555,555주, ~$75B 조달, ~$1.77T).
  `/spacex-ipo`가 전부 "아직 가격 미정" 미래시제였음 → 확정 사실로 교체(가격·주수·조달·밸류·
  최초거래일·8/6 록업 1차 해제 ~9억주). 밸류표 "rumored/Pre-IPO, not market-tested" →
  "public, ~95x at IPO"(변동 가격 하드코딩 안 함). `SPCX*` 하이라이트 키 깨진 것도 수정.
- **xAI = 독립회사 아님**(2026-02 SpaceX 올스톡 합병, $1.25T, Grok·X 포함, Tesla 제외).
  companies.ts 설명 → "SpaceX division since Feb 2026", "다섯 회사" → **네 회사**(/pulse, /about, OG).
  xAI 그룹핑 자체는 유지(Colossus 등 물리적으로 별개 사이트라).
- **"$29, June 2026"** 날짜가 그냥 지나감 → 전부 "when public billing opens"로(날짜 주장 제거).
  /pro, /charter-terms, OG, /spacex-ipo, welcome·D+14 이메일.

⚠ 앞으로도 시간 지나면 또 낡음: `/spacex-ipo`는 이제 **상장사 추적**이라 라이브 시세가 자연스럽지만
현재 시세는 하드코딩 안 했음(고의). 필요하면 FINNHUB_API_KEY(이미 Vercel에 있음) + 기존
`/api/tsla` 패턴으로 SPCX 실시간 시세 붙이면 됨.

---

## 🧭 2026-06-06 (저녁) — GTM 피벗: 수요 먼저, 결제는 신호 나면

5-렌즈 브루탈 GTM 감사(Elon 관점, 웹근거) 결론에 오너 동의 → 코드로 고칠 건 다 반영:
- **냉정한 진단**: 비타민을 비타민 가격에, 공개·무료·복제가능 데이터를 더 신선한 무료 경쟁자
  (buildingtesla.com 일일/Tegtmeyer 드론/LabPadre·NASASpaceflight 24-7)가 이미 주는 청중에
  팖. Q75 실패. 유일한 비-범용 자산 = **permit/capex-inference**(서류가 착공보다 몇 달 선행).
- **반영된 커밋**: `aabf362`(홈/‌pro를 permit·capex-first로 재포지셔닝, "$30K Planet Labs"
  허수아비 제거; 스카시티 바 ≥15에서만 노출 = `CHARTER_PROOF_THRESHOLD`, 1/100 안티-프루프 제거;
  체크아웃 기본값 monthly) + `d79eccf`(퍼널 윗물: /site·/compare 무료가입 CTA; **fake-door**
  `/api/charter-intent` INCR `charter:intent:count`+distinct emails, 게이트 모드 CTA="Lock the $9
  charter rate — pay nothing today" → 의향 클릭 측정).
- **SPCX 6/12 IPO 팩트 확인됨**(CNBC/SEC, $135/$1.77T) — 6일 뒤. 시간제한 어텐션 창.
- **검증 지표 읽기**: `GET https://gigascope.xyz/api/charter-intent` → {count,distinct}.

### 현재 상태: 결제 OFF / 수요 프로브 가동 중
- ✅ **`LEMONSQUEEZY_CHECKOUT_URL`(월간) 제거 + 재배포 완료** → /pro = fake-door
  ("Lock the $9 charter rate — pay nothing today"). 의향 카운터 `charter:intent:count`=0(깨끗).
- env 잔존: `LEMONSQUEEZY_CHECKOUT_URL_ANNUAL`(무해, 월간 없으면 미사용) + `LEMONSQUEEZY_WEBHOOK_SECRET`.
- **재라이브 방법**: Vercel에 `LEMONSQUEEZY_CHECKOUT_URL` = `https://gigascope.lemonsqueezy.com/checkout/buy/99c77739-cdab-4652-ad2e-1c83cb531699` 다시 넣고 재배포(10초).

### ⚠ 남은 오너 액션 (코드로 못 하는 것)
2. **이번 주 permit/capex 단독 1건**을 카운티 포털에서 찾아(Starbase/Memphis 등 비공개사) 날짜 박힌
   카드+X 1포스트(앰플리파이어 1명 @멘션, Tegtmeyer/Teslarati/Merritt) CTA=무료가입. r/teslainvestorsclub
   permit 글 모드 협의 후 부활.
3. **30일 go/no-go**: 단독 1건이 무료가입 25+ 또는 앰플리파이어 리포스트 1, **그리고** fake-door
   의향클릭 10-15+. 미달 시 thesis-call 피벗 or 무료 자산화. (환불된 파운더 테스트는 0으로 침.)

### STOP
결제/카운터/가격카피 폴리싱, "위성 사이트" 포지셔닝, 유튜브/build-in-public 반사, 날짜 기반 결제ON.
다음 30일 유효 작업 = 스쿱 1건 → 앰플리파이어 1명 → 무료가입 측정. 끝.

---

## 🟢 2026-06-06 — 결제 라이브됨 (go-live 완료)

GIGASCOPE 유료 구독 **가동 중**. Vercel Production env 3개 설정 완료:
`LEMONSQUEEZY_WEBHOOK_SECRET`, `LEMONSQUEEZY_CHECKOUT_URL`(월 $9, buy/99c77739…),
`LEMONSQUEEZY_CHECKOUT_URL_ANNUAL`(연 $90, buy/85aa7bd5…). webhook 서명검증 200 확인됨.
/pro = "Subscribe — $90/year" + 월/연 토글(기본 연간). LS: dunning 14일+cancel, confirmation
모달 버튼→`/pro/success`. 상세 = `GOLIVE_CHECKLIST.md`.

**✅ END-TO-END 검증됨 (실결제)**: 오너가 실제 $9.90(=$9+10% 한국VAT) 결제(직접카드는
한국 체크카드 해외결제 거절 → **PayPal로 통과**) → confirmation 모달 → `/pro/success`(동적
"21 sites" + Connect Telegram) → webhook `subscription_created` 수신 → `subscribers:charter:count`
= **1** → /pro 배지 "1 of 100 charter spots claimed". 즉 결제→webhook→Redis→UI 풀체인 작동.
그 뒤 오너가 **구독 취소**(월 청구 중단). 카운터는 HWM라 **1로 유지**(=오너가 charter #1,
의도적으로 둠). test_mode 이벤트는 webhook이 무시하도록 가드 추가됨(prod 오염 방지).

**✅ support@gigascope.xyz 개설+연동 완료**: ImprovMX 무료 포워딩(catch-all `*@gigascope.xyz`
→ sincetwentytwo@gmail.com), Vercel DNS에 MX×2(mx1/mx2.improvmx.com)+SPF TXT 자동추가,
전파+실수신 검증됨. 전 공개페이지(약관/환불/개인정보/서비스약관/푸터) 연락처를 support@로 교체
(내부 알림용 OWNER_EMAIL/POC만 gmail 유지). catch-all이라 digest@ 답장도 inbox로 들어옴.

**더 남은 필수사항 없음.** (참고 미결정 1개: /pro 체크아웃 버튼 기본값=연간 $90/yr — 카드 헤드라인
$9/mo와 다름. 바꾸려면 InvestorCheckout useState 기본값 monthly로 1줄.)

(아래는 그 직전 "go-live만 남음" 상태 — 이제 위로 대체됨)

## 🔖 2026-06-06 업데이트 — "charter 강화" 완료, go-live만 남음

오너 선택(옵션 B): 기능 2개 재배포 → charter 강화 → 라이브. 재배포 + 강화 **코드 끝**.
남은 건 **오너 설정뿐** → 상세는 `GOLIVE_CHECKLIST.md` (다음 세션 최우선 참조).

**이번에 배포된 커밋 (전부 Vercel success):**
- `a83c4d6` weekly-recap cron 재배포 / `c7e6d31` satellite-check cron (일간으로 — Hobby가
  시간단위 cron 거부; 이게 옛 b99ff86 빌드깨짐의 두 번째 원인이었음) / `7233d7e` charter 카드 ◇→✓
- `7f3b2e1` **LS webhook + charter fulfillment 키스톤** (`src/lib/charterMembership.ts`,
  `lemonsqueezy.ts`, `welcomeEmail.ts`, `src/app/api/webhooks/lemonsqueezy/route.ts`;
  stripe webhook + subscribe 리팩터; subscribe는 tier=free 강제). +16 테스트.
- `4a94aff` recap/satellite/catalyst 크론을 결제자(subscribers:charter)에게만 게이팅
- `bcd7186` 정직성(digest ~7AM ET = 크론 0 11 UTC, 사이트수 동적 21, 로드맵 정합, charter-terms 환불문구)
- `0752ac9` 연간 토글(env `LEMONSQUEEZY_CHECKOUT_URL_ANNUAL`) + export 무료공개 재표기 + /pro Telegram 링크

**근거**: 5차원 병렬 감사(33발견/26확정/0반박). 최대 블로커 = "LS webhook 없어서 결제해도
아무 기록 안 됨" → 해결. 무료에게 charter 알림 새던 것 → 게이팅으로 해결.

**다음 세션 할 일 = `GOLIVE_CHECKLIST.md` 그대로:** (1) LS 대시보드 webhook 등록(URL+secret+events)
→ (2) Vercel env `LEMONSQUEEZY_WEBHOOK_SECRET` + `LEMONSQUEEZY_CHECKOUT_URL` 설정+재배포
→ (3) LS 상품 dunning 14일 + thank-you URL `/pro/success` → (4) 연간상품 생성+`_ANNUAL` env
→ (5) support@gigascope.xyz 개설 → (6) 테스트결제로 webhook 200 + 카운터 + 환영메일 검증.
**webhook(1·2) 끝나기 전 CHECKOUT_URL 켜지 말 것** (env는 여전히 오너만, 돈 나가는 행위).

(아래는 그 이전 상태 기록 — 일부는 위 업데이트로 대체됨)

---

## 1. 목표

GIGASCOPE(머스크 제국 위성 건설 추적 사이트, gigascope.xyz)의 **유료 구독 결제를 Lemon Squeezy로 제대로 마무리**하는 중. LS 스토어 승인 완료 → 상품 생성 완료 → 사이트 코드 연결 완료. 남은 건 (a) 라이브 켜기(Vercel env 1개) + (b) charter가 약속한 기능 중 revert된 2개(satellite alerts, weekly recap) 재배포.

## 2. 확정된 결정·제약

- **Validate-before-overhead** (오너 핵심 원칙): 결제/사업자/법무 등 외부 commitment는 검증 신호(구독자 수/응답률) 나오기 전 미룬다. 단 지금은 오너가 적극적으로 결제 셋업 진행 중 = 인프라 준비는 OK, 실제 라이브 go-live는 오너가 env 켜는 행위로 명시.
- **Musk-narrow scope 고정**: 비-머스크 회사로 확장 금지.
- **정직성 우선**: 안 만든 기능 ◇로 명시, 가짜 LIVE/실시간 표현 금지, em-dash 데코용 금지(날짜만 OK), 자가홍보 footer 금지.
- **결제 듀얼 레일**: GIGASCOPE = Lemon Squeezy (MoR, 해외/USD). DirtyCash(별도 의류 브랜드, 같은 사업자) = Cafe24 PG (국내/KRW). 둘은 분리.
- **사업자등록**: 568-24-02193, 상호 "기가스코프(GIGASCOPE)", 대표 김재빈, 일반과세자, 전자상거래 소매업 추가됨. **주민번호 등 민감정보는 어디에도 기록 금지.**
- **LS 통화 = USD** (스토어 Settings→General에서 KRW→USD 변경 완료). Country는 South Korea 유지(건드리지 말 것).
- **GIGASCOPE는 100% LS MoR** (한국 직접결제 안 받음) → 한국 통신판매업 신고/풀 disclosure 의무 GIGASCOPE엔 없음. (DirtyCash엔 다 붙음.)
- **Vercel 배포**: git push origin main → 자동 배포. 큰 배치 한 번에 금지(빌드 깨진 전례). 한 커밋씩 push + Vercel 빌드 status 확인.
- 코드 수정 시 매 commit `npx vitest run` + `npx next build` 통과 확인 의무.

## 3. 진행 상황

### ✅ 끝난 것 (이번 세션)
- LS 스토어 "GIGASCOPE" KYB 통과 + 활성화 (라이브 모드).
- LS 상품 "GIGASCOPE Charter" $9.00/month Subscription **Published**. (SaaS-personal use tax category)
- LS 통화 USD로 변경.
- **사이트 → LS 체크아웃 코드 연결** (commit `e8403b8`). `LEMONSQUEEZY_CHECKOUT_URL` env로 게이트, 기본 OFF = 방문자에겐 waitlist 그대로(실수 청구 0).
- charter-terms 페이지 거짓 문구 "등록 진행중 1-2주" 제거 + "Jaebin"→"Jaebin Kim" (commit `91238e5`).
- 이전: /pulse/[slug] 분석 article system, /roadmap voting, CommunityFeed→analyses fallback, Reddit /new + HN 쿼리 fix, Cortex 사이트 추가, 한글 제거 등 다수 라이브.

### ⏳ 진행 중 / 대기
- **라이브 go-live 결정**: 오너가 A(지금 라이브) vs B(기능 2개 재배포 먼저) 선택 중. 마지막 질문에 답 대기.
- **Reddit permit post**: r/teslainvestorsclub mod queue 승인 대기.
- **Lemon Squeezy**: KYB 통과, 추가 응답 가능성.
- **DirtyCash/Cafe24**: PG 심사 대기 → 구매안전서비스 확인증 → 통신판매업 신고 → 신고번호. PG 통과 전 법적 오픈 불가.

### 🔴 막힌 것 / 알아둘 것
- **Lemon Squeezy 대시보드는 Claude가 못 건드림**: computer-use(브라우저 read 전용) + claude-in-chrome(lemonsqueezy.com safety 차단) 둘 다 막힘. LS 작업은 오너가 클릭, Claude는 가이드.
- **이전 병렬 배치(b99ff86)가 Vercel 빌드 깨뜨림** → revert(`c9eefeb`). 그 안에 있던 weekly-recap + satellite-check cron이 아직 미배포. 원인 미확정(react-markdown 제거해도 실패했었음, 의심: weekly-recap fs.readFileSync 또는 다른 import). 재배포 시 **한 커밋씩** 격리 push로 빌드 확인.

## 4. 건드린·만든 파일 (이번 세션 핵심)

- `G:\claude\gigascope\src\app\pro\page.tsx` — `lsCheckoutUrl = process.env.LEMONSQUEEZY_CHECKOUT_URL || undefined` 추가, `<InvestorCheckout ... lsCheckoutUrl={lsCheckoutUrl} />` 전달.
- `G:\claude\gigascope\src\components\InvestorCheckout.tsx` — `lsCheckoutUrl?: string` prop 추가. 값 있으면 최우선으로 "Subscribe — $9 / month" 버튼(=LS hosted checkout 링크) 렌더. 없으면 기존 waitlist.
- `G:\claude\gigascope\src\app\charter-terms\page.tsx` — 거짓 "registration in progress" 문구 제거 + 이름 통일 + 사업자번호 명기.
- `G:\jb\gigascope-session-context-2026-05-27.md` — 섹션 10 비즈니스/컴플라이언스 상태 추가(2026-06-01).
- (참고: react-markdown 제거 + /pulse/[slug] 자체 markdown 렌더러 = `src/app/pulse/[slug]/page.tsx`의 `renderMarkdownBody`/`renderInline`.)

## 5. 다음 할 일 (순서대로, 맨 위가 먼저)

1. **오너 A/B 답 확인.** B 선택이면 → step 2. A면 → step 4(go-live)로.
2. **weekly-recap cron 재배포** (격리 1커밋): `git checkout b3b032f -- src/app/api/cron/weekly-recap/route.ts src/lib/weeklyRecap.ts src/lib/weeklyRecap.test.ts src/emails/weekly-recap.tsx` + emailMetrics.ts의 EmailType union에 멤버 추가 필요 + vercel.json에 `{ "path": "/api/cron/weekly-recap", "schedule": "0 17 * * 6" }` → `npx vitest run` + `npx next build` → commit → push → **Vercel 빌드 status 반드시 success 확인** (`gh api repos/sincetwentytwo-sys/gigascope/commits/main/status --jq '.state'`). 실패하면 즉시 revert하고 원인 격리.
3. **satellite-check cron 재배포** (격리 1커밋): `git checkout b3b032f -- src/app/api/cron/satellite-check/route.ts src/lib/satelliteDropDetector.ts src/lib/satelliteDropDetector.test.ts src/emails/satellite-drop.tsx` + vercel.json에 `{ "path": "/api/cron/satellite-check", "schedule": "15 * * * *" }` → 빌드/테스트/push/Vercel status 확인.
   - 두 cron 재배포되면 /pro charter 카드의 해당 ◇ 2개를 ✅로 변경.
4. **GIGASCOPE 결제 라이브** (오너 액션): Vercel → gigascope → Settings → Environment Variables →
   `LEMONSQUEEZY_CHECKOUT_URL = https://gigascope.lemonsqueezy.com/checkout/buy/99c77739-cdab-4652-ad2e-1c83cb531699`
   → 저장 → 재배포 → /pro 버튼이 "Subscribe — $9/month"로 바뀌는지 확인.
5. (선택) **연간 $90/yr**: LS에 두 번째 상품 "GIGASCOPE Charter (Annual)" $90/year 생성 → buy-link → InvestorCheckout에 annual 분기 추가 + /pro 토글 복원.
6. **DirtyCash 법정문구 풀세트** 초안(속옷 청약철회 사전고지 포함) — PG 통과 대기 중이라 급하지 않음. 필요 입력: 가격/실측 사이즈/배송·교환·반품/대표 전화번호.

## 6. 검증 방법

- 빌드: `cd G:\claude\gigascope && npx next build` (clean이어야).
- 테스트: `npx vitest run` (현재 통과 기준; 단 weekly-recap/satellite 재배포 시 테스트 수 +36 복원됨).
- Vercel 배포 status: `gh api "repos/sincetwentytwo-sys/gigascope/commits/main/status" --jq '.state'` → `success` 확인. (로컬 빌드 통과해도 Vercel에서 깨진 전례 있음 — 반드시 이걸로 확인.)
- 라우트 라이브: `curl -s -o /dev/null -w "%{http_code}" https://gigascope.xyz/pro` 등.
- LS 체크아웃 게이트 확인: env 미설정 시 /pro에 "Join waitlist" 버튼, 설정+재배포 후 "Subscribe — $9 / month".

## 7. 미해결 이슈·주의점

- **Vercel 빌드 함정**: 로컬 `npx next build` 통과해도 Vercel Linux 빌드가 깨질 수 있음(b99ff86 사례). 큰 변경 절대 한 번에 push 금지. 한 커밋 = push = Vercel status 확인.
- **react-markdown 금지**: ESM 트랜지티브 deps가 Next16 Vercel 빌드 깨뜨림. 제거됨. /pulse/[slug]는 자체 zero-dep 렌더러 사용. 다시 추가하지 말 것.
- **LS는 Claude가 직접 못 만짐** (safety 차단). 대시보드 작업 = 오너 클릭 + Claude 가이드.
- **go-live = 돈 나가는 행위**. `LEMONSQUEEZY_CHECKOUT_URL` env 설정은 오너가 직접(명시적 go-live). Claude가 Vercel env로 자동 설정하지 말 것.
- **charter 정직성**: /pro 카드의 ◇(satellite alerts, weekly recap 등)는 미배포. 라이브 켜기 전 step 2-3로 2개 채우는 게 권장(founding-member 모델이라 ◇ 명시돼 있으면 라이브도 정직성은 OK).
- **Reddit/HN 피드**: Vercel egress가 Reddit을 가끔 throttle. fallback으로 우리 /pulse/[slug] 분석 글이 "Latest signal" 섹션 채움. HN 쿼리는 single-term split로 작동.
- **시간대**: 오너 KST. 작업 중 "자라/내일" 같은 시간 가정 금지.
- 영어 산출물(Reddit/X/이메일)은 adversarial Claude + Gemini cross-check 거친 뒤 게시. Confidence 단어 변경(likely→almost certainly) 금지.

---

**최근 commit**: `e8403b8` (LS checkout wiring) ← HEAD. 이전: `91238e5`(charter-terms fix), `b840e80`(Reddit /new), `fedb524`(CommunityFeed fallback).
