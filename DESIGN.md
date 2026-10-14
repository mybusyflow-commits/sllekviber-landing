---
name: SleekViber
description: A cinematic typographic instrument in black, paper, charcoal and vermilion.
colors:
  black: "#0d0d0d"
  black-ink: "#f3f1ec"
  black-muted: "#b6b3ae"
  black-accent: "#ef715b"
  black-surface: "#242424"
  paper: "#f0eee9"
  paper-ink: "#171717"
  paper-muted: "#5b5853"
  paper-accent: "#a82d19"
  paper-surface: "#dedbd4"
  vermilion: "#e75036"
  chapter-paper: "#e5e2db"
  charcoal: "#232323"
  visual-paper: "#deddd8"
  almost: "#8c8984"
  option-hover: "#dfdcd5"
  option-surface: "#e7e3dc"
  disabled-surface: "#d8d2c8"
  disabled-ink: "#5f564a"
typography:
  display:
    fontFamily: "Clash Display, sans-serif"
    fontSize: "clamp(88px, 11.2vw, 172px)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Clash Display, sans-serif"
    fontSize: "clamp(50px, 5.5vw, 85px)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Clash Display, sans-serif"
    fontSize: "clamp(22px, 2.1vw, 32px)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "General Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "General Sans, sans-serif"
    fontSize: "12px"
  action:
    fontFamily: "General Sans, sans-serif"
    fontSize: "14px"
    lineHeight: 1.4
rounded:
  chapter: "16px"
  concept: "14px"
  section: "22px"
  option: "8px"
  role: "24px"
  role-group: "28px"
  pill: "9999px"
  circle: "50%"
  hero-action: "34px"
spacing:
  gutter: "clamp(24px, 4.5vw, 80px)"
  chapter-copy: "clamp(34px, 4.5vw, 72px)"
  section-block: "110px"
  mobile-section-block: "75px"
  study-inline: "30px"
  option-block: "15px"
  option-inline: "16px"
components:
  hero-action:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.hero-action}"
    height: "58px"
    padding: "6px 9px 6px 24px"
  hero-action-hover:
    backgroundColor: "{colors.black-accent}"
    textColor: "{colors.paper-ink}"
  navigation-action:
    textColor: "{colors.black-ink}"
    height: "44px"
  survey-option:
    rounded: "{rounded.option}"
    padding: "15px 16px"
    height: "61px"
  survey-option-hover:
    backgroundColor: "{colors.option-hover}"
    textColor: "{colors.paper-ink}"
  survey-option-selected:
    backgroundColor: "{colors.paper-ink}"
    textColor: "{colors.paper}"
  survey-submit:
    backgroundColor: "{colors.paper-ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    height: "56px"
    padding: "0 24px"
  survey-submit-hover:
    backgroundColor: "{colors.paper-accent}"
  survey-submit-disabled:
    backgroundColor: "{colors.disabled-surface}"
    textColor: "{colors.disabled-ink}"
  role-selected:
    backgroundColor: "#17120f"
    textColor: "{colors.paper}"
    rounded: "{rounded.role}"
    padding: "0 20px"
    height: "44px"
  topic-chip:
    rounded: "{rounded.role}"
    padding: "9px 12px"
  chapter:
    backgroundColor: "{colors.chapter-paper}"
    textColor: "#151515"
    rounded: "{rounded.chapter}"
  standards-visual:
    backgroundColor: "{colors.visual-paper}"
    rounded: "{rounded.chapter}"
    width: "100%"
  hero-atmosphere-still:
    backgroundColor: "{colors.black}"
  hero-motion:
    textColor: "{colors.paper}"
    rounded: "{rounded.circle}"
    width: "44px"
    height: "44px"
  hero-motion-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.paper-ink}"
  results-disclosure:
    textColor: "{colors.paper-ink}"
    height: "75px"
---

# Design System: SleekViber

## Overview

**Creative North Star: "The Typographic Instrument"**

The accepted public identity combines a black stage, oversized editorial type and dimensional website concepts. Paper, charcoal and vermilion scenes create deliberate changes in scale and pace. A continuous procedural color field surrounds the hero's centered message; repeated prints become an individual composition, routes join and permissions change in the existing chapters. This is a coming-soon experience for a platform under development.

Motion belongs to that subject and the reading journey. The user explicitly accepted this frontend, typography and immersive direction, then selected an immersive visual background with simpler product messaging for the hero. Preserve its expressive scale while giving meaningful controls and copy room to breathe. This replaces the rejected ash/green world; the implementation, `.impeccable/review/direction-v2.md`, the scoped refinement contract in `.impeccable/refinement-2026-10-13/direction.md` and the local hero contract in `.impeccable/hero-background-2026-10-14/direction.md` are the authority. The private admin is outside this public visual system.

