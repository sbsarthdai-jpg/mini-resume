# Handoff: MINI Motion Designer Resume — 디자인 이력서

## Overview
A long-scroll, single-page **portfolio resume** for a fictional Korean motion-graphic designer named **MINI (김미니)**. The page introduces her, lists her profile data and skills, walks through her four "personality keywords" with sticky-stacking cards (each pairing a story with a portfolio still), answers frequently-asked questions, and closes with a contact form. The tone is bouncy, cute, and confident — a strong red on a warm cream background, with playful apple decorations referencing the visual identity.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working React + Babel + plain CSS prototype that shows the intended look, layout, motion, and behavior. They are **not production code** and should not be shipped as-is.

The task is to **recreate this design in the target codebase's existing environment** (Next.js, Remix, plain React/Vite, etc.) using its established patterns: a real component library (React Server/Client Components, shadcn/ui, Tailwind, CSS Modules — whatever the codebase already uses), a real bundler, and real font loading. If no environment exists yet, **Next.js 14 + Tailwind CSS** is the recommended choice (the prototype uses Tailwind-shaped utility classes implicitly and its typography scale maps cleanly).

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and interactions are all locked in. Reproduce pixel-perfectly. The only "placeholders" are:
- The four 700×700 "portfolio scene" graphics inside the About Me cards. These are CSS-drawn impressions of what a real screenshot of MINI's work *would* look like (a drama title sequence, a kitsch MV, a family-film stillcut, a daily-archive grid). In production, **replace each with the actual portfolio asset** (image, looping video, lottie, etc.).
- The four card-corner monospace labels inside those scenes (`MV / KITSCH ANIMATION`, `TITLE SEQUENCE / DRAMA INTRO`, etc.) are placeholder annotations and should be removed once the real asset is dropped in.

The hero face image (`assets/face.png`) and apple decoration (`assets/apple.png`) are real assets, not placeholders.

## Tech Stack of the Prototype
- React 18.3 + Babel Standalone (runtime JSX compilation — for prototyping only; the production app should use a real build step)
- Plain CSS (no preprocessor) with CSS Custom Properties for design tokens
- Google Fonts: **Lalezar** (display) and **Roboto** (body), plus **JetBrains Mono** for label annotations inside the portfolio scenes
- Single `index.html` entry, loads four script files in order: `tweaks-panel.jsx` → `components.jsx` → `sections.jsx` → `app.jsx`

## Page Structure (top to bottom)

### 0. Topbar
- Three-column flex row, full-width, padding: 32px 64px 0
- Font: **Lalezar 40px, color #BB1616**
- Left: "Motion Graphic"
- Center: "Design Resume"
- Right: date "2025.05.05"

### 1. Hero
- Full-width section, `min-height: 1100px`, `overflow: hidden`
- **Title**: `Hi, I'M MINI!` in Lalezar, color #BB1616
  - Font-size: `clamp(180px, 16.5vw, 312px)` — exactly 312px on 1920+ wide viewports, scales down on smaller screens
  - Single line, no wrap, centered, `letter-spacing: -0.02em`, `line-height: 0.92`
- **Two apple decorations** (image: `assets/apple.png` — a soft red radial glow with a green leaf):
  - Left apple: `left: 3%; top: 300px; width/height: 280px; transform: rotate(-15deg)`
  - Right apple: `right: -6%; top: 140px; width/height: 520px; transform: rotate(20deg) scaleX(-1)` — intentionally clipped at the right edge
- **Hero photo** (`assets/face.png`): a transparent-bg portrait illustration
  - Wrapper: 560×700px, absolutely centered horizontally, top: `clamp(220px, 22vw, 320px)`, z-index: 5
  - Wrapped in a **Magnet** component (see Interactions) for mouse-following effect
  - `filter: drop-shadow(0 30px 50px rgba(51,51,51,0.35))` — this is the only shadow allowed on the entire page
