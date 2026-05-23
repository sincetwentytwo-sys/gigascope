# GIGASCOPE YouTube 채널 자동화 메커니즘

> 작성: 2026-05-24 · gigascope.xyz funnel 채널 (@gigascopehq)
> Source 자동화 코드는 별도 repo `G:/claude/bribbbing-shorts/` 에 존재 (기존 브리삥·Hallyu Drop 파이프라인 확장).
> 이 문서는 사이트 프로젝트 세션에서 채널 운영 흐름을 이해하기 위한 참조용.

---

## 0. 채널 기본 정보

| 항목 | 값 |
|---|---|
| Channel ID | `UC1gjjjSQ5U00mZ9MStNuXtg` |
| Handle | `@gigascopehq` |
| URL | https://www.youtube.com/@gigascopehq |
| 운영 시작 | 2026-05-23 (채널 생성), 2026-05-24 첫 영상 publish |
| 첫 영상 | `GuGrOpCrEto` "SpaceX filed for a $2T IPO. Satellite data shows the catch." |
| YouTube category | 28 (Science & Technology) |
| 청중 | US 30-40s 투자자·retail trader·SpaceX/Tesla 관심층 |
| 톤 | Bloomberg/데이터 저널리스트, 직설, methodology 기반, 과장 X |
| Funnel 목표 | gigascope.xyz `$9 Investor tier` 구독 전환 |

---

## 1. 컨텐츠 포맷

### 1.1 영상 스펙

- YouTube Shorts 9:16 (1080×1920)
- 길이 40-50초 (가속 1.05x, Kokoro Sarah voice ~140 wpm)
- 6 카드 구조:
  - **카드 1 (hook + brand)**: 핵심 데이터 1줄 + `This is GigaScope.`
  - **카드 2~5**: 구체 디테일 (숫자·기관·날짜·위성 신호)
  - **카드 6 (CTA)**: `Full dossier at gigascope dot ex why zee. Save and follow at GigaScope HQ.`
- 썸네일 1초 인트로 + 6 카드 = 평균 50초

### 1.2 요일별 포맷 분기 (7일 publish)

`recovery-stage1-meta-gigascope.md`가 `tgt.weekday()` 기반 분기:

| 요일 | FORMAT | 내용 | Hook 패턴 |
|---|---|---|---|
| 월-금 | `daily` | 단일 이벤트 driven. S-1·earnings·launch·FCC ruling·위성 imagery 신호 | "[Company] just [event]. Here's what [data point] reveals." |
| 토 | `week_ahead` | 다음 주(월~금) Musk Empire 카탈리스트 preview | "Next week, [3 카탈리스트 simultaneously hit]. Here's what satellite data shows is coming." |
| 일 | `weekend_recap` | 지난 한 주 핵심 시그널 3-5개 종합 | "This week, the satellite data told us [single big takeaway]. Wall Street still hasn't priced it in." |

### 1.3 거부 카테고리

- ❌ Musk 얼굴 AI 생성 (저작권 + 닮은꼴 fail)
- ❌ Tesla/SpaceX 로고 직접 표시 (저작권)
- ❌ 정치·선거·Trump 단독 토픽 (Rivet Brief 시대 잔재)
- ❌ K-pop·idol·BTS·BLACKPINK (Hallyu Drop 잔재)
- ❌ 추측·rumor·"could"·"may"·"reportedly" 단독 hook (확정 동사 강제)
- ❌ 1주 초과 stale topic (단, week_ahead 일정 정보·weekend_recap 한 주 정리는 예외)

---

## 2. Production 자동화 흐름

### 2.1 사이클 시간

- **매일 21:55 KST** Windows Task Scheduler `BribbingAutoRecovery` 발동
- 3채널 sequential: 한국 브리삥 → Hallyu Drop → GIGASCOPE
- 총 wall clock: ~120분 (21:55 → 23:55)
- 7일 모두 production (5/23 결정 — 신규 채널 daily cadence 우선)

### 2.2 사이클 내 GIGASCOPE 위치

