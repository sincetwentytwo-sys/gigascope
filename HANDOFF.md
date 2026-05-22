# GIGASCOPE — Session Handoff

**Last updated**: 2026-05-22 (Resend LIVE · payment infra parked per validate-before-overhead)

## 📚 Canonical docs (read in this order)

| 파일 | 상태 | 비고 |
|---|---|---|
| `G:\jb\gigascope-master-plan-2026-05-22.md` | ✅ **CANONICAL** | Musk-narrow 방향. 모든 방향 결정 기준 |
| `G:\jb\gigascope-audit-2026-05-22.md` | ✅ Reference | Master plan과 같은 방향, 같은 날 작성. 호환 |
| `G:\jb\resend-integration-2026-05-22.md` | ✅ Reference (done) | 이번 세션에 완료 |
| `G:\jb\gigascope-사이트개선-명세서.md` | 🚫 **SUPERSEDED — 무시** | master plan 적용 후 8h 뒤 작성됐지만 demoted Atlas 페이지 보고 "39 회사 확장" 반대 방향 제안. Owner 2026-05-22에 명시적으로 폐기. 같은 함정 다시 안 빠지려면 이 파일 안 봄 |


**Live (primary)**: https://gigascope.xyz
**Live (alias)**: https://gigascope-ten.vercel.app
**Repo**: https://github.com/sincetwentytwo-sys/gigascope (main · Vercel auto-deploy)
**Local repo path**: `G:\claude\gigascope` (⚠ NOT `G:\gigascope` as in some docs)

## ✅ Resend integration — DONE (2026-05-22)

- `RESEND_API_KEY` + `RESEND_FROM_EMAIL=digest@gigascope.xyz` set in Vercel **Production + Development**. ⚠ **Preview env NOT set** (Vercel CLI required a specific git branch; skip OK since `main` always deploys to Production target). Add via Vercel Dashboard later if PR previews need it.
- Production deploy `dpl_Dz5joiAQB5y2Rqar568t9EzP1L26` carries the keys; subsequent commits inherit them.
- Live POST `/api/subscribe` with valid email now returns `{"ok":true,"stored":true,"emailed":true}` — welcome mail delivered.
- Vercel CLI authenticated on this machine as `sincetwentytwo-sys` and linked to project `gigascope`. Future sessions can just call `vercel env ls`, `vercel --prod`, etc. directly. CLI binary: `/c/Users/JIBBY/AppData/Roaming/npm/vercel.cmd`.
- `.env.local` pulled from production env (Upstash + Resend + Finnhub + X tokens). Gitignored. Use for local dev / Node scripts that need prod data.

**Resend domain status (check before mass send)**: `digest@gigascope.xyz` is verified (test send to sincetwentytwo@gmail.com succeeded). DMARC TXT (`_dmarc → v=DMARC1; p=none;`) — verify still active in Vercel DNS if a future broadcast bounces.

---

## 🔑 First message to paste in a new session

```
HANDOFF.md 읽고 현재 상태 파악해. 그 다음:

1) G:\jb\resend-integration-2026-05-22.md 전체 정독.
2) 그 문서 Section 3 순서대로 Resend 통합 실행.
3) 단, 실제 프로젝트 경로는 G:\claude\gigascope (G:\gigascope 아님).
   - 모든 'app/' 경로는 'src/app/' 로 읽을 것.
   - 'emails/welcome.tsx' 는 'src/emails/welcome.tsx' 로 생성.
4) 기존 /api/subscribe 라우트가 이미 존재 (Upstash Redis 저장). 새로 만들지 말고
   EXTEND — Upstash 저장 로직 유지 + Resend welcome 메일 발송 추가.
5) RESEND_API_KEY 값은 owner가 Vercel + .env.local 에 직접 넣음. 코드에 적지 말 것.
6) 매 단계: build → commit → push → 라이브 캐시 우회 검증.

Master plan(G:\jb\gigascope-master-plan-2026-05-22.md) + audit
(G:\jb\gigascope-audit-2026-05-22.md) 도 캐논. 두 문서와 Resend 통합 지시서
세 개 모두 본 후 작업 시작.
```

