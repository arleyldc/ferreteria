import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: "#f8fafc", // casi blanco
          100: "#f1f5f9", // blanco con gris leve
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b", // texto secundario
          600: "#475569", // texto principal suave
          700: "#334155", // UI media (cards, borders fuertes)
          800: "#1e293b", // fondo oscuro UI
          850: "#172033", // extra (opcional, más profundo azul)
          900: "#0b1220", // azul oscuro profundo (background principal dark)
        },
      },
    },
  },
  plugins: [],
  extend: {
    keyframes: {
      float: {
        "0%, 100%": { transform: "translateY(0px)" },
        "50%": { transform: "translateY(-4px)" },
      },
      bounceSlow: {
        "0%, 100%": { transform: "translateY(0px)" },
        "50%": { transform: "translateY(-6px)" },
      },
    },
    animation: {
      float: "float 3s ease-in-out infinite",
      "bounce-slow": "bounceSlow 2.5s ease-in-out infinite",
    },
  },
};

export default config;
