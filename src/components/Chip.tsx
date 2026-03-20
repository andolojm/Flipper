interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function Chip({ label, selected = false, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1 rounded-full text-sm border cursor-pointer transition-colors select-none',
        selected
          ? 'border-violet-500 text-violet-600 dark:text-violet-400 bg-violet-500/10'
          : 'border-border text-zinc-500 dark:text-zinc-400 hover:border-violet-500/40 hover:text-zinc-700 dark:hover:text-zinc-300',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
