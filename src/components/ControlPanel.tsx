import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RotateCcw, Circle, Layers } from "lucide-react";
import { CoordinateInput } from "@/components/CoordinateInput";

interface ControlPanelProps {
  mode: "concentric" | "comparison";
  onModeChange: (mode: "concentric" | "comparison") => void;
  innerRadius: number;
  outerRadius: number;
  comparisonRadius: number;
  onInnerRadiusChange: (value: number) => void;
  onOuterRadiusChange: (value: number) => void;
  onComparisonRadiusChange: (value: number) => void;
  onReset: () => void;
  onCoordinateSet: (lat: number, lon: number, forArea2?: boolean) => void;
}

export function ControlPanel({
  mode,
  onModeChange,
  innerRadius,
  outerRadius,
  comparisonRadius,
  onInnerRadiusChange,
  onOuterRadiusChange,
  onComparisonRadiusChange,
  onReset,
  onCoordinateSet,
}: ControlPanelProps) {
  const [coordFor, setCoordFor] = useState<"area1" | "area2">("area1");

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

      <div className="space-y-4">
        <Label>Analysis Mode</Label>
        <RadioGroup
          value={mode}
          onValueChange={(value) => onModeChange(value as "concentric" | "comparison")}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <RadioGroupItem
              value="concentric"
              id="concentric"
              className="peer sr-only"
            />
            <Label
              htmlFor="concentric"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-border cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all"
            >
              <Layers className="w-6 h-6" />
              <span className="text-sm font-medium">Concentric</span>
              <span className="text-xs text-muted-foreground text-center">
                Inner circle vs outer ring
              </span>
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="comparison"
              id="comparison"
              className="peer sr-only"
            />
            <Label
              htmlFor="comparison"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-border cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all"
            >
              <Circle className="w-6 h-6" />
              <span className="text-sm font-medium">Comparison</span>
              <span className="text-xs text-muted-foreground text-center">
                Two separate areas
              </span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {mode === "concentric" ? (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Inner Radius</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {innerRadius}m
              </span>
            </div>
            <Slider
              value={[innerRadius]}
              onValueChange={([value]) => onInnerRadiusChange(value)}
              min={100}
              max={3000}
              step={50}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Outer Radius</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {outerRadius}m
              </span>
            </div>
            <Slider
              value={[outerRadius]}
              onValueChange={([value]) => onOuterRadiusChange(value)}
              min={innerRadius + 50}
              max={8000}
              step={50}
              className="w-full"
            />
          </div>

          <div className="h-px bg-border" />

          <CoordinateInput
            label="Place Center by Coordinates"
            onLocationSet={(lat, lon) => onCoordinateSet(lat, lon, false)}
          />
        </>
      ) : (
        <>
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

          <div className="space-y-4">
            <Label>Place Areas by Coordinates</Label>
            <RadioGroup
              value={coordFor}
              onValueChange={(value) => setCoordFor(value as "area1" | "area2")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="area1" id="area1" />
                <Label htmlFor="area1" className="text-sm cursor-pointer">Area 1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="area2" id="area2" />
                <Label htmlFor="area2" className="text-sm cursor-pointer">Area 2</Label>
              </div>
            </RadioGroup>

            <CoordinateInput
              label={`Place ${coordFor === "area1" ? "Area 1" : "Area 2"}`}
              onLocationSet={(lat, lon) => onCoordinateSet(lat, lon, coordFor === "area2")}
            />
          </div>
        </>
      )}

      <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        {mode === "concentric" 
          ? "Click on the map or enter coordinates to place the centroid. Drag the marker to reposition."
          : "Click on the map or use coordinates to place Area 1, then Area 2. Drag markers to reposition."}
      </div>
    </motion.div>
  );
}
