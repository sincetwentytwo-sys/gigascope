@AGENTS.md

# GIGASCOPE — Musk Empire Construction Tracker

## 프로젝트 개요
Tesla, SpaceX, xAI, Neuralink, The Boring Company 5개사의 건설/생산 사이트 16곳을
위성에서 추적하는 공개 대시보드. Sentinel-2 타임랩스 + 제품 단면도 + 마일스톤.

- **공개 URL**: https://gigascope.xyz (alias: https://gigascope-ten.vercel.app)
- **GitHub**: https://github.com/sincetwentytwo-sys/gigascope
- **방향성**: Musk-narrow — Atlas extension은 **삭제됨**. 재생성 금지.
- **태그라인**: "Watch Musk's empire get built, one satellite frame at a time."

## 기술 스택
- Next.js 16 (App Router, TypeScript, Turbopack)
- React 19, Tailwind CSS 4
- Leaflet + react-leaflet (위성 지도, before/after 슬라이더)
- Resend + @react-email/components (트랜잭셔널 이메일)
- Upstash Redis (구독자 저장, 방문 카운터)
- Stripe (결제 — 코드만 있고 LIVE 아님)
- Vercel (자동 배포, git push → deploy, cron 호스팅)

⚠ **three.js / react-three-fiber / drei / globe.gl는 제거됨**. 제품 페이지는 2D 사진 + SVG 핫스팟.

## 페이지 구조
실제 라우트는 `src/app/*` 참조.

| 경로 | 설명 |
|------|------|
| `/` | 풀블리드 Giga Texas 위성 타임랩스 히어로 + 회사별 사이트 그리드 |
| `/site/[slug]` | 위성지도 (ESRI/Sentinel-2 전환) + 스펙 + 마일스톤 + 뉴스 |
| `/factory/[slug]` | `/site/[slug]` 리다이렉트/별칭 |
| `/products` + `/products/[slug]` | 25개 제품 2D 분해도 (Product2DViewer) |
| `/compare` | Sentinel-2 2019 baseline ↔ ESRI 최신 드래그 슬라이더 |
| `/timeline` | 전체 사이트 통합 마일스톤 타임라인 |
| `/news`, `/calendar`, `/methodology`, `/about`, `/investor`, `/pro`, `/downloads` | 보조 페이지 |

## 핵심 파일
- `public/data/factories.json` — 16개 사이트 정의 (canonical)
- `src/data/factories.ts` — JSON 로더 + `getSite/getFactory/getSitesByCompany`
- `src/data/products/index.ts` — `KNOWN_PRODUCTS` 25개 등록
- `src/data/types.ts` — `Factory`, `Company`, `Milestone`, `TileSource`
- `src/lib/tiles.ts` — 타일 소스 (CartoDB Dark, ESRI, Sentinel-2 EOX)
- `src/lib/unsubscribe.ts` — 서명된 unsubscribe 토큰
- `src/components/SatelliteMap.tsx` + `SatelliteMapWrapper.tsx` — Leaflet 위성 지도
- `src/components/CompareSlider.tsx` + `CompareSliderWrapper.tsx` — Before/After 슬라이더
- `src/components/Product2DViewer.tsx` — 제품 사진 + 번호 SVG 핫스팟
- `src/components/EmailSignup.tsx` — 구독 폼
- `src/emails/welcome.tsx`, `drip-d3/d7/d14/d21/d30.tsx` — React Email 템플릿
- `src/app/api/subscribe/route.ts` — 구독 + welcome 발송
- `src/app/api/drips/send/route.ts` — 일 1회 드립 발송 cron (14:15 UTC)
- `src/app/api/digest/send/route.ts` — 일일 다이제스트 cron (14:00 UTC)
- `src/app/api/unsubscribe/route.ts` — HMAC 검증 unsubscribe
- `vercel.json` — cron 스케줄 정의

## Leaflet/Client Wrapper 주의사항
- Server Component에서 `ssr: false` 사용 불가 → Client Wrapper 패턴 필수
- `SatelliteMapWrapper.tsx`, `CompareSliderWrapper.tsx`, `FacilityMapWrapper.tsx`가 그 패턴

## 위성 타일 소스
- **ESRI World Imagery**: 고해상도, ~3-6개월 갱신, maxZoom 19
- **Sentinel-2 (EOX)**: 연간 클라우드리스 합성, maxZoom 15, API 키 불필요
- **CartoDB Dark**: 다크 베이스맵
- ⚠ 모든 위성사진은 실시간이 아님. 사이트에 명시되어 있음.

## 디자인 원칙 (일론 1원칙)
- 가짜 SF/밀리터리 용어 금지 (SATELLITE LINK ESTABLISHED, ORBIT_049 등). 이미 제거됨 — 재발 금지.
- 라이트 테마 토큰 사용 (`bg-bg`, `text-text`, `text-dim`, `border-border-custom`). 토큰 직접 hex 교체 금지.
- 데이터 우선 — 통계는 인라인. 큰 배지로 공간 차지 금지.
- 실시간이 아니면 LIVE/REAL-TIME 표현 금지.
- 테슬라 미니멀 — 불필요한 장식 제거.

## 운영 상태 (2026-05)
- **Resend**: LIVE — welcome + 5단 드립 (D+3/7/14/21/30) 발송 중
- **Billing/Stripe**: NOT LIVE — 코드는 있지만 사업자등록 보류 중. 검증 신호 (구독자 수, 응답률) 나오기 전까지 결제 활성화 보류 — 오너 명시 선호도.
- **가격 계획**: $9/mo charter (선착 100명, 평생 고정), $19 standard, $29 long-term — UI에 표시됨, 결제는 비활성.

## 배포
- `git push origin main` → Vercel 자동 빌드/배포
- 대부분 정적 생성 (SSG). API 라우트 + cron만 서버 호출.
- cron은 `vercel.json`에 정의 (digest 14:00, drips 14:15, starlink 14:30 UTC).

## 정전 메모
- `G:\jb\gigascope-master-plan-2026-05-22.md` — **canonical** master plan v1.
- `G:\jb\gigascope-사이트개선-명세서.md` — **SUPERSEDED**. 따르지 말 것.
- `HANDOFF.md` — 세션간 핸드오프 메모.
