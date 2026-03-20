import Chip from '@/components/Chip';

interface ChipOption<T extends string> {
  label: string;
  value: T;
}

interface ChipListProps<T extends string> {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function ChipList<T extends string>({ options, value, onChange }: ChipListProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          selected={opt.value === value}
          onClick={() => onChange(opt.value)}
        />
      ))}
    </div>
  );
}
