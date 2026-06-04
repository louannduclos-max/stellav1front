import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type MultiSelectOption = { value: string; label: string };

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Sélectionner…",
  emptyMessage = "Aucun résultat",
  searchPlaceholder = "Rechercher…",
  disabled,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  const remove = (v: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((x) => x !== v));
  };

  const selectedLabels = value
    .map((v) => options.find((o) => o.value === v))
    .filter((o): o is MultiSelectOption => !!o);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between min-h-10 h-auto py-2 px-3 font-normal",
            !value.length && "text-muted-foreground",
            className,
          )}
        >
          <div className="flex flex-wrap gap-1 items-center flex-1 text-left">
            {selectedLabels.length === 0 ? (
              <span>{placeholder}</span>
            ) : (
              selectedLabels.map((o) => (
                <Badge key={o.value} variant="secondary" className="pl-2 pr-1 py-0.5 gap-1">
                  {o.label}
                  <span
                    role="button"
                    aria-label={`Retirer ${o.label}`}
                    onClick={(e) => remove(o.value, e)}
                    className="rounded hover:bg-muted-foreground/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width] min-w-[280px]" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => {
                const selected = value.includes(o.value);
                return (
                  <CommandItem
                    key={o.value}
                    value={o.label}
                    onSelect={() => toggle(o.value)}
                    className="cursor-pointer"
                  >
                    <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
                    {o.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}