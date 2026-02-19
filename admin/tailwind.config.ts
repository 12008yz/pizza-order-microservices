import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
        "status-new": "var(--status-new)",
        "status-processing": "var(--status-processing)",
        "status-connected": "var(--status-connected)",
        "status-cancelled": "var(--status-cancelled)",
        "status-contacted": "var(--status-contacted)",
        "status-scheduled": "var(--status-scheduled)",
        "status-rejected": "var(--status-rejected)",
        error: "var(--error)",
        success: "var(--success)",
      },
      borderRadius: {
        card: "10px",
        input: "8px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
