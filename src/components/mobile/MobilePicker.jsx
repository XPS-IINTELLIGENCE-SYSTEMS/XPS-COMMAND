import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from "@/components/ui/drawer";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/**
 * Drop-in replacement for <Select> that uses a Drawer on mobile
 * and the standard shadcn Select on desktop.
 *
 * Props:
 *  value, onValueChange, placeholder, label, options: [{value, label}]
 *  className — applied to trigger
 */
export default function MobilePicker({ value, onValueChange, placeholder, label, options, className }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder || "Select…";

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm",
          "min-h-[36px] w-full text-left",
          !value && "text-muted-foreground",
          className
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[70vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>{label || placeholder || "Select"}</DrawerTitle>
            <DrawerDescription>Tap an option to select</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-2 pb-6 safe-bottom">
            {options.map(o => (
              <button
                key={o.value}
                onClick={() => { onValueChange(o.value); setOpen(false); }}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm transition-colors",
                  "active:bg-primary/10",
                  value === o.value ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                )}
              >
                <span>{o.label}</span>
                {value === o.value && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}