import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        surface: {
          0: "#ffffff",
          1: "#fafafa",
          2: "#f5f5f4",
          3: "#e7e5e4",
        },
        ink: {
          DEFAULT: "#0c0a09",
          secondary: "#44403c",
          tertiary: "#78716c",
          disabled: "#a8a29e",
        },
        accent: {
          DEFAULT: "#1c1917",
          hover: "#292524",
          muted: "#f5f5f4",
        },
        brand: {
          DEFAULT: "#0f172a",
          light: "#1e293b",
          soft: "#f1f5f9",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "fade-up": "fadeUp 0.5s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "shimmer-gradient":
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        card: "0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        elevated: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        glow: "0 0 0 3px rgba(15,23,42,0.08)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