---

## ⭐ 다음 작업 — Stripe 결제 라이브 (최우선)

Resend 끝. 다음은 Stripe. 같은 패턴 사용 가능:
1. Stripe Dashboard에서 secret key 발급
2. `vercel env add STRIPE_SECRET_KEY production preview development` (CLI 이미 인증됨)
3. `vercel --prod --yes` 로 redeploy
4. `/api/checkout` 가 키 있을 때 자동 활성화 (graceful-degrade 패턴)
5. Webhook 엔드포인트 설정 → Stripe Dashboard에 등록
6. `Investor` 카드 라이브 결제 테스트

상세 문서가 따로 있으면 그쪽 참조. 없으면 owner와 통합 지시서 생성부터.

---

## 📦 Resend 통합 기록 (완료 — 참고용)

**문서**: `G:\jb\resend-integration-2026-05-22.md`
**목표**: waitlist welcome 메일 발송 라이브 → charter 100명 모집 시작
**예상**: DNS 대기 빼면 1-2시간

### 우리 프로젝트에 맞춘 path 매핑

Resend 문서는 일반 Next.js 구조를 가정. 우리 프로젝트는 다음과 같이 적용:

| 문서의 경로 | 실제 적용 경로 |
|---|---|
| `G:\gigascope\app\api\subscribe\route.ts` | `G:\claude\gigascope\src\app\api\subscribe\route.ts` ⚠ **이미 존재** |
| `G:\gigascope\emails\welcome.tsx` | `G:\claude\gigascope\src\emails\welcome.tsx` (새로 생성) |
| `app/(home)/page.tsx` 의 Daily digest 폼 | `src/components/EmailSignup.tsx` (이미 fetch '/api/subscribe' 사용 중) |
| `/investor` 페이지 폼 | `src/app/investor/page.tsx` + `src/components/EmailSignup.tsx` (재사용) |

### 단계별 액션 (Resend 문서 Section 3 기준)

**Step 1 — 패키지 설치**
```bash
cd /g/claude/gigascope
npm install resend react-email @react-email/components
```

**Step 2 — 환경변수**
- 로컬: `G:\claude\gigascope\.env.local` 에 `RESEND_API_KEY` + `RESEND_FROM_EMAIL=digest@gigascope.xyz`
- Vercel: Dashboard → gigascope → Settings → Environment Variables (Production + Preview + Development)
- 추가 후 **Redeploy 필수**
- `.gitignore` 에 `.env*.local` 포함되어 있는지 확인 (없으면 추가)

**Step 3 — 이메일 템플릿**
파일 생성: `G:\claude\gigascope\src\emails\welcome.tsx` — Resend 문서 Section 3 Step 3 의 React Email 컴포넌트 그대로. 우리 톤(dark hero, 흰 텍스트)에 맞춤.

**Step 4 — API Route EXTEND (새로 만들지 말 것)**

`src/app/api/subscribe/route.ts` 이미 존재 + Upstash Redis 저장 로직 있음. 다음 패턴으로 확장:

```ts
// 기존 import 옆에 추가
import { Resend } from "resend";
import WelcomeEmail from "@/emails/welcome";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// 기존 POST handler 안에서, Upstash 저장 성공 직후:
if (resend) {
  try {
    await resend.emails.send({
      from: `GIGASCOPE <${process.env.RESEND_FROM_EMAIL ?? "digest@gigascope.xyz"}>`,
      to: email,
      subject: "You're on the charter list — $9/mo locked for life",
      react: WelcomeEmail({ email }),
    });
  } catch (e) {
    console.error("Resend send failed:", e);
    // Don't fail the subscribe — email is best-effort.
  }
}
```

핵심: **Resend 키 없으면 graceful skip** (현재 graceful-degrade 패턴 유지).

