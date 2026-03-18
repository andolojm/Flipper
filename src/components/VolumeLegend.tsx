interface VolumeLegendProps {
  /** Short description of the pivot point, e.g. "45th percentile" or "mean" */
  pivot: string;
  showDoseEmojis?: boolean;
}

export default function VolumeLegend({ pivot, showDoseEmojis = false }: VolumeLegendProps) {
  return (
    <div className="self-center text-right text-xs text-muted-foreground">
      <div className="text-[10px] uppercase tracking-wider mb-1.5">Trade Volume</div>
      <div className="flex items-center gap-1.5">
        <span>Low</span>
        <div
          className="w-20 h-2 rounded-full"
          style={{ background: 'linear-gradient(to right, rgba(239,68,68,0.4), transparent 50%, rgba(34,197,94,0.4))' }}
        />
        <span>High</span>
      </div>
      <div className="text-[10px] mt-1 text-muted-foreground/60">transparent at {pivot}</div>
      {showDoseEmojis && (
        <div className="mt-2 space-y-0.5 text-[10px] text-muted-foreground/60">
          <div>🔥🔥🔥 &gt;30% below avg price/dose</div>
          <div>🔥🔥 15–30% below avg price/dose</div>
          <div>🔥 5–15% below avg price/dose</div>
          <div>🗑️ &gt;5% above avg price/dose</div>
        </div>
      )}
    </div>
  );
}
