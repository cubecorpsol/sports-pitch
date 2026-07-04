import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        surface: {
          0: "hsl(var(--surface-0))",
          1: "hsl(var(--surface-1))",
          2: "hsl(var(--surface-2))",
        },
        ink: {
          primary: "hsl(var(--ink-primary))",
          secondary: "hsl(var(--ink-secondary))",
          muted: "hsl(var(--ink-muted))",
        },
        brand: {
          50: "#EAF6F2",
          100: "#CBEAE0",
          200: "#9BD8C4",
          300: "#63BFA4",
          400: "#399F84",
          500: "#0D7C66",
          600: "#0A6353",
          700: "#084F43",
          800: "#073F36",
          900: "#052B25",
        },
        status: {
          overdue: "#DC2626",
          "overdue-bg": "#FEF2F2",
          duesoon: "#D97706",
          "duesoon-bg": "#FFFBEB",
          pending: "#2563EB",
          "pending-bg": "#EFF6FF",
          paid: "#16A34A",
          "paid-bg": "#F0FDF4",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