**Key Characteristics:**
- Black, warm paper and charcoal fields, with one vermilion accent family.
- Locally hosted Clash Display headlines and General Sans reading text.
- A continuous immersive hero field with stable reading zones and a readable still fallback, full-scene chapters and six contextual standards panels.
- Purposeful motion with native touch scrolling and a static reduced-motion path.
- Visible coming-soon truth, a calm questionnaire with aggregate results and an optional email waitlist.

## Colors

Frontmatter owns the palette. Public semantic variables are scoped by the experience and its light sections in `app/globals.css`; the root fallback palette is not the public landing theme.

### Primary
- **Vermilion:** The brand dot, interaction marks and full trust chapter use the vivid accent. The lighter black accent supports readable links and connected routes on dark ground; the deeper paper accent supports concept emphasis, active standards, result bars and submit hover on light ground.

### Neutral
- **Stage black:** The hero, reveal and close establish a continuous dark setting. Black ink and muted copy carry reading hierarchy; black surface is its semantic tonal layer.
- **Warm paper:** Standards and questionnaire use paper, paper ink, muted copy and surface. Chapter paper is a slightly deeper full-scene field; visual paper contains the contextual standards panels.
- **Charcoal:** The middle chapter separates the connection study from the surrounding scenes.
- **Almost:** Subdued display text carries the fitted reveal signature; both hero words use warm white ink.
- **Form states:** Option surface, hover and disabled colors distinguish neutral choices, interaction and unavailable submission. Selected choices invert to paper ink with a visible vermilion checkmark.

**The Section Contrast Rule.** Resolve ink, muted, accent and surface within the current section. Vivid vermilion backgrounds use dark reading text; the permission study also uses a dark focus outline.

## Typography

**Display Font:** Clash Display variable, locally hosted at weights 200–700 and generally used at medium weight. **Body Font:** General Sans, locally hosted at regular, medium and semibold weights. No separate public serif or mono voice is active.

The display voice is expansive and tightly tracked; reading text remains modest, open and short. Frontmatter captures desktop role samples rather than assigning one size to every heading. Hero description is capped at 49ch on desktop, 42ch below 900px and 31ch below 600px; its development status uses a deliberate two-line break. Chapter copy is capped at 34ch and standard explanations at 38ch. Labels use sentence case. Main expressive headings add `word-spacing: .07em` so large words remain distinct.

- **Display:** The centered hero keeps “Beyond almost.” on one line when space permits and stacks the two words below 600px, with both in warm white ink. Below 900px it uses `clamp(80px, 11.6vw, 108px)`; below 600px it uses `clamp(69px, 15.6vw, 91px)` with .99 leading. Desktops at least 900px wide and at most 760px high use `clamp(88px, 10.5vw, 154px)`.
- **Headline:** Chapter titles have a short measure; the standards introduction reaches `clamp(60px, 7vw, 105px)` and reveal type `clamp(65px, 9.5vw, 145px)`.
- **Title:** Standards use compact, medium-weight display text, preserving a clear hierarchy beside the changing visual.
- **Body:** Paragraphs vary from 14px to 16px by context. Hero description uses `clamp(17px, 1.45vw, 21px)` with 1.65 leading, then 16px with 1.7 leading below 600px, where its explicit line break is removed. Development copy uses 12px with 1.7 leading, then 11px below 600px. Controls and questionnaire legends use General Sans; desktop legends are 22px with 1.3 leading.
- **Label:** Navigation, diagram legends and controls occupy the quieter 10–12px range. Their touch targets are larger than their text.

**The Display and Reading Rule.** Use Clash Display for expressive headings and General Sans for explanations, labels and actions. Decorative brand scale must not replace the semantic heading or action label.

## Layout

The public gutter is fluid. At 1600px it becomes `max(80px, calc((100vw - 1500px)/2))`. The hero is a full-height flex column with a normal-flow header, a centered message stage and a footer. The background fills the whole section behind them. Desktop stage height is at least 500px with 70px top and 110px bottom padding; at least 900px wide and at most 760px high, it tightens to 390px with 42px top and 70px bottom padding. Below 900px the stage uses a 530px minimum and 70px/100px vertical padding. Below 600px it uses a 435px minimum and 48px/88px padding; the header is 82px high, the title stacks, and the footer wraps into development copy followed by its link and motion control. The section can exceed one viewport on short screens, preserving the primary action and all footer content in document flow.

The three chapters pair copy and artwork in two columns. Desktop scenes are at least 640px tall and use sticky ScrollStack choreography; at widths below 1000px the stack becomes normal document flow. Below 768px chapters use one column, 16px outer gutters and 430px artwork panels. The mobile permission study reserves 74px for its footer and keeps its Visitor/Member switch above it.

