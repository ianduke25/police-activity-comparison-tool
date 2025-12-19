import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RotateCcw } from "lucide-react";
import { CoordinateInput } from "@/components/CoordinateInput";

interface ControlPanelProps {
  comparisonRadius: number;
  onComparisonRadiusChange: (value: number) => void;
  onReset: () => void;
  onCoordinateSet: (lat: number, lon: number, forArea2?: boolean) => void;
}

export function ControlPanel({
  comparisonRadius,
  onComparisonRadiusChange,
  onReset,
  onCoordinateSet,
}: ControlPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 rounded-xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold">Analysis Controls</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Circle Radius</Label>
          <span className="text-sm font-mono text-muted-foreground">
            {comparisonRadius}m
          </span>
        </div>
        <Slider
          value={[comparisonRadius]}
          onValueChange={([value]) => onComparisonRadiusChange(value)}
          min={100}
          max={3000}
          step={50}
          className="w-full"
        />
      </div>

      <div className="h-px bg-border" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CoordinateInput
          label="Area 1 Coordinates"
          onLocationSet={(lat, lon) => onCoordinateSet(lat, lon, false)}
        />
        <CoordinateInput
          label="Area 2 Coordinates"
          onLocationSet={(lat, lon) => onCoordinateSet(lat, lon, true)}
        />
      </div>

      <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        Click on the map or use coordinates to place Area 1, then Area 2. Drag markers to reposition.
      </div>
    </motion.div>
  );
}
