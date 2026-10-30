import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { cookies } from "next/headers";
import { BRAND } from "@/lib/brand";
import { THEME_COOKIE, parseTheme } from "@/lib/theme";
import "./globals.css";

// Pages read the Neon Auth session cookie, so render per request.
export const dynamic = "force-dynamic";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Source_Serif_4({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.tagline,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#090d19" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // "light" / "dark" force a theme; "system" adds no class and the CSS follows the OS.
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);
  const themeClass = theme === "system" ? "" : theme;

  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${themeClass}`} data-theme={theme}>
      <body>
        {BRAND.announcement && (
          <div className="bg-brand-900 px-6 py-3 text-sm text-white">{BRAND.announcement}</div>
        )}
        {children}
      </body>
    </html>
  );
}
