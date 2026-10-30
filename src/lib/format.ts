const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function money(cents: number) {
  return usd.format(cents / 100);
}

export function longDate(d: Date | null | undefined) {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function shortDate(d: Date | null | undefined) {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function newOrderNumber() {
  return `${Date.now()}${Math.floor(Math.random() * 90 + 10)}`;
}
