# GIGASCOPE — Session Handoff

**Last updated**: 2026-05-22 (post-master-plan pivot)
**Live (primary)**: https://gigascope.xyz
**Live (alias)**: https://gigascope-ten.vercel.app
**Repo**: https://github.com/sincetwentytwo-sys/gigascope (main branch · Vercel auto-deploy)

---

## 🔑 First message to paste in a new session

```
HANDOFF.md 읽고 현재 상태 파악해줘. 그리고 아래 "다음 작업" 섹션의 우선순위 1번부터 진행.

진행 원칙:
- Master plan(G:\jb\gigascope-master-plan-2026-05-22.md) + audit(G:\jb\gigascope-audit-2026-05-22.md) 이 캐논. 둘 다 읽고 시작.
- "Musk 제국 위성 트래커" 한 가지에 집중. 39개 회사·11개 섹터·Atlas extension은 코드베이스에 살아있지만 더 키우지 말 것.
- 매 작업마다: build → commit → push → 라이브 검증(cache-buster query 필수).
- HTML 응답이 직전과 100% 동일하면 → X-Vercel-Cache STALE 가능성. ?bust=$(date +%s%N) 로 재검증.
```

---

## 현재 상태 (한 줄)

**Master plan 1주차 Week 1 항목 완료, Week 2~6 미진행.**

홈 hero에 Giga Texas Sentinel-2 타임랩스 mp4 풀-블리드로 박혔고, 헤드라인은
"Tesla Gigafactory Texas — six years from dirt." 21개 티커 그리드 + 11개
섹터 스트립 + Extended Atlas tiles 전부 home에서 제거. 16개 Musk 사이트
카드만 본문. Atlas 익스텐션(39 companies / 5 private / 11 sectors / 14 learn
entries / 25 products) 코드는 모두 살아있지만 home에서 푸터 작은 링크로
demote됨.

**Latest commit**: `98b4633 feat: master-plan execution — satellite-timelapse hero, cut Atlas extension from home`

---

## 오늘(2026-05-22) 한 일 — 17 commit 요약

### Wave 1-7 (밤): Atlas 확장 (오버슈팅 → 나중에 cut)
- 다중 sector / multi-ticker / private companies / learn glossary 등
- Stripe + Resend 결제·메일 scaffold
- 39 public companies × 11 sectors × 5 privates × 14 learn × 25 products
- 모든 인프라 코드 OK, 다만 정체성 흐려짐 → 다음 단계에서 좁혀짐

### Audit 대응 (오전): 라이트 테마 통일 + 외부 audit 5개 fix
- 다크/네온 hex 색 → 라이트 토큰 일괄 변환
- GlobeBackground 워터마크 제거
- KRW/USD `toLocaleString` 포맷
- Supply chain tier max-of 계산
- Stripe checkout + Resend 다이제스트 sender 실제 동작
- "Become an Investor" → "Investor tier · $9/mo" + 명시적 "not equity"
- Google News RSS aggregator 전부 제거 → 직접 RSS만
- SSR prefetch로 "loading..." 텍스트 모두 제거 (홈 + /markets)
- /methodology 페이지 신설
- About 페이지 5 moats / 4-tier source policy로 리라이트

### Master Plan 실행 (오후): Musk-only 좁히기
- Home hero: Giga Texas 타임랩스 mp4 풀-블리드 (16:9, autoplay loop)
- 헤드라인: "Tesla Gigafactory Texas — six years from dirt."
- 21개 ticker grid + 11 sector strip + Extended Atlas tiles 전부 home에서 삭제
- Nav: Musk-empire 메뉴 우선, Atlas는 70% opacity 단일 링크로 demote
- Meta/OG: "Watch Musk's empire get built, one satellite frame at a time"
- 푸터에 "broader Atlas" 작은 회색 링크로 익스텐션 유지

### Products 확장 (저녁)
- 13개 → 25개 product (12개 신규 + SVG 도식 + 번호 hotspot)
- NVIDIA Blackwell B200, HBM3E, ASML EUV, TSMC CoWoS, Hyundai IONIQ 5,
  Boston Dynamics Atlas, LGES Ultium, BYD Blade, Hanwha K9, Rocket Lab
  Neutron, IonQ Tempo, Oklo Aurora
- 각 부품 7-15개 번호 컴포넌트 + 정확한 hotspot 좌표
- `scripts/generate-schematic-svgs.mjs` 로 모두 자동 생성