```
21:55  health_check (3채널 token + 다음날 영상 존재 검증)
22:00-22:30  한국 브리삥 Stage 1+2+3
22:30-23:00  Hallyu Drop Stage 1+2+3
23:00-23:30  GIGASCOPE Stage 1+2+3   ← 본 채널
23:30  mail summary + Plan C 트리거 점검
```

### 2.3 Stage 1 — 토픽 결정 + 스크립트 (~5-10분)

[recovery-stage1-meta-gigascope.md](../../bribbbing-shorts/docs/recovery-stage1-meta-gigascope.md)

흐름:
1. **컨텍스트 로드**: `data/gigascope_used_topics.json`에서 최근 dedup 항목 로드
2. **요일 포맷 결정**: `tgt.weekday()` → daily / week_ahead / weekend_recap
3. **WebSearch 1-3회**: Musk Empire 카테고리 (spacex / tesla / xai / neuralink / boring / starlink / starship / starbase / musk / ipo / earnings / launch / satellite) 안에서 fresh 토픽 탐색
4. **출처 freshness 7일 강제**: 모든 source 발행일 추출 (URL slug or WebFetch 메타 태그), `days_old` 계산, `freshness_ok: bool` 기록. 3개 미확보 시 토픽 폐기
5. **카드 1-6 텍스트 작성**: brand marker `This is GigaScope.` + CTA `gigascope dot ex why zee` + `Save and follow at GigaScope HQ` 강제
6. **Self-check**: card-1 hook이 포맷에 부합 / card-6 CTA 정확 / 거부 카테고리 0 / 출처 3개+ freshness_ok / dedup 키워드 충돌 없음
7. **저장**: `data/stage1_meta_gigascope.json` + `프로젝트폴더/tts_cards.json`

### 2.4 Stage 2 — TTS + 이미지 + 썸네일 (~8-12분)

[recovery-stage2-tts-img-gigascope.md](../../bribbbing-shorts/docs/recovery-stage2-tts-img-gigascope.md)

흐름:
1. **TTS 6장**: `scripts/tts_english.py --engine kokoro --voice af_sarah --speed 1.05`
   - 각 카드 wav → audio/ 저장
   - peak normalize 0.95
   - 총 길이 50초 ±5 검증
2. **이미지 7장 Grok 병렬 생성**: `scripts/grok_gen.py` 7회 병렬 실행
   - card-00~05.png (각 카드 배경, 9:16)
   - thumbnail_bg.png (썸네일 배경)
   - Prompt 룰: 위성·우주·industrial·financial chart·dashboard 톤. 인물·로고 AI 금지
3. **썸네일 합성**: `_make_thumbnail.py` (cyan tag + $데이터 + mega punchword + gigascope.xyz)
   - Self-check 3단계: 주어 명확 / 동작 명확 / 5초 read test
   - 시리즈 #N 라벨 금지
4. **저장**: `data/stage2_assets_gigascope.json` (folder path, durations, image count)

### 2.5 Stage 3 — Remotion 렌더 + 업로드 (~10-15분)

[recovery-stage3-render-upload-gigascope.md](../../bribbbing-shorts/docs/recovery-stage3-render-upload-gigascope.md)

흐름:
1. **Stage 2 결과 로드**: stage2_assets_gigascope.json
2. **data.ts + Card01-06.tsx 작성**: TTS durations 기반 CARD_DURATIONS·LINE_FRAMES·SUBTITLE_LINES
3. **썸네일 + bgm + wav 복사**: 프로젝트 폴더의 audio/·thumbnail.png → remotion/public/
4. **Remotion 렌더**: `npx remotion render src/index.ts FactVideo ../output.mp4` (5-7분)
5. **description.txt + pinned_comment.txt 생성**:
   - Template fill 강제 (자유 작문 금지)
   - `docs/templates/gigascope_description.template.txt` + `gigascope_pin.template.txt`
   - 필드: hook_intro, fact1..5, sources (3개+URL), category_tags
