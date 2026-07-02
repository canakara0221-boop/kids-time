# 우리 아이와 남은 시간 — 앱인토스 미니앱

토스 "앱인토스 바이브코딩 챌린지"(여름 테마) 출품용 미니앱.
표준 웹 계산기를 앱인토스 **web-framework(WebView·React)**로 이식. onnydesign 조합 B(스카이블루/화이트/핑크).

## 로컬 개발
```bash
npm install          # (또는 yarn)
npm run dev          # granite dev → 브라우저/샌드박스 미리보기 (localhost:3000)
npm run build        # granite build → dist 번들
```

## 출시(요약 — 상세는 apps-in-toss 개발자센터)
0. 콘솔 가입: 토스앱 로그인(만 19세+), 워크스페이스+앱 등록 → `granite.config.ts`의 `appName`을 콘솔 앱 이름과 일치
1. 아이콘: 콘솔에 아이콘 업로드 → 그 URL을 `granite.config.ts` `brand.icon`에 교체(현재 PLACEHOLDER)
2. `npm run build` → dist 번들 → 콘솔 업로드 → 토스앱에서 테스트
3. 콘솔 검토 요청(영업일 ≤3일) → 출시
4. 챌린지 출품폼(앱 이름·설명) 제출 (마감 7/29)

## 구조
- `granite.config.ts` — 앱인토스 설정(브랜드·색·권한)
- `rsbuild.config.ts` — rsbuild(React) 빌드
- `src/App.tsx` — 계산기(여름 리프레임: 여름방학 히어로 + 감정 스탯 + 여름 버킷)
- `src/index.css` — 조합 B 스타일

## 사업자등록
불필요(무료 계산기·결제 없음). 콘솔 계정만으로 출시 가능. 인앱결제·광고·정산 붙일 때만 필요.

## 참고
- 앱인토스 개발자센터 developers-apps-in-toss.toss.im
- 템플릿 출처: toss/apps-in-toss-examples (weekly-todo-react)
