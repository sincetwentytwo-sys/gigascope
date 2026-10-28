---
name: verify-gigascope
description: GIGASCOPE 변경을 "빌드 됐다"가 아니라 실제로 띄워서 눌러보고 증거(스크린샷·통과 줄)로 확인하는 절차. 페이지·컴포넌트·데이터(factories.json, products)를 고친 뒤, main 에 머지하기 전, "됐다"고 보고하기 전에 반드시 쓴다.
---

# GIGASCOPE 검증

`main` 머지 = 운영 배포(Vercel)다. 그래서 머지 전에 아래 3단계를 **실제로 돌리고**, 결과 줄과 스크린샷을 보고에 붙인다.
"빌드 성공"·"아마 될 것"은 검증이 아니다. 주장에는 **측정함 / 추론함 / 추측**을 구분해 붙인다.

## 0. 서버 띄우기
- 작업 폴더가 `G:\claude` 일 때: `preview_start {name: "gigascope"}` → `http://localhost:3010` (루트 `.claude/launch.json` 에 등록됨).
- 직접 띄울 땐 `npm run dev -- --port 3010` (gigascope 폴더). 첫 요청은 Turbopack 컴파일로 3~6초 걸린다 — 첫 줄 느린 건 정상.
- 운영 비교가 필요하면 `--base https://gigascope.xyz`.

## 1. HTTP 스윕 — 모든 페이지가 진짜 내용을 그리는가
```bash
node scripts/verify/smoke.mjs --base http://localhost:3010            # 사이트맵 전 페이지(약 41개) + 죽인 페이지 308 + feed
node scripts/verify/smoke.mjs --base http://localhost:3010 --paths /site/giga-texas,/compare   # 고친 페이지만
```
- 페이지 목록은 앱 자신의 `/sitemap.xml` 에서 읽는다 → 사이트·제품을 추가해도 이 스크립트는 안 고쳐도 된다.
- 200 이어도 `Application error`·`__next_error__` 가 있으면 실패, 페이지별 내용 표지(사이트=마일스톤, 제품=SVG 등)가 없어도 실패.
- **읽기 전용**: cron·subscribe·checkout·webhook 라우트는 절대 안 부른다(실제 메일 발송/Stripe). 새 검사를 넣을 때도 지킬 것.

## 2. 실제 브라우저 — 클라이언트에서만 생기는 것
```bash
py scripts/verify/browser_check.py --base http://localhost:3010 --out G:/Temp/gs_verify/local
```
헤드리스 Edge(Playwright)로: 사이트 페이지 Leaflet 지도 마운트 + 위성 타일 실제 로드 + 출처 표기 + 타일 전환 버튼,
/compare 이미지, 홈 사이트 그리드 링크, **콘솔·페이지 에러 0**. 스크린샷은 `--out` 에 남는다 → **열어서 눈으로 본다**
(특히 `site_<slug>_map.png`). 다른 사이트를 보려면 `--site cortex`.

## 3. 유닛 테스트 · 타입
```bash
npx vitest run          # 172개(2026-10-28 기준)
npx tsc --noEmit -p .
```

## 기능 지도 (무엇을 고치면 무엇을 본다)
| 고친 곳 | 반드시 볼 것 |
|---|---|
| `public/data/factories.json`, `src/data/factories.ts` | 스윕 전체(사이트 페이지 수가 바뀜), 홈 그리드, 해당 `/site/<slug>` 지도 스크린샷 |
| `SatelliteMap.tsx`, `src/lib/tiles.ts` | browser_check 사이트 단계 + 타일 전환, 출처 표기(라이선스 필수) |
| `CompareSlider*.tsx` | browser_check compare 단계 + `compare.png` |
| `src/data/products/*`, `Product2DViewer` | `--paths /products,/products/<slug>` + 브라우저로 핫스팟 확인 |
| `next.config.ts` redirects | 스윕의 redirect 줄(/news·/timeline·/calendar·/downloads) |
| 메일(`src/emails`, drips, digest) | 여기 검증 대상 아님 — 실제 발송 금지. vitest `drips.test.ts` 만 |

## 함정 (실제로 당한 것)
- **숨김 상태의 앱 내장 브라우저 팬으로 지도 판정 금지.** 팬이 숨겨지면 뷰포트가 0×0 이 돼 Leaflet 이 안 뜨고,
  운영 사이트까지 "지도 고장"처럼 보인다(2026-10-28 가짜 결함). 지도는 `browser_check.py` 로 판정한다.
- **Playwright 스크린샷은 `caret="initial"` + 하이드레이션 후에.** 기본값(caret hide)은 DOM 에 caret-color 를 끼워 넣어
  하이드레이션 전이면 React 가 가짜 "hydration mismatch" 를 낸다.
- Git Bash 는 `--paths /site/x` 의 첫 인자를 `C:/Program Files/Git/site/x` 로 바꾼다 — 스크립트가 되돌리니 그대로 써도 된다.
- dev 의 StrictMode 는 effect 를 두 번 돌린다. 비동기 `import("leaflet")` 로 지도를 만드는 effect 는 반드시 cleanup(`cancelled` 플래그 + `map.remove()`)을 둔다
  — 없으면 "Map container is already initialized"(2026-10-28 수정).

## 보고 형식
- 실행한 명령과 마지막 요약 줄(`PASSED: 41/41 pages`, `PASSED: 7/7 checks`, `172 passed`)을 그대로 붙인다.
- 실패가 있으면 실패 줄 원문 + 원인(측정/추론 구분) + 고쳤는지. 건너뛴 단계는 이유와 함께 적는다.