Standards use one full-width contextual panel alongside six accordion rows. At mobile sizes the visual and rows stack; the visual remains 100% wide with a 480px cap and a 1.15 aspect ratio. Each panel reserves space for its concept caption. The questionnaire uses a twelve-column desktop grid at Tailwind's 1024px breakpoint, with its five-column introduction sticky 64px from the top and the form beginning in column seven. Pain choices collapse from two columns to one on mobile. Aggregate results expand below the form in normal document flow. About copy and waitlist also become single columns.

Lenis is the only public smooth-scroll owner, enabled for a fine pointer without reduced motion, using GSAP's ticker and interpolation of .14. Anchor navigation uses a .95-second duration with quartic ease-out; touch scrolling is native. Reduced motion removes scroll choreography, split reveals, hero word entrance, background animation and pointer responses, preserving content and semantic controls. Terrain drawing, stack updates and the hero background are gated by visibility; the gallery pauses when covered or when the alternate print is displayed. These safeguards are part of the implemented motion grammar, not a guarantee of a universal frame rate.

## Elevation & Depth

Broad tonal fields carry the composition. The hero's procedural bands create depth across one full-screen plane; overlapped chapters and sparse Canvas 2D terrain continue the page's dimensional grammar. A feathered global overlay and stable local dark scrims behind the message and footer preserve the reading hierarchy through bright shader phases. The hero action's hover adds a diffuse shadow (`0 8px 24px -12px #0008`); chapter overlap uses a restrained top shadow (`0 -18px 50px -20px #0008`); the mobile navigation uses a structural dropdown shadow (`0 18px 30px -10px #0008`). Standard accordion rows, result bars and form content remain flat. Glare is confined to the contextual standards panel and existing chapter subjects.

**The Purposeful Line Rule.** Keep strokes that express magnetic material, routes, permissions or terrain, and boundaries that clarify controls. Do not restore decorative connector or divider lines removed during the accepted direction's refinement.

## Shapes

Full chapter scenes and the contextual standards visual have gently rounded corners; the inner standards panel uses 10px corners. The hero's field is continuous and full bleed. Its survey action is a stationary paper pill; a thin outlined circular motion button sits with the footer link. Light section transitions use a broader radius; mobile chapter and section radii tighten to 14px and 16px. Survey choices use modest rounded rectangles; submit uses a pill. Permission controls nest rounded buttons in a thin outlined group. First-question markers are circles; pain-point markers are small rounded squares.

Signature subjects consist of the immersive color field, elliptical print orbits, a three-node route, permission rings and projected wire terrain. Use native SVG arrows and status icons. The hero mounts WebGL for its decorative shader surface, with a readable CSS still fallback and semantic HTML message. Other public subjects continue to use DOM, SVG and Canvas 2D.

## Components

### Actions and navigation

The hero survey link is a stationary paper pill with a single-line label, dark ink and an inline diagonal SVG arrow. Its minimum height is 58px; the arrow occupies a 42px area and uses a 22px glyph. Hover turns the whole pill light vermilion without moving or rotating the action; the label remains 14px across hero widths. The header action is a text link with a bottom rule and an inline arrow, with a 44px minimum hit area. The header scrolls away; mobile adds an explicitly labeled menu button, and Escape closes its navigation.

Focus is a vermilion outline (2px, offset 5px), overridden with dark ink on the vermilion chapter. A focus-revealed skip link leads to the questionnaire. Keyboard focus lifts the active stacked scene above later scenes and removes its dimming.

### Immersive hero background

The hero adapts Aceternity's free Hero Section One composition and word entrance using the installed Motion library, the incumbent type, simpler product copy, existing navigation and stationary survey action. Each word resolves from a 5px blur and 14px offset over .9 seconds, staggered by .14 seconds; reduced motion keeps both words in their final state. React Bits ColorBends' original shaders provide a slow continuous field in the established vermilion family. Source credits and the React Bits license remain in `public/credits`; this hero ships no raster background or mounted physical model.

The decorative field sits outside the semantic message and has no pointer hit area. A single full-screen plane, a low-power renderer without antialiasing, a 30fps drawing cap, a DPR cap of 1.25 and a 1.4-million-pixel resolution budget bound rendering. Unpressed mouse movement within the hero influences the field gradually; pressed pointers and touch do not. Animation stops offscreen, when the document is hidden, with explicit pause and under reduced motion. Reduced motion retains a static shader frame when available. A 44px circular button exposes play/pause labels and a pressed state, and disables while loading, under reduced motion or when motion is unavailable.

