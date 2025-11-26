import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface OffenseFilterProps {
  offenseTypes: string[];
  selectedOffenses: string[];
  onSelectionChange: (selected: string[]) => void;
}

export function OffenseFilter({
  offenseTypes,
  selectedOffenses,
  onSelectionChange,
}: OffenseFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOffenses = offenseTypes.filter((offense) =>
    offense.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    onSelectionChange(offenseTypes);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleToggle = (offense: string) => {
    if (selectedOffenses.includes(offense)) {
      onSelectionChange(selectedOffenses.filter((o) => o !== offense));
    } else {
      onSelectionChange([...selectedOffenses, offense]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel p-6 rounded-xl space-y-4 h-full"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold">Offense Types</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="text-xs"
          >
            All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-xs"
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search offenses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-background/50"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        {selectedOffenses.length} of {offenseTypes.length} selected
      </div>

      <ScrollArea className="h-[calc(100vh-24rem)]">
        <div className="space-y-2 pr-4">
          <AnimatePresence>
            {filteredOffenses.map((offense) => (
              <motion.div
                key={offense}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <Checkbox
                  id={offense}
                  checked={selectedOffenses.includes(offense)}
                  onCheckedChange={() => handleToggle(offense)}
                />
                <label
                  htmlFor={offense}
                  className="text-sm cursor-pointer flex-1 select-none"
                >
                  {offense}
                </label>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </motion.div>
  );
}
