export const PROBLEM_CHAPTERS = [
  { asset: 1, title: "Looks done. Isn't.", note: "Generic layouts. Broken links. The same design, again. A convincing preview is still only a preview.", topics: ["Broken frontends", "Average AI-slop designs", "Cookie-cutter output", "No personalization"], label: "THE SURFACE" },
  { asset: 2, title: "Nothing behind the click.", note: "A form that never saves. A database that never connects. Backend code that stops just short of working.", topics: ["Backends that almost work", "No database integration", "Broken links", "No SEO"], label: "THE SYSTEM" },
  { asset: 3, title: "Trust isn't optional.", note: "Authentication, access controls and validation belong in the first build. So do security and search-ready structure.", topics: ["Zero security", "No authentication"], label: "THE FOUNDATION" },
] as const;