**Step 5 — 폼 연결 (이미 됨)**
`src/components/EmailSignup.tsx` 가 이미 `/api/subscribe` POST 함. 추가 작업 없음.
다만 응답 UI 카피 변경 ("Subscribed. Check your inbox for the welcome email.") 필요.

**Step 6 — 로컬 테스트**
```bash
cd /g/claude/gigascope
npm run dev
```
브라우저에서 `localhost:3000/investor` 또는 `localhost:3000` 의 Daily digest 박스로 sincetwentytwo@gmail.com 구독 → 받은편지함 확인.

도메인 verify 전이면 `from: 'onboarding@resend.dev'` + `to: 'sincetwentytwo@gmail.com'` 으로 임시 테스트.

**Step 7 — 배포**
```bash
git add -A && git commit -m "feat: Resend welcome email on waitlist signup"
git push
```

**Step 8 — 라이브 검증** (필수)
```bash
# 캐시 우회
curl -s "https://gigascope.xyz/?bust=$(date +%s%N)" | head -3
# Resend dashboard → Logs 에서 delivery 상태 확인
```

### Resend 검증 체크리스트 (Section 5 그대로)

- [ ] Resend Dashboard `Verified ✓` 표시 (Tokyo region)
- [ ] DMARC TXT 레코드 확인 (`_dmarc` → `v=DMARC1; p=none;`)
- [ ] `npm install resend react-email @react-email/components` 성공
- [ ] `.env.local` 에 RESEND_API_KEY + RESEND_FROM_EMAIL
- [ ] Vercel 환경변수 등록 + Redeploy
- [ ] `src/emails/welcome.tsx` 생성
- [ ] `src/app/api/subscribe/route.ts` 에 Resend send 로직 EXTEND
- [ ] 로컬 + 라이브 본인 메일 1회 발송 성공
- [ ] Gmail에서 "Not spam" + 답장 (평판 축적)
- [ ] Resend Dashboard Logs 에서 delivered 확인

---

## 📍 현재 상태 (한 줄)

홈 hero에 Giga Texas Sentinel-2 타임랩스 mp4 풀-블리드. 헤드라인:
"Tesla Gigafactory Texas — six years from dirt." 16개 Musk 사이트 카드.
Atlas 익스텐션(39 companies / 5 private / 11 sectors / 14 learn / 25 products)
코드 살아있지만 home/nav 에서 demote. **결제·메일은 scaffold만 있고 라이브
아님 — Resend 통합이 next action.**

**Latest commit**: `2a51f7b HANDOFF: refresh for next session`

---

## 오늘(2026-05-22) 했던 일 — 18 commit 요약

| Wave | 작업 |
|---|---|
| 1-7 (밤) | Atlas 확장 — 39 companies × 11 sectors × 5 privates × 14 learn × 25 products + Stripe/Resend scaffold |
| Audit (오전) | 라이트 테마 통일, GlobeBackground 제거, KRW 포맷, /methodology 신설, Google News RSS 제거, SSR prefetch, "Investor tier" disambiguation |
| Master plan (오후) | Home hero를 Giga Texas mp4 풀-블리드로, 21 ticker grid + 11 sector strip + Atlas tiles 전부 cut, nav demote |
| Products (저녁) | 12개 신규 제품 + SVG 도식 + 번호 hotspot (NVDA Blackwell, HBM3E, ASML EUV, TSMC CoWoS, Hyundai IONIQ 5, Boston Dynamics Atlas, LGES Ultium, BYD Blade, Hanwha K9, Rocket Lab Neutron, IonQ Tempo, Oklo Aurora) |

---

## 🎯 Resend 다음 우선순위 (Master plan Week 2-6 잔여)

Resend 끝나면 다음 순서:

1. **Stripe 결제 라이브** — 개인사업자 등록 + Stripe API + Webhook + DB (2-3일).
   `/api/checkout` 라우트 이미 존재 (graceful 503). STRIPE_SECRET_KEY 만 넣으면 동작.