---

## 🎯 다음 작업 — Master plan Week 2-6 (우선순위 순)

### **1. 사이트 카드에 위성 before/after 썸네일** (Week 2 핵심)
Master plan §4 Step 3: 모든 진척도 카드에 위성 썸네일 — "78%" 옆에 위성영상 → 신뢰 폭발.

```tsx
// src/components/FactoryCard.tsx 수정
// public/timelapses/<slug>.jpg 가 이미 존재 (poster image)
// 카드 최상단에 <img src={`/timelapses/${factory.slug}.jpg`}/> 추가
// 위 + 아래 비교가 핵심이라면 first-frame + last-frame 2장 필요 — public/timelapses/<slug>/0.jpg + last.jpg 같은 구조 추가
```

스크립트로 mp4에서 첫/마지막 프레임 추출:
```bash
ffmpeg -i public/timelapses/giga-texas.mp4 -vf "select=eq(n\,0)" -vframes 1 public/timelapses/giga-texas-first.jpg
ffmpeg -i public/timelapses/giga-texas.mp4 -sseof -1 -update 1 public/timelapses/giga-texas-last.jpg
```

16개 사이트 일괄 처리하는 bash 루프. 약 2시간 작업.

### **2. 각 카드에 last capture date + cloud cover %**
Master plan §1.4 신뢰성: `Updated 2026-05-20` 한 줄로는 부족. 사이트별 last capture date 노출.

이미 `factories.json` 의 각 사이트에 `lastUpdated` 가 있음. 추가로:
- `lastCapture: { date: "2026-05-15", cloudCover: 0, source: "Sentinel-2" }` 필드 추가
- FactoryCard 푸터에 작은 글씨로 노출 (`Last capture: 2026-05-15 · 0% cloud`)

`public/timelapses/index.json` 에 `latest: "2026-05-15"` 이미 있으니 FactoryCard에서 import해서 쓰면 됨.

### **3. /site/[slug] 페이지에 인터랙티브 타임 슬라이더**
Master plan §3.2: 유일하게 정당화되는 인터랙티브.

```
[2020] ───●─────────────── [2026]
         ↑ 드래그하면 위성영상이 시간순으로 모핑
```

구현 방법:
- `<input type="range">` 슬라이더 + JS로 video.currentTime 제어 (mp4 frame seek)
- 또는 33개 프레임 JPG로 추출 (`ffmpeg -i ... -vsync 0 frames/%03d.jpg`) → 슬라이더 인덱스로 <img src> 교체
- 후자가 훨씬 부드러움. 사이트당 ~3MB 추가 (33 × 90KB).

기존 `/site/[slug]/page.tsx` 의 "SATELLITE TIMELAPSE - 33 frames" 섹션을 인터랙티브로 업그레이드.

### **4. Sentinel-2 자동 fetch 파이프라인 + 매주 업데이트 cron**
Master plan §6 Week 4-5 핵심 moat 자산.

현재 `public/timelapses/index.json` 에 `builtAt: 2026-05-19T13:53:48.485Z` 한번 빌드된 정적 자산. 매주 자동 갱신해야 진짜 가치.

스택:
- Sentinel Hub 무료 계정 + API key (env var `SENTINEL_INSTANCE_ID`)
- `scripts/fetch-sentinel-frames.mjs` — 각 사이트별 lat/lng 박스로 NDVI/RGB 이미지 fetch
- GitHub Actions weekly cron이 이미 있는지 확인: `.github/workflows/` 디렉토리 확인

### **5. About 페이지에 운영 원칙 명시 (Week 5)**
Master plan §4 Step 5: "No paid placements. No affiliate links. Open source on GitHub. Last full audit: 2026-05-22."

About 페이지에 이미 5 moats / source policy / Korean differentiation 있음 — "운영 원칙" 박스 추가만 하면 됨.

### **6. 뉴스 파이프라인 자동 큐레이션 (Week 6)**
Master plan §6 Week 6: Teslarati / Electrek / Reuters / Bloomberg / FT 직접 RSS 6시간 cron.

현재는 클라이언트 NewsFeed가 매 요청마다 RSS fetch. 자동 큐레이션 (키워드 필터 + 중복 제거 + 출처 가중치) 추가하면 더 좋음.

---

## ⚠️ 함정 — 같은 실수 다시 하지 말 것