6. **Brand lint**: `py -3.11 scripts/lint_gigascope.py "$PROJECT_FOLDER"`
   - description+pin에 `@gigascopehq` + `gigascope.xyz` 필수
   - Hallyu Drop/Rivet Brief 잔재 키워드 거부
   - `<` `>` placeholder 미채움 거부
   - 통과 시 OK, 실패 시 즉시 abort
7. **업로드 API**:
   - `youtube_upload.py` + `token_gigascope.json`
   - SCHEDULED 시각: 다음날 **21:00 KST** (US 08:00 EDT premarket peak), 7일 모두
   - category 28 (Science & Technology)
8. **썸네일 set**: API `thumbnails.set` (단 채널 phone verification 미완료면 거부됨 → 사용자 수동 업로드 안내)
9. **used_topics append**: `data/gigascope_used_topics.json`에 항목 추가
10. **이메일 알림**: `URGENT GIGASCOPE Stage 3 실패` or `RECOVERED ...`

---

## 3. 파일 시스템 매핑

### 3.1 자동화 코드 (bribbbing-shorts repo)

```
G:/claude/bribbbing-shorts/
├── scripts/
│   ├── auto_recovery.ps1            # 매일 21:55 KST orchestrator
│   ├── health_check.py              # 3채널 token + 다음날 빵꾸 감지
│   ├── tts_english.py               # Kokoro Sarah TTS
│   ├── grok_gen.py                  # Grok 이미지 생성
│   ├── youtube_upload.py            # YouTube Data API upload
│   ├── lint_gigascope.py            # Brand DNA 검증
│   ├── _oauth_gigascope.py          # OAuth 토큰 발급 (1회용)
│   └── auto_pin_scheduler.py        # 핀 댓글 자동 등록 (publish + 5분)
├── docs/
│   ├── recovery-stage1-meta-gigascope.md
│   ├── recovery-stage2-tts-img-gigascope.md
│   ├── recovery-stage3-render-upload-gigascope.md
│   └── templates/
│       ├── gigascope_description.template.txt
│       └── gigascope_pin.template.txt
└── data/
    ├── gigascope_used_topics.json   # dedup history
    ├── stage1_meta_gigascope.json   # 최신 Stage 1 산출물
    ├── stage2_assets_gigascope.json # 최신 Stage 2 산출물
    └── stage_duration_history.jsonl # Plan C 트리거용 누적 통계
```

### 3.2 프로젝트 폴더 (영상별 산출물)

```
G:/claude/쇼츠자료-gigascope/{YYYYMMDD}-{slug}/
├── tts_cards.json
├── audio/card-01~06.wav             # TTS 원본
├── remotion/
│   ├── src/
│   │   ├── data.ts                  # 프레임·자막
│   │   ├── cards/Card01~06.tsx
│   │   └── ...
│   ├── public/
│   │   ├── card-00~05.png           # 카드 배경
│   │   ├── card-01~06.wav           # TTS (복사본)
│   │   ├── bgm.wav                  # Bloomberg 톤 BGM
│   │   └── thumbnail.png
│   └── package.json (node_modules junction)
├── thumbnail.png                    # 최종 썸네일 (썸네일 인트로용)
├── thumbnail_bg.png                 # 합성 전 Grok 원본
├── description.txt                  # 본문 (template fill 결과)
├── pinned_comment.txt               # 핀 댓글 (template fill 결과)
├── upload_run.py                    # 업로드 실행 스크립트
├── upload_result.json               # 결과 (video_id·scheduled·channel)
├── pending_pin.txt                  # 사용자 수동 핀용 텍스트
└── output.mp4                       # 최종 영상
```

### 3.3 인증 + 토큰

```
G:/claude/youtube-uploader/
├── client_secret.json               # Google Cloud OAuth client (공통)
├── token.json                       # 브리삥 토큰
├── token_global.json                # Hallyu Drop 토큰
└── token_gigascope.json             # GIGASCOPE 토큰 (5/23 발급)
```

In-production OAuth 모드 (5/16 전환). 토큰 7일 만료 정책 해제. refresh_token 영구 valid (revoke 발생 전까지).

---

## 4. 검증·Self-check 체계