2. **Waitlist drip 시퀀스 5통** — D+3, D+7, D+14, D+21, D+30 (1일). Resend `react-email` 템플릿 재사용.
3. **/investor 페이지 카운트다운** — "Billing isn't live yet" → D-day 카운트다운 + reserved 카운터.
4. **사이트 카드 위성 before/after 썸네일** — Master plan Week 2.
   `ffmpeg -i public/timelapses/<slug>.mp4 -vf "select=eq(n\,0)" -vframes 1 public/timelapses/<slug>-first.jpg`
5. **사이트별 last capture date + cloud cover %** — factories.json 확장 + FactoryCard 노출.
6. **인터랙티브 타임 슬라이더** on `/site/[slug]` — 33 프레임 JPG + range input.
7. **Sentinel-2 자동 fetch cron** — GitHub Actions weekly.

---

## ⚠️ 함정 — 같은 실수 다시 하지 말 것

### 1. **Atlas 익스텐션 다시 키우지 말 것**
야간에 39 companies + 11 sectors 확장 → 외부 audit으로 cut. 코드 유지하되 home/nav surface 금지. v3로 미룸.

### 2. **Vercel 캐시 stale 함정**
배포 직후 curl 하면 직전 버전 나올 수 있음. 검증 시:
```bash
curl -s "https://gigascope.xyz/?bust=$(date +%s%N)" | grep -oE "검증어"
```

### 3. **테마 일관성**
모든 페이지 light theme. `bg-bg`, `text-text`, `border-border-custom` 토큰만. 다크 hex 색(`#1f1f23`, `#00d4ff` neon 등) 추가 금지.

### 4. **3D viewer / GlobeBackground 부활 금지**
three.js, @react-three/fiber, drei 제거됨. Product2DViewer (사진 + hotspot 점) 가 표준.

### 5. **광고/제휴 링크 금지**
Master plan: "No paid placements. No affiliate links."

### 6. **API 키 / 비밀번호 코드에 적지 말 것**
Vercel env 또는 `.env.local` 만. `.env*.local` 은 .gitignore 됨 (확인 필수).

### 7. **새 API 라우트 만들 때 graceful-degrade 패턴 유지**
모든 외부 서비스 routes (`/api/checkout`, `/api/subscribe`, `/api/digest/send`) 가 키 없으면 503 + 명시적 에러 메시지 응답. Resend extend 할 때도 키 없으면 메일 skip하고 200 OK (구독 자체는 성공).

---

## 📂 파일 구조 (Resend 작업과 관련된 곳)

| Path | 역할 |
|---|---|
| `src/app/api/subscribe/route.ts` | ⚠ **EXTEND 대상**. Upstash 저장 + Resend send 추가 |
| `src/components/EmailSignup.tsx` | 이미 `/api/subscribe` POST 함. 응답 UI 카피만 업데이트 가능 |
| `src/emails/welcome.tsx` | 🆕 새로 생성 (Resend 문서 Section 3 Step 3 그대로) |
| `src/app/investor/page.tsx` | EmailSignup 사용. 별도 폼 핸들러 작성 불필요 |
| `src/app/page.tsx` | EmailSignup 사용 (Daily digest 박스) |
| `src/app/api/digest/send/route.ts` | 일별 다이제스트 발송 (이미 Resend 통합 코드 있음, env만 있으면 동작) |
| `vercel.json` | cron `/api/digest/send` daily 14:00 UTC |
| `.env.local` | ⚠ 로컬용. `.gitignore` 됨 |

### Atlas 익스텐션 (Resend 작업과 무관, v3까지 동결)
- `/markets`, `/sectors/*`, `/company/*`, `/private/*`, `/learn/*`, `/supply-chain` — 라이브
- 모두 home/nav 에서 demote됨

---

## 🔧 자주 쓰는 명령

