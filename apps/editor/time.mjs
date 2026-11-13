// "3 hours ago" for a time in milliseconds.
export function ago(at) {
  const seconds = Math.round((Date.now() - at) / 1000);
  if (seconds < 60) return "just now";
  let value = seconds;
  let unit = "second";
  for (const [size, name] of [[60, "minute"], [60, "hour"], [24, "day"], [30, "month"], [12, "year"]]) {
    if (value < size) break;
    value = Math.floor(value / size);
    unit = name;
  }
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-value, unit);
}
