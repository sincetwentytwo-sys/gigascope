# GIGASCOPE Handoff Document

**Date**: 2026-05-19
**Branch**: `claude/setup-gigascope-jw0PU` (51 commits ahead of `main`)
**Live URL**: https://gigascope-ten.vercel.app
**Repo**: https://github.com/sincetwentytwo-sys/gigascope

---

## 프로젝트 요약

"Musk Empire Tracker" — 일론 머스크 산하 6개 회사(Tesla, SpaceX, xAI, Neuralink, The Boring Company, Joint Ventures)의 16개 시설 건설/확장 진척도를 위성사진과 함께 추적하는 공개 대시보드.

원래 Tesla 기가팩토리 전용 트래커였으나 **Musk Empire 전체로 확장** 완료.

---

## 기술 스택

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Maps | Leaflet + react-leaflet (위성 타일 3종) |
| Globe | globe.gl (Three.js) — 현재 비활성, 과거 히어로에 사용 |
| Stock Data | Finnhub API (TSLA 실시간 주가) |
| Space Data | Launch Library 2 + CelesTrak (SpaceX 통계) |
| Analytics | Upstash Redis (일별 방문자 카운터) |
| Deploy | Vercel (git push → 자동 배포, SSG + ISR 30분) |

### 주요 의존성

```
next: 16.2.2, react: 19.2.4, leaflet: ^1.9.4
@upstash/redis: ^1.37.0, tailwindcss: ^4
```

---

## 페이지 구조

| 경로 | 설명 | 주요 컴포넌트 |
|------|------|---------------|
| `/` | 히어로(통계) + TSLA 티커 + SpaceX 통계 + 회사별 사이트 카드 그리드 | `StockTicker`, `SpaceXStats`, `FactoryCard`, `NewsFeed`, `CommunityFeed` |
| `/site/[slug]` | 사이트 상세 — 위성지도(ESRI/Sentinel-2 전환) + 스펙 + 마일스톤 + 차트 | `SatelliteMap` |
| `/compare` | Before/After 위성사진 드래그 슬라이더 (회사별 그룹) | `CompareSlider` |
| `/timeline` | 전체 사이트 통합 마일스톤 타임라인 (회사 필터) | `TimelineContent` |
| `/about` | 데이터 소스, 기술 스택, 면책 조항 | — |
| `/not-found` | 404 페이지 | — |

### API Routes

| 경로 | 용도 |
|------|------|
| `/api/tsla/route.ts` | Finnhub TSLA 주가 프록시 (서버사이드 → 3초 클라이언트 폴링) |
| `/api/spacex/route.ts` | Launch Library 2 + CelesTrak SpaceX 통계 |
| `/api/visits/route.ts` | Upstash Redis 방문자 카운트 (HyperLogLog) |

---

## 데이터 구조

### 사이트 데이터 (`public/data/factories.json`)

16개 사이트, JSON 파일에서 로드. 각 사이트:

```typescript
interface Factory {
  id, slug, name, aka, flag, location  // 식별 정보
  lat, lng                              // 위성지도 좌표
  company: Company                      // "tesla" | "spacex" | "xai" | "neuralink" | "boring" | "joint"
  status: "operational" | "expanding" | "construction" | "planned" | "paused"
  progress: number                      // 0–100%
  area, capacity, products, investment, employees  // 스펙
  milestones: Milestone[]               // 날짜+텍스트+완료여부
  timeline: number[]                    // 연도별 진행률 배열
}
```

### 회사 메타 (`src/data/companies.ts`)

6개 회사: Tesla(⚡), SpaceX(🚀), xAI(🧠), Neuralink(🔬), Boring(🕳️), Joint(🤝)
각 회사별 색상 코드 지정 → 글로브 점, 카드 보더, 타임라인 필터에 사용.

---

## 현재 사이트 목록 (16개)

| Company | Site | Status | Progress |
|---------|------|--------|----------|
| Joint | TERAFAB | construction | 2% |
| Tesla | Gigafactory Texas | expanding | 78% |
| Tesla | Gigafactory Nevada | expanding | 65% |
| Tesla | Gigafactory Shanghai | operational | 95% |
| Tesla | Gigafactory Berlin | operational | 82% |
| Tesla | Gigafactory Mexico | construction | 25% |
| Tesla | Fremont Factory | operational | 100% |
| Tesla | Gigafactory New York | operational | 90% |
| SpaceX | Starbase | expanding | 70% |
| SpaceX | SpaceX HQ | operational | 95% |
| SpaceX | Cape Canaveral | operational | 90% |
| SpaceX | Vandenberg SFB | operational | 85% |
| xAI | Colossus | expanding | 60% |
| Neuralink | Neuralink HQ | operational | 80% |
| Neuralink | Neuralink Austin | construction | 30% |
| Boring | Vegas Loop | expanding | 35% |

