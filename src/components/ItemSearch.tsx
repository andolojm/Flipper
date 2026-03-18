import { useMemo, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { MappingItem } from '@/types/osrs';

const MAX_RESULTS = 50;

interface ItemSearchProps {
  items: MappingItem[];
  onSelect?: (item: MappingItem) => void;
  className?: string;
}

export default function ItemSearch({ items, onSelect, className }: ItemSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MappingItem | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return items.slice(0, MAX_RESULTS);
    const lower = search.toLowerCase();
    const results: MappingItem[] = [];
    for (const item of items) {
      if (item.name.toLowerCase().includes(lower)) {
        results.push(item);
        if (results.length === MAX_RESULTS) break;
      }
    }
    return results;
  }, [items, search]);

  function handleSelect(item: MappingItem) {
    setSelected(item);
    setSearch('');
    setOpen(false);
    onSelect?.(item);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" role="combobox" aria-expanded={open} className={`${className ?? 'w-72'} justify-between`}>
            <span className="truncate">{selected ? selected.name : 'Search items…'}</span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-72 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search items…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup>
              {filtered.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => handleSelect(item)}
                  data-checked={selected?.id === item.id ? 'true' : undefined}
                >
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
