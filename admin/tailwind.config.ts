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
        "frame-bg": "var(--frame-bg)",
        "frame-color": "var(--frame-color)",
        "frame-color-muted": "var(--frame-color-muted)",
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
        card: "20px",
        input: "10px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(16, 16, 16, 0.08)",
      },
      fontFamily: {
        frame: ['"TT Firs Neue"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