A CSS color-field still is always beneath the dynamically loaded visual. Renderer creation failure, shader link failure and context loss select that still; a hero-local error boundary isolates visual-module and render failure so the message, survey link, development status and footer link remain readable. The loaded field fades in over 1.4 seconds, with the fade removed under reduced motion. Stable local reading scrims stay behind the message and footer independently of animation, preserving contrast through the shader's bright phases.

### Chapters and interactive studies

Official React Bits ScrollStack, GridMotion and GlareHover source supplies the scene foundation. Adapted Magnet, MagnetLines, ScrollFloat, TextPressure, SplitText and PixelTransition supply purposeful responses; provenance is retained under `.asset-sources/react-bits` and public credits.

The first chapter switches a moving print grid to an individual composition through an eight-column pixel transition. The second joins Form, Logic and Data through a finite route reveal. The third exposes Visitor/Member buttons and a live permission result. Decorative geometry is hidden from assistive technology; status text and controls remain available without pointer input.

Study controls occupy a bottom strip of at least 70px on desktop and 64px on mobile. Related topic chips are quiet, outlined labels rather than interactive filters. The studies illustrate intent; they do not establish released capabilities.

### Standards

Six accordion buttons with `aria-expanded` and matching panel IDs select six semantic concepts: layout, a complete form-to-save path, response schema, permissions, a start-to-confirmation journey and a search preview. The active title deepens to the paper accent; a minus replaces the plus and the matching explanation becomes visible. Each visual carries a concept caption and remains decorative to assistive technology; the accordion explanation conveys its meaning. A restrained glare follows the pointer and a brief entry transition identifies the selected panel, with a static reduced-motion path. The visual's width remains explicit so the library wrapper cannot collapse on narrow screens. Mobile Access omits the redundant shield while retaining its heading, permission grid and caption.

### Questionnaire and waitlist

Survey options have at least 61px height, a visible marker and pressed state. Hover adds a paper tone; selection inverts the full row to dark ink and fills the marker vermilion. Disabled choices retain their content at reduced opacity. Submit is a full-width 56px pill with hover, pending, saved and disabled states. Preserve the existing question order, selection limits and inline status/error feedback.

The optional waitlist uses a visible email label, an underlined input row and a text action with an inline arrow. The input and action have 48px minimum height. Success, pending and failure belong to the form's existing live status; email collection remains separate from the questionnaire.

### Aggregate results disclosure

A native details/summary disclosure below the survey opens with a labeled arrow and plus; the plus rotates into a close mark when open. Thin paper boundaries and a 75px summary target keep the control distinct without adding a card. Expanded content uses display type for the total and headings, tabular answer counts, readable percentages and 3px deep-vermilion bars on muted paper tracks. A circular refresh button has a 44px target and a disabled loading state; live status, retryable error, loading and empty states remain readable.

Results show current-questionnaire totals and answer aggregates, with a UTC-today label. Up to three pain choices per response make percentages exceed 100% in aggregate; the explanatory copy states this and identifies the feedback as a nonrepresentative poll. Scheduled updates run every 30 seconds while the disclosure is open and skip hidden documents. The disclosure contains no individual answers or waitlist information.

### Reveal and close

The scroll-driven wire valley is a decorative Canvas 2D layer. Pooled projections use 30 rows and 37 columns on larger canvases, 20 and 27 below 768px, with alternate vertical rails; device-pixel ratio is capped at 1.5 and 1.25 respectively. Travel follows scroll only, and reduced motion leaves static terrain. The full “SleekViber.” reveal signature is static, centered and fitted to the content width at `clamp(48px, 13.4vw, 210px)`, with 13.4vw on mobile. It uses the subdued Almost neutral, no lateral transform and no clipping. TextPressure continues to make the separate closing wordmark respond to pointer position without changing the meaning of its back-to-top link.

## Do's and Don'ts

### Do:
- **Do** preserve the accepted black/paper/charcoal/vermilion world and Clash Display/General Sans pairing.
- **Do** use scale, scene contrast and subject-specific interaction to create hierarchy and immersion.
- **Do** reserve room for semantic controls, visible focus and outcomes at every viewport size.
- **Do** keep touch and reduced-motion paths readable in normal flow, with a single desktop scroll owner.
- **Do** preserve coming-soon truth and existing survey and waitlist behavior.

### Don't:
- **Don't** restore the rejected ash/green guidance or turn the experience into a uniform grid of generic cards.
- **Don't** add decorative linework that competes with the subject or the reading hierarchy.
- **Don't** add continuous idle terrain flight or a second smooth-scroll owner.
- **Don't** make pointer interaction or animation necessary to read the content or operate a control.
- **Don't** turn intended standards, conceptual studies or local timing samples into released product or frame-rate claims.
