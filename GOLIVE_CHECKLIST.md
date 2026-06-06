# GIGASCOPE 결제 Go-Live 체크리스트

> 코드는 전부 끝났다(아래 "완료된 것"). 남은 건 **오너만 할 수 있는 설정**
> (Lemon Squeezy 대시보드 + Vercel 환경변수) — Claude는 LS 대시보드/Vercel env를
> 직접 못 만진다. 이 문서대로 누르면 결제가 안전하게 켜진다.
>
> 핵심: **webhook 설정(1·2)을 끝내기 전에 `LEMONSQUEEZY_CHECKOUT_URL`을 켜지 말 것.**
> webhook 없이 켜면 카드는 긁히는데 시스템이 결제자를 기록 못 한다(이게 원래 블로커였음).

---

## ✅ 코드로 끝난 것 (이번 세션, 전부 배포됨)

- **LS webhook** `/api/webhooks/lemonsqueezy` — 서명검증(HMAC) + 결제자 기록
  (tier=pro, charterMember, subscribers:charter set, 스팟 카운터, 환영메일).
  지금은 `LEMONSQUEEZY_WEBHOOK_SECRET` 미설정이라 503(정상 대기).
- **티어 게이팅** — recap / satellite-drop / catalyst 알림이 결제자(subscribers:charter)
  에게만 발송. 무료 가입자는 안 받음(무료카드 "No recap/alerts" 약속과 일치).
- **정직성** — digest 시간(~7 AM ET, 크론 11:00 UTC), 사이트 수 동적(21), 로드맵 정합,
  charter-terms 환불/유예 문구를 LS MoR 현실에 맞춤.
- **연간 토글** — 월간/연간 토글이 코드에 들어감(`LEMONSQUEEZY_CHECKOUT_URL_ANNUAL`
  설정 시 자동 활성). export는 무료 공개로 재표기.
- **보안** — 공개 subscribe API가 tier=free 강제(가짜 charter 업그레이드 차단).

---

## ☐ 오너가 할 일 (순서대로)

### 1. LS 대시보드 → Settings → Webhooks → + 추가
- **URL**: `https://gigascope.xyz/api/webhooks/lemonsqueezy`
- **Signing secret**: 랜덤 문자열 생성 → 복사(2번에서 씀)
- **Events 체크**: `subscription_created`, `subscription_payment_success`,
  `subscription_updated`, `subscription_cancelled`, `subscription_expired`,
  `subscription_paused` (있으면 `subscription_resumed`도)

### 2. Vercel → gigascope → Settings → Environment Variables (Production)
- `LEMONSQUEEZY_WEBHOOK_SECRET` = (1번에서 만든 secret)
- `LEMONSQUEEZY_CHECKOUT_URL` = `https://gigascope.lemonsqueezy.com/checkout/buy/99c77739-cdab-4652-ad2e-1c83cb531699`
- → 저장 후 **Redeploy** (env는 재배포해야 적용됨)
- ⚠ 순서: 1(webhook+secret)을 먼저, 그 다음 2의 CHECKOUT_URL. 그래야 첫 결제부터 기록됨.

### 3. LS 상품 설정 확인
- 통화 = USD (이미 됨)
- 구독 재시도(dunning) 기간 ≈ 14일 (charter-terms의 "유예 14일" 문구와 일치시키기)
- 결제 후 Redirect/Thank-you URL → `https://gigascope.xyz/pro/success`

### 4. (연간 출시 — Q2=출시 선택했음)
- LS에 상품 생성: **GIGASCOPE Charter (Annual)** $90/year Subscription → Published
- buy-link 복사 → Vercel에 `LEMONSQUEEZY_CHECKOUT_URL_ANNUAL` = (그 링크) → Redeploy
- /pro 체크아웃에 월간/연간 토글이 자동으로 뜬다(코드 이미 됨)

### 5. support@gigascope.xyz 개설
- charter-terms가 "billing 열리는 날 support@gigascope.xyz 가동"이라 명시 → 켜기 전 개설

### 6. 켠 뒤 검증
- `https://gigascope.xyz/pro` 버튼이 "Subscribe — $9 / month"로 바뀜 (연간 env 넣었으면 토글도)
- LS 대시보드 "Send test event" 또는 테스트 결제 → webhook 로그 200 확인
- Redis `subscribers:charter:count` 증가 → /pro 배지 "1 of 100 charter spots claimed"
- 환영 이메일 수신 확인
- 테스트 구독 취소 → charterMember false / charter set에서 제거 확인

---

## 검증 명령 (참고)
```
# 라우트 살아있나 (secret 설정 전 503, 설정 후 서명없으면 401)
curl -s -o /dev/null -w "%{http_code}" -X POST https://gigascope.xyz/api/webhooks/lemonsqueezy -d '{}'
# /pro 게이트 상태
curl -s https://gigascope.xyz/pro | grep -o "Join waitlist\|Subscribe — \$9"
# Vercel 빌드 상태
gh api "repos/sincetwentytwo-sys/gigascope/commits/main/status" --jq '.state'
```

---

## 남은 로드맵(급하지 않음)
- Founding-member 배지 = 실제 auth/account 필요(현재 ◇ "not yet built"로 정직 표기). 별도 작업.
- Account-level alert filters(per-site watchlist) — /roadmap 투표 대상.
- DirtyCash/Cafe24 법정문구 풀세트 — Cafe24 PG 심사 통과 후.
