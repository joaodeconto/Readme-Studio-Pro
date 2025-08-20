export const darkMode = "class";
export const content = ["./src/app/**/*.{ts,tsx}", "@ui/components/**/*.{ts,tsx}"];
export const theme = {
  extend: {
    colors: {
      base: "var(--color-base)",
      muted: "var(--color-muted)",
      subtle: "var(--color-subtle)",
      accent: "var(--color-accent)",
      success: "var(--color-success)",
      danger: "var(--color-danger)",
    },
    fontFamily: {
      mono: ["ui-monospace", "SFMono-Regular", "monospace"],
    },
    boxShadow: {
      0: "none",
      1: "0 1px 2px rgba(0,0,0,.06)",
      2: "0 4px 12px rgba(0,0,0,.08)",
      4: "0 12px 24px rgba(0,0,0,.12)",
    },
  },
};
export const plugins = [];