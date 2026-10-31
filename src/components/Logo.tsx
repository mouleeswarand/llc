import { useId } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

/**
 * Taglion mark: a heraldic shield (protection) with a "T" monogram and a gold crown point
 * (the lion's crest). The mark uses fixed brand colors so it reads the same in both themes;
 * the wordmark follows the theme's ink color.
 */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  // Unique per instance: a page can render a logo inside a hidden panel (e.g. the auth/dashboard
  // sidebar on mobile), and a shared id would resolve to that hidden gradient and paint nothing.
  const gradientId = `taglion-shield-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#3A64E6" />
          <stop offset="1" stopColor="#14296E" />
        </linearGradient>
      </defs>
      {/* Shield */}
      <path d="M20 3.2 34.5 8.4V19c0 9-6 15.6-14.5 18.4C11.5 34.6 5.5 28 5.5 19V8.4Z" fill={`url(#${gradientId})`} />
      <path d="M20 5.6 32.2 10v9c0 7.7-5 13.4-12.2 16-7.2-2.6-12.2-8.3-12.2-16v-9Z" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth=".9" />
      {/* Crown point */}
      <path d="M15.6 13 16.7 9.6l2.1 1.9L20 8.8l1.2 2.7 2.1-1.9 1.1 3.4Z" fill="#E0B25C" />
      {/* T monogram */}
      <path d="M12.6 14.6h14.8a.9.9 0 0 1 .9.9v2.2a.9.9 0 0 1-.9.9h-5.4V29.4L20 31.4l-2-2V18.6h-5.4a.9.9 0 0 1-.9-.9v-2.2a.9.9 0 0 1 .9-.9Z" fill="#fff" />
    </svg>
  );
}

/** Mark + wordmark. Use `tone="light"` on dark backgrounds (navy panels, footer). */
export function Logo({ tone = "auto" }: { tone?: "auto" | "light" }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label={`${BRAND.name} home`}>
      <LogoMark />
      <span
        className={`font-display text-[1.45rem] font-semibold leading-none tracking-[-0.01em] ${
          tone === "light" ? "text-white" : "text-ink"
        }`}
      >
        {BRAND.name}
      </span>
    </Link>
  );
}