### 4.1 Brand DNA lint (`lint_gigascope.py`)

description.txt + pinned_comment.txt 둘 다 검증:

- ✅ `@gigascopehq` 핸들 (description+pin 필수)
- ✅ `gigascope.xyz` 도메인 (description 필수)
- ✅ `gigascope` 단어 (positive DNA)
- ❌ Hallyu Drop 잔재: `hallyu drop`, `@hallyudrop60`, `k-pop`, `kpop`, `idol`, `bts`, `blackpink`, `comeback`, `mv`, `ARMY`, `BLINK`
- ❌ Rivet Brief 잔재: `rivet brief`, `@rivetbrief`, `world decoded`
- ❌ 정치 잔재 (Rivet 시대): `senate`, `fed chair`, `nato`, `iran war`, `congress`
- ❌ `<` `>` placeholder 미채움

실패 시 Stage 3 즉시 abort.

### 4.2 Stage별 Verify-StageOutput (`auto_recovery.ps1`)

- **Stage 1**: `stage1_meta_gigascope.json` 존재 + `sources.length >= 3` + 모든 `sources[].freshness_ok == true`
- **Stage 2**: `stage2_assets_gigascope.json` 존재 + folder target match + wavs >= 6 + pngs >= 6
- **Stage 3**: 프로젝트 폴더의 `upload_result.json` 1순위 (video_id 존재) / `upload.log` 2순위 / stage log 3순위

### 4.3 Plan C 트리거

`stage_duration_history.jsonl` 누적 통계 분석:
- `gigascope_stage1/2/3` 중 어느 하나가 8분(480s) 초과 **3일 연속**이면 → email alert "Plan C 권고: prompt 단순화 또는 3a/3b 분리"
- 같은 룰 한국·Hallyu Drop에도 적용 (Hallyu Drop은 5/22에 1회 발동 → stage3 doc 42% 압축 완료)

### 4.4 Token 만료 사전 감지

`health_check.py` 매 사이클 실행 시 3채널 토큰 refresh 시도. 실패 시 email alert + 사용자 OAuth 재인증 안내.

---

## 5. 운영 시각 (KST)

| 시각 | 동작 |
|---|---|
| 21:55 | auto_recovery.ps1 시작, health_check |
| 22:00-23:30 | 3채널 production sequential |
| 23:30-23:55 | mail summary, Plan C 트리거 점검 |
| **다음날 08:00** | Hallyu Drop publish (US 19:00 EDT 전일 prime time) |
| **다음날 12:30** | 브리삥 금요일 publish (KST 점심) |
| **다음날 18:00** | 브리삥 평일·주말 publish (KST 퇴근) |
| **다음날 21:00** | GIGASCOPE publish (US 08:00 EDT premarket peak) |

GIGASCOPE 첫 영상만 5/24 08:00 KST (임시 슬롯). 5/25부터 정규 21:00 KST.

---

## 6. 수동 개입 잔재 (자동화 외)

| 항목 | 이유 | 해결 시점 |
|---|---|---|
| **썸네일 업로드** | 채널 phone verification 미완료 → API 거부 | 사용자가 YouTube Studio 설정 → 휴대전화 인증하면 자동화 가능 |
| **핀 댓글 등록** | publish 후 등록되는 댓글 자동 핀 못 박음 (API 미지원) | 사용자가 Studio에서 ⋮ → 고정. `auto_pin_scheduler`는 댓글 자동 작성까지만 |
| **OAuth 재인증** | refresh_token revoke 발생 시 | 재발생 시 `_oauth_gigascope.py` 1회 실행 |
| **Suno BGM 잔액 모니터** | < 200 credits 시 WARNING | health_check가 알림 (Hallyu Drop만 Suno 사용, GIGASCOPE는 기존 Bloomberg 톤 BGM 차용) |

---

## 7. gigascope.xyz 사이트와의 통합 포인트

### 7.1 영상 → 사이트 traffic 흐름

