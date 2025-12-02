import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DateRangeFilterProps {
  minDate: Date | null;
  maxDate: Date | null;
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

export function DateRangeFilter({
  minDate,
  maxDate,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) {
  return (
    <Card className="glass-panel">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Date Range</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Select start"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate || undefined}
                onSelect={(date) => onStartDateChange(date || null)}
                disabled={(date) =>
                  (minDate && date < minDate) ||
                  (maxDate && date > maxDate) ||
                  (endDate && date > endDate) ||
                  false
                }
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Select end"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate || undefined}
                onSelect={(date) => onEndDateChange(date || null)}
                disabled={(date) =>
                  (minDate && date < minDate) ||
                  (maxDate && date > maxDate) ||
                  (startDate && date < startDate) ||
                  false
                }
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {minDate && maxDate && (
          <p className="text-xs text-muted-foreground">
            Data range: {format(minDate, "MMM d, yyyy")} – {format(maxDate, "MMM d, yyyy")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
