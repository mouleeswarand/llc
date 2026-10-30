import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
        <path d="M2 28 L12 10 L18 20 L22 14 L30 28 Z" className="fill-brand-600" />
        <path d="M12 10 L15 15 L9 15 Z" className="fill-accent-500" />
      </svg>
      <span className="font-display text-xl font-semibold tracking-tight text-ink">{BRAND.name}</span>
    </Link>
  );
}
