# Supplied font update

Deltha regular from `new font.zip` is loaded locally through `next/font/local` in the root layout. Public display headlines, the brand reveal, footer wordmark and source-mounted device-screen artwork use it. General Sans remains the text face for paragraphs and form controls; the admin retains its scoped utility type system.

The supplied face is extended rather than condensed. Headline sizes, tracking and line heights were adjusted to its actual width; source screen lettering is measured before drawing. A mobile feature-grid gutter that exceeded the available width was corrected.

Verification: production build and lint passed. A 28-view inspection covered 375, 768, 1440 and 1920px; a subsequent four-view confirmation covered the corrected features grid. No console errors, console warnings, horizontal document overflow or headline word collisions were detected. Mobile and desktop screenshots were visually inspected. This font-only update does not change survey storage, authentication or dashboard behavior.

The original license notice is preserved at `app/fonts/Deltha-LICENSE.pdf`. It identifies the supplied file as a demo/trial for personal, testing and non-profit purposes. A suitable commercial license is required before using it for business or promotional publication.
