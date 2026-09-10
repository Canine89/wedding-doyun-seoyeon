# 도윤과 서연의 모바일 청첩장

배포: https://wedding-doyun-seoyeon.vercel.app

관리: https://supabase.com/dashboard/project/lsniqnycfhlcslhxeyhb/editor (`rsvps` 표)

외부 라이브러리 없이 HTML, CSS, JavaScript로 만든 모바일 청첩장입니다. 사진·갤러리 확대·계좌 복사·참석 회신·방명록을 지원합니다. 현재 정보는 모두 가상 예시입니다.

## 정보 수정

1. `info.md`의 JSON 코드 블록 값을 수정합니다. 날짜는 한국 시간 `+09:00`을 유지하세요.
2. `images/`의 사진을 변경하고 `photos` 경로와 설명을 수정합니다. 첫 사진이 메인 사진입니다. 웹용 사진은 한글 파일명 정규화 차이를 피하기 위해 `images/photo-01.jpg` 같은 영문 경로를 사용합니다. 원본 PNG는 그대로 보관했습니다.
3. `npm run build` 후 배포합니다. HTML 본문과 공유 메타데이터가 함께 갱신됩니다. `info.md`만 수정하고 빌드하지 않으면 배포 내용은 바뀌지 않습니다.
4. 메인 사진을 바꾸면 `images/share-thumbnail.png`도 1122×1122 정사각형 크롭으로 교체하세요. 현재 썸네일은 첫 원본 사진의 상단 1122×1122 영역으로 두 사람의 얼굴을 보존했습니다.

## 실행

Node.js 22 이상. 설치할 외부 패키지는 없습니다.

```sh
npm run build
python3 -m http.server 4500 --directory dist
```

http://localhost:4500 에서 화면을 확인합니다. `index.html`은 빌드 원본이므로 직접 열지 말고 빌드 결과를 사용하세요. 회신·방명록 API는 Vercel 배포 환경에서 동작합니다.

## Vercel 환경 변수

- `SUPABASE_URL`: 새 청첩장 프로젝트의 URL
- `SUPABASE_SECRET_KEY`: 서버 전용 service_role 키
- `VISITOR_SECRET`: 32자 이상의 무작위 쿠키 서명 비밀값
- `SITE_URL`: 실제 대표 HTTPS 주소. 생략하면 Vercel의 `VERCEL_PROJECT_PRODUCTION_URL`을 사용합니다.

실제 값은 Vercel Production의 환경 변수에만 설정합니다. 키를 GitHub나 브라우저 코드에 넣지 마세요. `.env*`, `.vercel`, 빌드 산출물 `dist`는 Git에서 제외합니다. 공개 저장소에는 가상 계좌만 포함되어 있습니다. 실제 정보로 변경할 때 공개 범위를 고려하세요.

## 데이터와 중복 방지

`supabase/migrations/202609100001_wedding.sql`:
- `rsvps`: 성함, 참석 인원(본인 포함 1–10명), 식사 여부. 공개 조회 불가.
- `guestbook`: 성함, 한 줄 메시지(100자). API는 최근 20개의 이름·메시지·작성일만 반환.
- 두 표에 RLS를 적용하고 익명·인증 사용자 직접 접근 권한을 제거했습니다. 서버 전용 키를 사용하는 API만 접근합니다.
- 서명된 HttpOnly 쿠키에서 만든 방문자 식별값을 각 표에서 UNIQUE로 제한합니다. 같은 브라우저는 표마다 한 번 제출 가능합니다. 회원가입·실명 인증을 하지 않으므로 쿠키 삭제, 시크릿 창, 다른 기기는 동일인으로 구분할 수 없습니다.
- 서버 입력 검사, 제출 중 버튼 잠금, 재시도 상태, 오류 안내를 제공합니다. 방명록 출력은 `textContent`를 사용합니다.
- 관리자는 Supabase Table Editor에서 회신을 확인하고 방명록을 삭제할 수 있습니다.

## 공유 미리보기

빌드 시 정적 HTML에 OG/Twitter 제목, 날짜·장소 설명, 정사각형 사진의 절대 URL, canonical을 생성합니다. 카카오톡·문자의 실제 표시 형태와 갱신 시점은 앱의 캐시에 따라 다릅니다. 사진을 바꾼 후 캐시가 남으면 카카오 개발자 공유 디버거에서 캐시를 갱신하세요. 샘플 청첩장이 검색 결과에 노출되지 않도록 `noindex`를 설정했습니다.

## 적용 스킬

요청한 스킬을 프로젝트 `skills/`에 설치하고 원문을 보존했습니다.
- [tasteskill](skills/tasteskill/SKILL.md): https://github.com/leonxlnx/taste-skill 의 `skills/taste-skill`
- [scrollcraft](skills/scrollcraft/SKILL.md): https://github.com/nateherkai/scroll-craft 의 `plugins/nateherk-design/skills/scroll-craft`

명조, 한 가지 포인트 색, 섹션별 여백 리듬에 더해 메인 사진의 스크롤 거리 변화, 가운데로 모이는 이름, 편지 등장, 날짜 밑줄, 한 장씩 포개지는 인화사진 앨범을 적용했습니다. 모션 줄이기 설정에서는 움직임과 고정을 해제합니다. 사용자 요청에 따라 스킬에서 제안하는 외부 애니메이션 엔진은 사용하지 않았습니다. 디자인 기록은 `scrollcraft/builds/wedding/BRIEF.md`에 있습니다.

## 확인

```sh
npm test
```

입력 검증, 회신 조회 차단, 방문자 쿠키 재사용·변조 방지를 검사합니다. 원격 DB의 RLS/중복 제한과 배포 후 API는 별도로 검증합니다.