---

## 자동화 & CI/CD

### GitHub Actions Workflows (`.github/workflows/`)

| Workflow | 주기 | 역할 |
|----------|------|------|
| `weekly-rebuild.yml` | 주 1회 | Vercel 빌드 트리거 (위성사진 갱신) |
| `data-freshness.yml` | — | 데이터 신선도 체크 |
| `daily-marketing.yml` | 매일 | 마케팅 드래프트 생성 |
| `launch-monitor.yml` | — | SpaceX 발사 모니터링 |

### 마케팅 자동화 (`scripts/marketing/`)

- `generate.mjs` — 마케팅 드래프트 자동 생성
- `post-to-x.mjs` — X(Twitter) API v2로 자동 포스팅
- `launch-monitor.mjs` — SpaceX 발사 감지 → 자동 포스트
- `templates.mjs` — 포스트 템플릿
- UTM 트래킹 + 랜덤 jitter로 봇 감지 회피

---

## 환경 변수 (필요)

| 변수 | 용도 | 필수? |
|------|------|-------|
| `FINNHUB_API_KEY` | TSLA 실시간 주가 | Yes (티커 표시용) |
| `UPSTASH_REDIS_REST_URL` | 방문자 카운터 | Yes (카운터용) |
| `UPSTASH_REDIS_REST_TOKEN` | 방문자 카운터 | Yes |
| `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET` | X 자동 포스팅 | Marketing only |
| `STITCH_API_KEY` | UI 디자인 생성 | Optional |

---

## 주요 아키텍처 결정 & 주의사항

1. **globe.gl SSR 불가** — Client Component 래퍼 패턴 사용 (`*Wrapper.tsx`)
2. **위성 타일은 실시간 아님** — ESRI 3-6개월, Sentinel-2 연간 합성. "LIVE" 표기 금지
3. **경로 마이그레이션 완료** — `/factory/[slug]` → `/site/[slug]` (과거 경로도 유지)
4. **ISR 30분** — `revalidate = 1800` (홈페이지)
5. **SSG 기반** — 서버 비용 없음, 모든 페이지 정적 생성
6. **방문자 카운터** — HyperLogLog 기반 고유 방문자 카운트

---

## 이 브랜치에서 완료된 작업 (main 대비)

1. **Musk Empire 확장** (Phase 1-7)
   - 데이터 모델에 `Company` 타입 추가
   - Tesla 외 SpaceX, xAI, Neuralink, Boring Company 사이트 추가 (8→16개)
   - 경로를 `/factory/` → `/site/`로 마이그레이션
   - SpaceX API 연동 (Launch Library 2 + CelesTrak)
   - 홈페이지를 회사 섹션별로 재디자인
   - 글로브 점 색상을 회사별로 구분
   - Compare 페이지 회사별 그룹화
   - 타임라인 회사 필터 추가

2. **마케팅 자동화**
   - X API v2 자동 포스팅
   - 일일 마케팅 드래프트 생성
   - SpaceX 발사 모니터링
   - UTM 트래킹 + posting jitter

3. **이전 작업 (main에 머지 완료)**
   - TSLA 실시간 주가 티커
   - SEO (OG 이미지, sitemap, robots.txt)
   - 방문자 카운터 (Upstash Redis)
   - 커뮤니티 피드 (Reddit RSS + HN)
   - 뉴스 피드 (Google News RSS)
   - PWA manifest, 접근성 개선

---

## 남은 작업 (TODO)

- [ ] Stitch 디자인 나머지 3개 (card, detail, compare) 코드 반영
- [ ] 모바일 반응형 정리
- [ ] 커스텀 도메인 연결
- [ ] 실제 뉴스/X 피드 연동 (RSS 등) — 부분 완료
- [ ] Favicon을 궤도 스코프 SVG로 교체 — 완료
- [ ] 팩토리 데이터 업데이트 자동화
- [ ] `claude/setup-gigascope-jw0PU` → `main` 머지 (PR 생성 필요)

---

## 로컬 개발

```bash
npm install
npm run dev          # http://localhost:3000 (Turbopack)
npm run build        # 프로덕션 빌드
```

## 디자인 원칙

- 가짜 SF 용어 사용 금지
- 장식보다 기능 — 모든 요소는 클릭/이동 가능
- 데이터 우선 — 통계는 인라인, 큰 공간 차지 금지
- 실시간 아니면 LIVE 표기 금지
- 테슬라 미니멀 미학 — 불필요한 것은 제거