### 1. **Atlas 익스텐션 다시 키우지 말 것**
오늘 야간에 39 companies + 11 sectors 확장 → 외부 audit으로 cut. 코드는 유지 (`/markets`, `/sectors/*`, `/company/*`, `/ticker/*`, `/learn/*`, `/private/*` 다 살아있음) 하지만 **home + nav에서 더 surface 시키지 말 것**. v3로 미룸.

### 2. **Vercel 캐시 stale 함정**
배포 직후 curl 하면 직전 버전이 나올 수 있음. 검증 시 항상:
```bash
curl -s "https://gigascope.xyz/?bust=$(date +%s%N)" | grep -oE "검증어"
```
또는 cache-buster query (`?v=$(date +%s)`)로 브라우저 검증.

### 3. **테마 일관성**
모든 페이지가 light theme (bg-bg, text-text, border-border-custom). 새 다크 hex 색(`#1f1f23`, `#00d4ff`, neon 등) 절대 추가하지 말 것.

### 4. **3D viewer 부활 금지**
three.js, @react-three/fiber, drei 다 제거됨. Product2DViewer (사진 + hotspot 점) 가 표준. 3D 다시 만들지 말 것.

### 5. **GlobeBackground 부활 금지**
워터마크 지구본은 라이트 테마와 충돌해서 제거함. 다시 import 하지 말 것.

### 6. **광고/제휴 링크 금지**
Master plan: "No paid placements. No affiliate links."

### 7. **Stripe 결제 환경변수**
`/api/checkout` 은 STRIPE_SECRET_KEY 없으면 503 정상 응답. 결제 실제 활성화는 owner가 Vercel env에 직접 추가 필요. 키 코드에 적지 말 것.

---

## 📂 파일 구조 (자주 만질 곳)

| Path | 역할 |
|---|---|
| `src/app/page.tsx` | 홈 (Master plan 대로 Musk-only 좁혀짐) |
| `src/app/layout.tsx` | 글로벌 nav, metadata, 검색 |
| `src/app/site/[slug]/page.tsx` | 개별 사이트 대시보드 (위성지도 + 타임랩스 + 마일스톤) |
| `src/app/methodology/page.tsx` | 진척도 % 신뢰 자산 |
| `src/app/investor/page.tsx` | 결제 랜딩 ($9/mo + $99/yr Stripe) |
| `src/components/FactoryCard.tsx` | 사이트 카드 (다음 작업: 위성 썸네일 추가) |
| `src/data/factories.ts` | 16개 Musk 사이트 (다음 작업: lastCapture 필드 추가) |
| `src/data/products/*.ts` | 25개 product (12 Musk + 12 Atlas extension + 4680) |
| `public/timelapses/<slug>.mp4` | 16개 사이트 mp4 타임랩스 (이미 존재) |
| `public/timelapses/index.json` | 빌드 인덱스 (`frames`, `latest`, `builtAt`) |
| `scripts/apply-hotspots.py` | 제품 hotspot 좌표 (Tesla 13개용; 신규 12개는 SVG 도식이라 별도) |
| `scripts/generate-schematic-svgs.mjs` | 12개 신규 product SVG 도식 생성 |
| `vercel.json` | cron: `/api/digest/send` daily 14:00 UTC |

### Atlas 익스텐션 (v3까지 동결)
| Path | 역할 (현재 home 비노출, 직접 URL 접근만) |
|---|---|
| `src/app/markets/page.tsx` | Atlas heatmap (39 companies × 11 sectors) |
| `src/app/company/[slug]/page.tsx` | 회사 페이지 |
| `src/app/sectors/[slug]/page.tsx` | 섹터 페이지 |
| `src/app/private/[slug]/page.tsx` | 비상장 (SpaceX, xAI, Anduril, Helion, Commonwealth Fusion) |
| `src/app/learn/[slug]/page.tsx` | 14개 glossary |
| `src/app/supply-chain/page.tsx` | 직접 의존성 그래프 |
| `src/data/tickers.ts` | 39개 ticker 메타 + deepDive |
| `src/data/privateCompanies.ts` | 5개 비상장 |
| `src/data/learn.ts` | 14개 glossary |
| `src/data/supplyChain.ts` | 직접 의존성 edge 34개 |

---

## 🔧 자주 쓰는 명령

