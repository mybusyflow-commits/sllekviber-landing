export const Q1_OPTIONS = [
  "Completely fed up — I need this",
  "Pretty annoyed",
  "Just curious",
  "The slop is fine, actually",
] as const;

export const Q2_OPTIONS = [
  "Broken frontends",
  "Generic average designs",
  "Backends that almost work",
  "Broken links & routing",
  "No security or auth",
  "No database integration",
  "No SEO",
  "All of the above",
] as const;

export type Q1Answer = (typeof Q1_OPTIONS)[number];
export type Q2Answer = (typeof Q2_OPTIONS)[number];

export const PROBLEMS = [
  "Broken frontends", "Average AI-slop designs", "Backends that almost work",
  "Broken links", "Zero security", "No authentication", "No personalization",
  "No database integration", "Cookie-cutter output", "No SEO",
] as const;

export const SOLUTIONS = [
  { number: "01", title: "Design with a point of view", description: "Responsive layouts, considered typography and motion that serves the interface.", detail: "DESIGN / MOTION" },
  { number: "02", title: "Frontend and backend, together", description: "User journeys checked through to their outcome, including loading and error states.", detail: "END TO END" },
  { number: "03", title: "Connected data", description: "Database integration and persistence built into the working application.", detail: "DATABASE" },
  { number: "04", title: "Security by design", description: "Authentication, permissions, validation and rate limits considered from the start.", detail: "SECURITY" },
  { number: "05", title: "Complete user journeys", description: "Links, routes and actions that take people where they expect to go.", detail: "ROUTING" },
  { number: "06", title: "Search-ready structure", description: "Metadata, semantic markup and performance treated as part of the build.", detail: "SEO" },
] as const;
