import { defineConfig, globalIgnores } from "eslint/config";
import next from "@next/eslint-plugin-next";

const eslintConfig = defineConfig([
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  {
    plugins: {
      "@next/next": next,
    },
    rules: {
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
]);

export default eslintConfig;
