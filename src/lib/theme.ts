// Theme preference is stored in a cookie so the server can render the right theme
// (no client script, no flash). No cookie = follow the OS ("system").
export const THEME_COOKIE = "theme";
export type Theme = "light" | "dark" | "system";

export function parseTheme(value: string | undefined): Theme {
  return value === "light" || value === "dark" ? value : "system";
}