- 모든 영상 description 첫 줄 또는 footer에 `gigascope.xyz` 링크
- 카드 6 (CTA)에서 음성으로 `gigascope dot ex why zee` 발음
- 썸네일 우측 하단에 `gigascope.xyz` 텍스트
- Pin comment에 `Full dossier at gigascope.xyz · Subscribe @gigascopehq`
- **Methodology 투명성 라인** (5/24 추가): description 마지막 disclaimer 직전에 고정 한 줄:
  ```
  Visualizations rendered for shorts format. Raw Sentinel-2 captures +
  human-traced polygons + methodology at gigascope.xyz/methodology
  ```
  - 효과: 영상의 Grok AI 이미지 vs 사이트의 실제 Sentinel-2 데이터 톤 분리를 시청자에게 명시
  - "AI 이미지로 양산하나" 의심 차단 + 사이트 신뢰도 보호
  - 자동화 pipeline design decision (영상 ↔ 사이트 비주얼 분리)을 cheapest signal로 노출
  - **사이트측 액션 필요**: `/methodology` 페이지 실존 보장. 없으면 깨진 링크 = 신뢰도 역효과

### 7.2 SpaceX IPO 캠페인 (6월 1주차)

`shorts_channel_pivot_plan` 기준:
- Week 1: "SpaceX IPO — what 4 satellite sites tell us" 메인 영상 + Starbase short
- Week 2-4: Hawthorne, Cape Canaveral, Vandenberg, Falcon 9, Starship 컴포넌트 분해
- 사이트 `/spacex-ipo` 랜딩과 1:1 매칭

### 7.3 Calendar 페이지 카탈리스트 → Catalyst Countdown Shorts

- 사이트 `/calendar` T-7일 카탈리스트 cron → 자동 Shorts 생성 트리거
- Stage 1 prompt가 calendar JSON 읽어서 토픽 강제 선정 (구현 미완료, 6월 작업)

### 7.4 Products 페이지 컴포넌트 → Breakdown Shorts

- 사이트 `/products` 25개 제품 × 평균 15파트 = 375개 컴포넌트 = 영상 소재 풀
- 매주 1편 Component Breakdown short (Raptor v3 14파트 등)

### 7.5 위성 Before/After Timelapse

- Sentinel-2 무료 API + ESRI World Imagery → 위성 이미지 자동 fetch
- Compare 페이지 데이터를 영상으로 자동 합성 (구현 미완료, 6월 작업)

---

## 8. 평가 일정

| 날짜 | 체크포인트 |
|---|---|
| 2026-05-25 | 첫 영상 24h 데이터 (`GuGrOpCrEto`) |
| 2026-05-31 | GIGASCOPE 첫 주말 (week_ahead/weekend_recap 포맷 첫 데이터) |
| 2026-06-22 | 30일 데이터 — 자동화 capacity·시간대·포맷 미세조정 결정 |
| 2026-06-30 | monetization 임계 (1k 구독 + 4k시간) 진척률 점검 |

---

## 9. 알려진 한계

- **위성 imagery 자동 fetch 미구현**: 현재는 Grok AI 생성 이미지로 위성 톤만 흉내. 실제 Sentinel-2 합성은 6월 작업
- **Catalyst calendar cron 미구현**: 토픽 선정이 매번 WebSearch에 의존. 사이트 calendar 데이터 안 씀
- **3채널 production 시간 부담**: 120분 sequential. 새벽까지 늘어질 risk 있음. 6월 평가 후 parallel 검토
- **GIGASCOPE 썸네일·핀 댓글 수동**: phone verification 완료 전까지 자동화 X

---

## 10. 변경 이력

| 날짜 | 변경 |
|---|---|
| 2026-05-23 | 채널 생성, 첫 영상 production·예약, OAuth 토큰 발급 |
| 2026-05-23 | 자동화 코드 박음 (auto_recovery·health_check·lint·stage docs·templates) |
| 2026-05-23 | 7일 publish 결정 (초기 5일 안에서 변경) — 토 week_ahead / 일 weekend_recap 포맷 분기 |
| 2026-05-24 | 첫 영상 publish (08:00 KST 임시), 정규 21:00 KST 슬롯은 5/25부터 |
