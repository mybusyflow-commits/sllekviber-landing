import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-local/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "three.js-master/**",
    "gsap-public/**",
    // Licensed generated decoder runtime; application rules do not apply here.
    "public/draco/**",
    ".asset-sources/**",
    "__MACOSX/**",
  ]),
]);

export default eslintConfig;