- **CTA button** in bottom-right of the hero, anchored to `#contact`:
  - Red pill, white text, "Contact Me →"
  - `padding: 20px 36px; border-radius: 999px; font-size: 15px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase`

### 2. Profile
- Heading "Profile" — **Lalezar 140px, #111**, centered
- Subtitle "통통 튀고 상큼한 아이디어 생성기" — Roboto 25px, weight 500, #333
- 4-column grid of equal-height cards, gap 22px. Each card:
  - Background #FFFFFF, border 1px solid `rgba(51,51,51,0.12)`, border-radius 28px, padding 32px 28px, **height 560px** (fixed for alignment)
  - Card label (English): Roboto 30px **bold (700)**, #BB1616, no letter-spacing, no uppercase
  - Korean subtitle (h3): Roboto 17px, weight 500, #333
  - Hover: `transform: translateY(-4px)` only — **no shadow**
- **Card content**:
  - **Card 1 "Photo"**: striped photo placeholder ("MINI 프로필 사진 / // 정면 클로즈업") with a small "PORTRAIT" pill at the bottom-left. Replace with real portrait in production.
  - **Card 2 "Basic Info"**: 6 dashed-bottom rows — 이름 / 생년월일 / 거주지 / 이메일 / 인스타 / 취미 (see content list below)
  - **Card 3 "Awards & Career"**: 6 stacked items, each with red Lalezar year on the left and title + grey subtitle on the right
  - **Card 4 "Skills"**: 7 rows. Each row: software name (Roboto 13px, weight 600) + full-width red gauge bar + percentage (Lalezar 16px, #BB1616). Bar background #EEE6D4, fill #BB1616, height 8px, radius 4px.

### 3. Marquee (red infinite-scroll bar)
- Full-width red bar (#BB1616), `padding: 14px 0`, overflow hidden, z-index 4
- Text: Lalezar 22px, color #F8F8F8, separated by 12px white-soft round dots
- Items: `MINI'S ABOUT ME · MOTION GRAPHIC DESIGNER · OPEN FOR PROJECTS · 5 YEARS · 1827 DAYS · MINI · MOTION · SEOUL → WORLD`
- Animation: `transform: translateX(0 → -50%)` over 28s linear infinite. Renders content twice in the track for seamless loop.
- Second instance below About Me uses `reverse` (animation-direction: reverse).

### 4. About Me (sticky stack of 4 cards)
- Heading "About Me" — Lalezar 140px, **#BB1616** (red), centered. **No subtitle.**
- Then 4 sticky cards, each with `position: sticky; top: 90 + index*16 px`
  - As you scroll past, each card scales down (`scale = 1 - progress * 0.03 * remaining`) and fades slightly (`opacity = 1 - progress * 0.15`)
  - This creates the "stacking deck" effect — earlier cards stay visible and shrink behind newer ones
- Each card:
  - Background white, border 1px line, border-radius 32px, padding 56px 64px, margin-bottom 28px
  - Grid: `1fr 700px` columns, gap 60px
  - **Left column** (min-height 700px):
    - Header row: red Lalezar 120px number (01–04) + red Roboto 25px semibold Korean keyword
    - Lead quote: Roboto **30px bold, #333**, surrounded by `"` curly quotes, `white-space: nowrap`
    - Body: Roboto 18px, #444, weight 400, line-height 1.7
    - Hashtag pills at the bottom: first tag is filled red+white, others are bordered + cream bg. `padding: 8px 16px; border-radius: 999px; font-size: 14px; white-space: nowrap`
  - **Right column** (700×700 fixed): placeholder portfolio scene (replace with real asset)

The four cards and their content are the heart of the page — see "Content" section below.

### 5. Marquee (reverse) — same as Marquee above but `reverse`

### 6. QnA
- Heading "QnA" — Lalezar 140px, #111, centered. **No subtitle.**
- Vertical list of 6 accordion items, max-width 1100px, gap 16px
- Each item:
  - Background white, **border: 5px solid rgba(51,51,51,0.12)**, border-radius 24px
  - Open state: border becomes #BB1616 (no shadow)
  - Header (button): grid `64px / 1fr / auto`, padding 28px 36px
    - Q mark: Lalezar 52px, #BB1616
    - Question text: Roboto **22px semibold (600)**, #111
    - Plus icon: 48×48px circle, bg #F6F2EA, contains an **SVG plus** (two crossed lines). On open, circle becomes red + white, and the SVG rotates 45° to become an X (do NOT use a Unicode `＋` or `×` — it must be the rotating SVG so the icon stays centered)
  - Body: CSS grid-rows transition `0fr → 1fr` over 400ms ease
    - Inner: 64px / 1fr columns, padding 0 36px 32px
    - A mark: Lalezar 46px, #111
    - Answer text: Roboto **18px medium (500)**, #333

### 7. Contact
- Full-bleed red section (#BB1616), padding 140px 64px 80px, centered text
- Heading "Contact Me" — Lalezar 140px, color #F8F8F8 (white-soft)
- **No subtitle, no info chips** — straight from heading to the input
- Pill-shaped form input, white bg, max-width 720px, padding 10px 10px 10px 32px, border-radius 999px:
  - Input: type="text" (not email), Roboto 18px, color #333
  - Placeholder: `"부족한점, 칭찬, 면접제의 어떤 내용이든 남겨주세요"`
  - Send button: 56×56 black circle on the right, white paper-plane SVG icon
- On submit:
  - 700ms `sending` state — paper plane translates +70px X, –70px Y, rotates –25°
  - Then `sent` state — a "메일이 도착했어요! 곧 답장드릴게요 ✦" overlay scales 0.6 → 1 inside the pill
  - After 3.2s total, reset to idle
- Social row: 4 pill links (Instagram / Behance / Vimeo / mini@studio.com) — Roboto 14px, weight 600, letter-spacing 0.18em, uppercase, on translucent white bg
- Footer: copyright left, "Made with ♥ in Seoul" right — Roboto 13px

## Content (exact copy to ship)

### Basic Info card (Profile)
| key | value |
|---|---|
| 이름 | 김미니 (MINI) |
| 생년월일 | 1998.07.22 |
| 거주지 | 서울 마포구 |
| 이메일 | mini@studio.com |
| 인스타 | @mini.motion |
| 취미 | 필름카메라, 베이킹 |

### Awards & Career card (3 awards + 3 career rows)
- 2024 — K-DESIGN AWARD — 본상 · Motion Identity 부문
- 2023 — 서울 모션 페스티벌 — 우수상 · Title Sequence
- 2022 — 한국디자인진흥원 — 올해의 신진디자이너 선정
- 2019 — (주)뉴타입스튜디오 — 주니어 모션디자이너 — 브랜드 영상
- 2021 — tvN 콘텐츠본부 — 드라마 타이틀 시퀀스 / 예능 그래픽
- 2024 — FREELANCE — 광고·드라마·영화 자유 작업

### Skills card
After Effects 96 · Cinema 4D 82 · Photoshop 94 · Illustrator 90 · Premiere Pro 80 · Blender 62 · Figma 86

### About Me cards
**01 단단함** — `"마감 앞에서 흔들리지 않아요."`
> 5년간 한 번도 마감을 놓친 적이 없어요. 풀리지 않는 컷이 생기면 새벽 두 시까지 붙들고 있는 편입니다. 일단 시작하면 끝까지 끌고 가는 사람이고, 중간에 흔들려도 결과물만큼은 약속한 자리로 가져다 놓습니다.
Tags: `#마감장인` (red) · `#끝까지` · `#책임감`
Right scene: Drama title-sequence (`불 켜진 방` / TVN drama intro)

**02 빠른 아이디어** — `"노션엔 이미 60장의 레퍼런스."`
> 클라이언트가 "이건 좀 다른 방향이…" 라고 운을 떼면, 다음 카드는 이미 준비되어 있습니다. 빠르게, 많이, 그리고 다르게. 컨셉을 정하기 전 단계에서 가장 많이 움직이는 사람이 되려고 해요.
Tags: `#빠른손` (red) · `#아이디어부자` · `#레퍼런스장인`
Right scene: Kitsch MV (POP! BANG★ graphics)

**03 친화력 & 밝음** — `"현장에서 가장 먼저 말 걸어요."`
> 영화 <우리들의 여름> 작업 때 촬영 감독님이 "쟤는 어디서나 살아남는다" 고 하셨어요. 처음 보는 클라이언트와도 30분이면 농담을 주고받는 편입니다. 분위기를 띄우는 게 일의 일부라고 생각해요.
Tags: `#밝음` (red) · `#친화력` · `#팀워크`
Right scene: Family film stillcut (`우리들의 여름`, sun + green hills + silhouettes)

**04 꾸준함** — `"매일 1컷씩 5년째 만들어요."`
> 인스타그램에 매일 1컷의 모션 작업을 올린 지 1,827일째. 일이 끝나도 손이 멈추지 않습니다. 재능보다 시간을 믿어요. 작은 컷이 쌓여서 나만의 리듬이 되고, 그 리듬이 결국 스타일이 된다고 생각해요.
Tags: `#1827days` (red) · `#매일1컷` · `#복리의힘`
Right scene: 5×5 daily archive grid

### QnA (6 items)
1. **Q.** 어떤 작업을 가장 좋아하나요? **A.** 처음 시작할 때 아무것도 정해지지 않은 프로젝트요. 빈 페이지에서 컨셉을 잡고, 컬러팔레트를 정하고, 첫 키프레임을 끊는 순간이 가장 짜릿해요. "이게 진짜 되네?" 하는 그 1초가 좋습니다.
2. **Q.** 가장 기억에 남는 프로젝트는? **A.** tvN 드라마 <불 켜진 방> 오프닝 시퀀스. 4주 동안 30버전을 만들었는데, 결국 채택된 건 제일 처음 그렸던 스케치와 거의 똑같았어요. 가끔은 첫 번째 직감이 맞을 때가 많더라고요.
3. **Q.** 작업할 때 가장 중요하게 생각하는 것은? **A.** "이게 왜 움직여야 하는가." 모션을 위한 모션은 만들지 않으려고 해요. 정지 화면일 때보다 의미가 더 분명해질 때, 그때서야 좋은 모션이라고 생각합니다.
4. **Q.** 함께 일하기 좋은 클라이언트 유형은? **A.** "그냥 멋있게 해주세요" 보다는 "이 부분이 답답해서 이렇게 풀어보고 싶어요" 라고 말해주는 분. 고민의 결을 같이 나눌 수 있을 때 결과물도 가장 좋게 나옵니다.
5. **Q.** 5년 뒤 어떤 디자이너가 되어 있을까요? **A.** 잘 모르겠어요. 다만 지금처럼 매일 1컷씩은 만들고 있을 거예요. 그 한 컷의 깊이가 지금과는 달라져 있길 바랄 뿐입니다.
6. **Q.** 취미는 무엇인가요? **A.** 필름카메라로 찍는 일요일 산책, 그리고 새벽에 베이킹. 손으로 무언가를 굽거나 인화할 때 머릿속이 가장 잘 정리돼요. 다음 작업에 쓰이는 컬러는 거의 그때 떠오릅니다.

## Interactions & Behavior

### Magnet (hero portrait)
- Tracks `mousemove` globally
- When cursor distance from element center < `(max(rect.w, rect.h)/2 + padding=140)`, translates the inner wrapper by `(dx/strength=3, dy/strength=3)`
- Transition in: `transform 0.3s ease-out`. Transition out (when cursor leaves the magnet zone): `transform 0.6s cubic-bezier(.2,.7,.3,1)` back to 0,0.

### FadeIn
- Each section/element wrapped in `<FadeIn delay={ms} y={px} duration={ms}>` plays a Web Animations API keyframe (opacity 0 → 1, transform translate(x,y) → 0) when it enters the viewport (top < vh - 40).
- 1.5× duration safety timer force-finishes the animation in case the browser throttles it (e.g. background tab) — important so content never stays hidden.
- Easing: `cubic-bezier(.25,.1,.25,1)`.

### Sticky stack (About Me)
- Each `<StickyCard index total offsetTop gap>` is `position: sticky; top: offsetTop + index*16`.
- A scroll listener computes `progress = clamp((offsetTop - rect.top) / cardHeight, 0, 1)` and applies `transform: scale(1 - progress*(1-targetScale))` where `targetScale = 1 - (total-1-index) * 0.03`. Also fades opacity to 0.85.

### QnA accordion
- One open at a time (`useState(openIndex)`, clicking the same item closes it).
- Body animates via CSS `grid-template-rows: 0fr → 1fr` over 400ms ease.
- Plus icon is an SVG `<line>×2` cross that gets `transform: rotate(45deg)` on open — this guarantees centering inside the 48px circle (a Unicode glyph drifts).

### Contact submit flow
- Empty input → submit is blocked by HTML `required`.
- Non-empty submit: `setState('sending')` → 700ms later `setState('sent')` → 3.2s later `setState('idle')` and clear the value.
- During `sending`, the paper-plane SVG translates +70px / –70px and rotates –25°.
- During `sent`, the success overlay (`opacity 0 → 1, scale 0.6 → 1`) covers the pill.

### Marquee
- Pure CSS animation (`translateX(0) → translateX(-50%)`, 28s linear infinite). Track contains two copies of the row for a seamless loop.

## State Management

No backend, no routing. All state is component-local:
- `Hero` — none (purely presentational)
- `ProfileSection` — none
- `AboutSection` — none (each `StickyCard` reads `scrollY` via its own listener)
- `QnASection` — `openIndex: number` (default 0)
- `ContactSection` — `email: string`, `state: 'idle' | 'sending' | 'sent'`
- `App` — `t: TweakValues` (see Tweaks below)

In production, the contact form should `POST` to a real endpoint (Resend, Plunk, mailto fallback, …). The send/success animation should be driven by the request's promise, not a hardcoded timeout.

## Design Tokens

### Colors
| token | hex | use |
|---|---|---|
| `--red` | `#BB1616` | Primary — hero title, section titles (About / Contact), marquee bg, contact bg, button bg, first-tag bg, skill-bar fill, profile card labels |
| `--red-deep` | `#8E0F10` | Reserved (formerly a button-shadow color) |
| `--bg` | `#F6F2EA` | Page background — warm cream |
| `--paper` | `#FFFFFF` | Cards |
| `--ink` | `#333333` | Body text |
| `--ink-soft` | `#8B8378` | Muted labels |
| `--black` | `#111111` | Section titles for Profile / QnA |
| `--white-soft` | `#F8F8F8` | Text on red bg (marquee, Contact heading) |
| `--line` | `rgba(51,51,51,0.12)` | Borders, dividers |

About Me cards specifically use `#333` (lead) and `#444` (body) — slightly different from the global `--ink` for hierarchy.

### Typography
- **Display**: `Lalezar` (single 400 weight)
- **Body**: `Roboto` (weights 400, 500, 600, 700)
- **Monospace** (label annotations inside scene placeholders): `JetBrains Mono` (400, 500)

| size | use |
|---|---|
| 312px | Hero title (Lalezar) — actual computed value is `clamp(180px, 16.5vw, 312px)` |
| 140px | Section titles (Lalezar) |
| 120px | About Me numerals (Lalezar) |
| 52px / 46px | Q. / A. marks in QnA (Lalezar) |
| 40px | Topbar (Lalezar) |
| 30px | About Me lead (Roboto bold), Profile card label (Roboto bold) |
| 25px | Profile subtitle (Roboto 500), About Me Korean keyword (Roboto 600) |
| 22px | QnA question (Roboto 600), Marquee text (Lalezar) |
| 18px | Contact input, About Me body, QnA answer |
| 17px | Profile card h3 |
| 15px | Hero CTA button |
| 14px | About Me hashtag pills, Social links, Skill row |
| 13px / 12px / 11px | Misc labels and monospace annotations |

Default body font-size: 18px, line-height 1.5. Bold weight is 700; semibold is 600; medium is 500.

### Spacing & shape
- Page padding (main sections): `64px` horizontal, `120px` vertical
- Card border-radius: `28px` (profile), `32px` (about me), `24px` (qna), `999px` (pills)
- Default gap: `22px` (profile grid), `60px` (about-me grid), `16px` (qna list)
- Standard border: `1px solid rgba(51,51,51,0.12)` — except QnA which uses **5px**

### Shadows
**None on the page except** the hero portrait, which uses `filter: drop-shadow(0 30px 50px rgba(51,51,51,0.35))`. A global rule (`*, *::before, *::after { box-shadow: none; }`) enforces this.

## Assets
- `assets/face.png` — MINI portrait illustration. Transparent PNG, 1024×1536, ~2.8 MB. **Ship as-is, or replace with a real photo.** Optimize to AVIF/WebP for production.
- `assets/apple.png` — Apple decoration (red radial glow + green leaf). Transparent PNG, 752×741, ~480 KB. Used twice in the hero at different sizes and rotations.

Plus four CSS-drawn "portfolio scene" placeholders inside `styles.css` (`.scene.mv`, `.scene.drama`, `.scene.family`, `.scene.archive`) — these are intentional placeholders. Replace with real renders / videos / lotties in production. Each is a 700×700 square with a `border-radius: 24px`. The bottom-left monospace label inside each scene should be removed when the real asset goes in.

## Tweaks (developer-facing only)
The prototype exposes a small Tweaks panel via `tweaks-panel.jsx` for in-prototype text/color toggling — **this is a prototyping aid, not a feature**. The production app does not need it. The persisted values to migrate into the static copy are:
```
displayName: "MINI"
fullName: "김미니 (MINI)"
role: "Motion Graphic Designer"
tagline: "통통 튀는 모션과 5년의 손맛으로 이야기를 움직이게 합니다."   ← currently unused on the page; ignore
primary: "#BB1616"
```

## Responsive Behavior
Designed for **desktop full-browser only** (≥1280px). The hero title uses `clamp()` so it stays on one line down to ~1280px; below that, it will wrap and the apples may overlap awkwardly. A mobile pass is **out of scope** for this handoff — flag it for a follow-up if needed.

## Files in this Bundle
- `index.html` — entry point, loads fonts and the four scripts in order
- `styles.css` — all visual styles, design tokens, and animation keyframes
- `app.jsx` — top-level `AppWrapper` composing all sections, plus the Tweaks panel
- `sections.jsx` — `Hero`, `ProfileSection`, `AboutSection`, `QnASection`, `ContactSection`, plus the four `Scene*` placeholder components
- `components.jsx` — reusable primitives: `Magnet`, `FadeIn`, `ScrollFadeText`, `StickyCard`, `Marquee`, `ImgPh`, `Apple`
- `tweaks-panel.jsx` — prototyping-only tweak panel; not needed in production
- `assets/face.png`, `assets/apple.png` — the two real image assets

To run the prototype as a sanity check: open `index.html` in a browser with a local file server (e.g. `npx serve .`). Babel compiles the JSX in-browser.
