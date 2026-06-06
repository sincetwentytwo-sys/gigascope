# GIGASCOPE — Session Handoff (2026-06-06)

> 다른 세션이 이 문서만 읽고 이어받기 위한 핸드오프. 사실만 기록.
> 더 깊은 비즈니스/컴플라이언스 맥락: `G:\jb\gigascope-session-context-2026-05-27.md`
> (섹션 10에 2026-06-01 비즈니스 상태 업데이트 있음).

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
