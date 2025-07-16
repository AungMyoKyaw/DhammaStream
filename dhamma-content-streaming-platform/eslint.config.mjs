import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import sonarjs from "eslint-plugin-sonarjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    languageOptions: {
      parser: (await import("@typescript-eslint/parser")).default,
      parserOptions: {
        project: "./tsconfig.json"
      }
    }
  },
  sonarjs.configs.recommended,
  {
    rules: {
      // Disable SonarJS rules that are too strict for this project
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/prefer-read-only-props": "off",
      "sonarjs/use-type-alias": "off",
      // Allow unescaped entities in React for apostrophes
      "react/no-unescaped-entities": "off",
      // Allow any type for react-player compatibility
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
];

export default eslintConfig;