```bash
# 로컬 개발
cd G:/claude/gigascope && npm run dev

# 배포 전 빌드 검증 (필수)
npx next build

# Hotspot 조정 (Tesla 제품들)
"G:/ComfyUI_windows_portable/venv/Scripts/python.exe" scripts/apply-hotspots.py

# 비-Tesla 제품 SVG 도식 재생성
node scripts/generate-schematic-svgs.mjs

# 최근 배포 상태
gh api "repos/sincetwentytwo-sys/gigascope/deployments?per_page=3" | grep -oE '"state":"[^"]*"'

# 라이브 변경사항 검증 (캐시 우회)
curl -s "https://gigascope.xyz/?bust=$(date +%s%N)" | grep -oE "검증어"

# 최근 commit
git log --oneline -10
```

---

## 🌐 환경변수 (Vercel)

Owner가 Vercel 대시보드에서 직접 설정. **코드에 키 적지 말 것**.

| 변수 | 용도 | 없을 때 동작 |
|---|---|---|
| `STRIPE_SECRET_KEY` | Investor 결제 | `/api/checkout` 503 graceful fail |
| `RESEND_API_KEY` | 다이제스트 메일 | `/api/digest/send` 503 |
| `UPSTASH_REDIS_REST_URL`+`_TOKEN` | 구독자 저장 | EmailSignup 성공 표시하지만 저장 안 됨 |
| `CRON_SECRET` | 다이제스트 cron 보호 (선택) | 인증 없이 호출 가능 |
| `DIGEST_FROM` | 보낸이 이메일 (선택) | "GIGASCOPE <digest@gigascope.xyz>" 디폴트 |
| `FINNHUB_API_KEY` | TSLA 시세 1차 출처 (선택) | Yahoo로 폴백 |

---

## 📝 Owner 행동 메모리

- Korean. `~합니다` / `~해드릴게요` 톤
- Direct, fact-based. 아이디어 나쁘면 정직하게 push back
- 모든 fix 후 즉시 main에 머지 (Vercel auto-deploy)
- 소규모/되돌릴 수 있는 변경은 확인 안 받음. 위험한 변경은 확인 받음
- "필요 없는 건 다 빼라" — additions보다 cuts 우선
- "쩐다"는 정보 많이 보여서 나오는 게 아니라 **하나를 미친 듯이 잘** 보여줘야 나옴

---

## 🎯 6주 뒤 v2 출시 목표 (Master plan §6)

- [x] **Week 1**: 정체성 정리 (헤드라인, CTA, 첫 화면 cut, loading… SSR)
- [ ] **Week 2**: 위성영상 파이프라인 + Hero 비디오 → **Hero ✅ 이미 완료. 파이프라인 자동화 미완.**
- [ ] **Week 3-4**: 11개 사이트 위성영상 확장 (썸네일 + 인터랙티브 슬라이더)
- [ ] **Week 5**: 방법론 페이지 ✅ + 사이트별 last capture 노출 ❌
- [ ] **Week 6**: 뉴스 파이프라인 자동 큐레이션

오늘 Week 1을 끝냈고 Week 2의 hero 부분은 끝났음. **다음 세션은 Week 2 잔여 + Week 3 (사이트 카드 위성 썸네일 + 인터랙티브 타임 슬라이더)** 가 코어.

---

## Repo state at end of session

Latest commits (newest first):
```
98b4633 feat: master-plan execution — satellite-timelapse hero, cut Atlas extension from home
7be1858 content: add 12 non-Tesla products with SVG schematics + numbered hotspots
1144d7e fix: replace 'loading...' placeholder with '—' (audit followup)
15c418c fix: address external audit — pivot positioning, kill loading flash, strip aggregator news, ship /methodology, disambiguate Investor CTA
3f7ca4e fix: replace text-white with text-text on remaining dark-theme holdouts
80f995f fix: unified light theme, real Stripe + Resend monetization, dead-code prune
2759936 feat: global cmd-K search + nav expansion + Atlas-tone polish
aab98ca feat: supply chain graph + batteries/EV/Korea industrial coverage + Model 3 hotspot fix
a235da9 feat: pivot to Atlas framing — company pages, primary-source citations, Investor tier
e19c893 feat: massive multi-sector expansion — markets + sectors + tickers + pro tier
```

Working tree clean. main에 모두 push 됨.

---

**한 줄 요약 — 다음 세션이 명심할 것**:

> Hero 비디오는 박혔다. 이제 매주 갱신되는 위성 컨텐츠 파이프라인(Week 2-3)과 사이트 카드의 before/after 썸네일이 다음 moat. **39 companies 같은 확장 더는 하지 말 것.**
