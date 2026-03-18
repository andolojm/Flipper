export function formatGp(value: number | null | undefined) {
  if (value == null) return '—';
  return `${value.toLocaleString()} gp`;
}

export function formatTime(unix: number | null | undefined) {
  if (unix == null) return '—';
  return new Date(unix * 1000).toLocaleString();
}