```bash
# 로컬 개발
cd G:/claude/gigascope && npm run dev

# 배포 전 빌드 검증 (필수)
npx next build

# Hotspot 조정 (Tesla 제품 13개)
"G:/ComfyUI_windows_portable/venv/Scripts/python.exe" scripts/apply-hotspots.py

# 비-Tesla 제품 SVG 도식 재생성
node scripts/generate-schematic-svgs.mjs

# 최근 배포 상태
gh api "repos/sincetwentytwo-sys/gigascope/deployments?per_page=3" | grep -oE '"state":"[^"]*"'

# 라이브 변경사항 검증 (캐시 우회)
curl -s "https://gigascope.xyz/?bust=$(date +%s%N)" | grep -oE "검증어"

# Resend 메일 발송 로컬 테스트 (resend 패키지 설치 후)
node -e "import('resend').then(({Resend}) => new Resend(process.env.RESEND_API_KEY).emails.send({from: 'onboarding@resend.dev', to: 'sincetwentytwo@gmail.com', subject: 'test', html: 'hello'}).then(console.log))"
```

---

## 🌐 환경변수 (Vercel)

Owner가 Vercel 대시보드에서 직접 설정. 코드에 키 적지 말 것.

| 변수 | 용도 | 없을 때 |
|---|---|---|
| `RESEND_API_KEY` | **⭐ 이번 작업의 핵심** | `/api/subscribe` Resend send skip (저장은 됨) |
| `RESEND_FROM_EMAIL` | 발신 주소 | "digest@gigascope.xyz" 디폴트 사용 |
| `STRIPE_SECRET_KEY` | 결제 (Resend 다음 작업) | `/api/checkout` 503 |
| `UPSTASH_REDIS_REST_URL` + `_TOKEN` | 구독자 저장 | EmailSignup 응답 OK 하지만 저장 안 됨 |
| `CRON_SECRET` | 다이제스트 cron 보호 | 인증 없이 호출 가능 |
| `FINNHUB_API_KEY` | TSLA 시세 1차 출처 (선택) | Yahoo로 폴백 |

---

## 📝 Owner 행동 메모리

- Korean. `~합니다` / `~해드릴게요` 톤
- Direct, fact-based. 아이디어 나쁘면 정직하게 push back
- 모든 fix 후 즉시 main에 머지 (Vercel auto-deploy)
- 작고 되돌릴 수 있는 변경은 확인 안 받음. 위험한 변경은 확인 받음
- 하나를 미친 듯이 잘 하는 게 moat. 광범위한 확장은 거꾸로 가치 깎음

---

## Repo state at end of session

Latest commits (newest first):
```
2a51f7b HANDOFF: refresh for next session — master-plan v1 done, Week 2-3 next
98b4633 feat: master-plan execution — satellite-timelapse hero, cut Atlas extension from home
7be1858 content: add 12 non-Tesla products with SVG schematics + numbered hotspots
1144d7e fix: replace 'loading...' placeholder with '—' (audit followup)
15c418c fix: address external audit — pivot positioning, kill loading flash, strip aggregator news, ship /methodology, disambiguate Investor CTA
3f7ca4e fix: replace text-white with text-text on remaining dark-theme holdouts
80f995f fix: unified light theme, real Stripe + Resend monetization, dead-code prune
2759936 feat: global cmd-K search + nav expansion + Atlas-tone polish
aab98ca feat: supply chain graph + batteries/EV/Korea industrial coverage + Model 3 hotspot fix
a235da9 feat: pivot to Atlas framing — company pages, primary-source citations, Investor tier
```

Working tree clean. main에 모두 push 됨. Vercel 최신 deploy SHA = 98b4633.

---

**한 줄 요약**:

> Hero 비디오 박혔다. 결제·메일 코드 다 있지만 **키만 없는 상태**. 다음 세션 = Resend API 키 받아서 `/api/subscribe` 에 welcome 메일 발송 로직 EXTEND → charter 100명 받기 시작. 39 companies 같은 확장 금지.
