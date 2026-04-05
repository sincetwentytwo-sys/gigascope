@AGENTS.md

# GIGASCOPE — Tesla Factory Construction Tracker

## 프로젝트 개요
Tesla Terafab + 전 세계 기가팩토리 8곳의 건설 진척도를 추적하는 공개 대시보드.
위성사진 비교, 3D 글로브, 마일스톤 타임라인 제공.

- **공개 URL**: https://gigascope-ten.vercel.app
- **GitHub**: https://github.com/sincetwentytwo-sys/gigascope
- **경쟁 사이트**: terafabtracker.com (뉴스/X피드 중심 — 우리는 시각화/인터랙티브 특화)

## 기술 스택
- Next.js 16 (App Router, TypeScript, Turbopack)
- Tailwind CSS 4
- globe.gl (3D 지구본, Three.js 래퍼)
- Leaflet + react-leaflet (위성 지도)
- Google Stitch SDK (UI 디자인 생성 → 코드화)
- Vercel (자동 배포, git push → deploy)

## 페이지 구조
| 경로 | 설명 |
|------|------|
| `/` | 3D 글로브 히어로 + Terafab 스포트라이트 + 팩토리 카드 그리드 |
| `/factory/[slug]` | 위성지도 (ESRI/Sentinel-2 전환) + 스펙 + 마일스톤 + 차트 |
| `/compare` | Before/After 위성사진 드래그 슬라이더 |
| `/timeline` | 전체 공장 통합 마일스톤 타임라인 |
| `/about` | 데이터 소스, 기술 스택, 면책 조항 |

## 핵심 파일
- `src/data/factories.ts` — 8개 공장 데이터 (좌표, 진행률, 마일스톤, 제품)
- `src/data/types.ts` — Factory, Milestone, TileSource 타입
- `src/lib/tiles.ts` — 위성 타일 소스 3종 (CartoDB Dark, ESRI, Sentinel-2)
- `src/components/Globe.tsx` — globe.gl 3D 글로브 (OrbitControls 드래그 회전, wheel은 페이지로 통과)
- `src/components/SatelliteMap.tsx` — Leaflet 위성 지도 (타일 전환)
- `src/components/CompareSlider.tsx` — Before/After 슬라이더 (CSS clip-path)
- `src/components/FactoryCard.tsx` — 팩토리 카드 컴포넌트
- `designs/` — Stitch API로 생성한 UI 디자인 4개 (hero, factory-card, factory-detail, compare-page)

## globe.gl 주의사항
- Server Component에서 `ssr: false` 사용 불가 → Client Wrapper 패턴 필수
  - `GlobeWrapper.tsx`, `SatelliteMapWrapper.tsx`, `CompareSliderWrapper.tsx`
- globe.gl의 scene-container div가 레이아웃을 깨뜨림 → MutationObserver로 position:absolute 강제
- OrbitControls의 enableZoom=false로 wheel 이벤트를 페이지 스크롤로 통과시킴
- canvas에서 wheel 이벤트 가로채서 document로 re-dispatch

## 위성 타일 소스
- **ESRI World Imagery**: 고해상도, ~3-6개월 갱신, maxZoom 19
- **Sentinel-2 (EOX)**: 연간 클라우드리스 합성, maxZoom 15, API 키 불필요
- **CartoDB Dark**: 다크 베이스맵
- ⚠ 모든 위성사진은 실시간이 아님! 사이트에 명시 필수

## Stitch SDK 활용
- `scripts/generate-designs.js` — 히어로 등 UI 디자인 생성 스크립트
- `.env.local`에 `STITCH_API_KEY` 필요
- 프로젝트 ID: `16248735415247781285`
- 생성된 디자인은 `designs/` 폴더에 HTML+PNG로 저장

## 디자인 원칙 (일론 1원칙 적용)
- 가짜 SF 용어 사용 금지 (SATELLITE LINK ESTABLISHED, ORBIT_049 등)
- 장식보다 기능 — 모든 요소는 클릭/이동 가능해야 함
- 데이터 우선 — 통계는 인라인으로, 큰 공간 차지 금지
- 실시간이 아니면 LIVE라고 쓰지 않기
- 테슬라 미니멀 미학 — 불필요한 것은 제거

## 남은 작업
- [ ] Stitch 디자인 나머지 3개 (card, detail, compare) 코드 반영
- [ ] 모바일 반응형 정리
- [ ] 커스텀 도메인 연결
- [ ] 실제 뉴스/X 피드 연동 (RSS 등)
- [ ] Favicon을 궤도 스코프 SVG로 교체
- [ ] 팩토리 데이터 업데이트 자동화

## 배포
- `git push` → Vercel 자동 빌드/배포
- 모든 페이지 정적 생성 (SSG) — 서버 비용 없음
