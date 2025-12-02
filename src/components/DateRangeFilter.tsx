import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [startInput, setStartInput] = useState(startDate ? format(startDate, "yyyy-MM-dd") : "");
  const [endInput, setEndInput] = useState(endDate ? format(endDate, "yyyy-MM-dd") : "");

  const handleStartInputChange = (value: string) => {
    setStartInput(value);
    const parsed = parse(value, "yyyy-MM-dd", new Date());
    if (isValid(parsed)) {
      onStartDateChange(parsed);
    }
  };

  const handleEndInputChange = (value: string) => {
    setEndInput(value);
    const parsed = parse(value, "yyyy-MM-dd", new Date());
    if (isValid(parsed)) {
      onEndDateChange(parsed);
    }
  };

  const handleStartSelect = (date: Date | undefined) => {
    if (date) {
      onStartDateChange(date);
      setStartInput(format(date, "yyyy-MM-dd"));
    }
  };

  const handleEndSelect = (date: Date | undefined) => {
    if (date) {
      onEndDateChange(date);
      setEndInput(format(date, "yyyy-MM-dd"));
    }
  };

  return (
    <Card className="glass-panel">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Date Range</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Start Date</label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={startInput}
              onChange={(e) => handleStartInputChange(e.target.value)}
              className="flex-1"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={startDate || undefined}
                  onSelect={handleStartSelect}
                  defaultMonth={startDate || minDate || undefined}
                  fromYear={minDate?.getFullYear() || 2000}
                  toYear={maxDate?.getFullYear() || 2030}
                  captionLayout="dropdown-buttons"
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
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">End Date</label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={endInput}
              onChange={(e) => handleEndInputChange(e.target.value)}
              className="flex-1"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={endDate || undefined}
                  onSelect={handleEndSelect}
                  defaultMonth={endDate || maxDate || undefined}
                  fromYear={minDate?.getFullYear() || 2000}
                  toYear={maxDate?.getFullYear() || 2030}
                  captionLayout="dropdown-buttons"
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
