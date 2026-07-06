import sharedConfig from "@slib/ui-core/tailwind.config";
import type { Config } from "tailwindcss";

const config: Config = {
  ...sharedConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui-core/src/**/*.{js,ts,jsx,tsx}"
  ],
};

export default config;
