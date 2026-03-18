interface VolumeLegendProps {
  /** Short description of the pivot point, e.g. "45th percentile" or "mean" */
  pivot: string;
}

export default function VolumeLegend({ pivot }: VolumeLegendProps) {
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
    </div>
  );
}
