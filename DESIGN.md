# SleekViber — presentation system

## Public landing
The user replaced the colorful studio with a dark metallic direction while retaining the cleaned typography and layout. Graphite #0A0A0B, warm white #EEECE7, muted platinum #B7B5B1 and silver #C8CDD0 are the public palette. There are no colored glows. The admin retains its separate dark utility theme.

## Typography
Deltha regular, supplied in the user's new font.zip, is the locally hosted display face on the public landing. General Sans carries body copy, survey legends and controls. Device screens use the same display/body contrast with measured text fitting. Admin fonts remain scoped to the admin layout.

Hero: “Beyond / almost.” in Deltha regular, 8.3vw desktop scale adjusted for extended letterforms, 1.03 line height, -0.02em tracking. Section headings: regular weight, 1.12 line height, -0.02em tracking, fluid 35–104px. The brand reveal uses 10vw. Body: 16px with 1.65 line height. The supplied demo license permits testing, personal and non-profit use; commercial launch requires the appropriate license. Original notice: app/fonts/Deltha-LICENSE.pdf.

No eyebrows, section or option numbering, decorative separator rules, letter-spaced metadata, emoji or ornamental arrows. No italic accent words or extra headline font families. The navigation belongs to the top of the hero and scrolls away. The primary action leads to the survey; a footer action leads to the waitlist.

## Scene and motion
One persistent R3F canvas. Artist-created MacBook, circuit-board and phone assets retain their geometry and PBR detail. The reveal assembles actual laptop parts. See public/models/LICENSES.txt for sources and licenses. React Bits Silk supplies continuous graphite/silver surface motion; its reading region is attenuated and mobile highlights are capped for body-text contrast. Real studio softbox lighting uses drei Environment and Lightformer, with a slow physical key-light sweep. Source albedo detail is translated to monochrome while normal and ARM maps are preserved.

One GSAP master owns mutable camera, model placement and assembly refs. Camera, object and type phases are sequenced. The laptop stays visible after hero copy exits, avoiding the old empty interval. The reveal centers and assembles the actual source parts; one shared placement system prevents a jump when switching to the assembled asset. The brand exits before the device settles beside the solutions introduction. Its headline belongs to the master, not an independent trigger. The device leaves before the standards grid can overlap it. Font-ready SplitText word masks animate other normal-flow headlines. Lenis on('scroll', ScrollTrigger.update) and GSAP ticker-driven lenis.raf(time * 1000), lagSmoothing(0), are preserved. R3F uses the same ticker; there are no React updates per frame. DPR caps: 1.5 desktop, 1.25 touch. Touch uses native scrolling; reduced motion presents normal-flow readable chapters. Hidden tabs unmount the renderer.

The hero screen demonstrates an illustrative website concept, the first problem shows a disconnected route, and the phone shows an access flow. These are labeled concepts, not a released editor. Neutral softboxes, a local licensed studio HDR and desktop contact shadows provide dimensional lighting. Background folds remain broad and tonal. The six standards use an open two-column composition and minimal Lucide icons, with no card containers or section rules.

Native cursor. Modest magnetic desktop controls and survey selection feedback remain. The decorative cursor tracker and laptop preview toggle are absent.

## Functional surfaces
The two-question survey remains reachable in normal flow. Single sentiment answer, maximum three pain points, exclusive All of the above, visible keyboard focus, inline retry, local duplicate prevention and server validation remain. Accessible progress is announced without decorative visual numbering. Success focuses a saved receipt and triggers two confetti bursts. The submit stays in normal flow so it cannot cover mobile form copy. The form stays visible after voting with disabled submission controls.

The email waitlist uses a labeled input and a text button. Authentication, stats, dashboard polling and existing survey data are preserved. All platform feature statements are framed as the standard under development.

Current evidence: REBUILD-AUDIT.md. Previous audit files describe earlier versions; their screenshots are superseded.

