import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

interface CoordinateInputProps {
  onLocationSet: (lat: number, lon: number) => void;
  label?: string;
}

export function CoordinateInput({
  onLocationSet,
  label = "Enter Coordinates",
}: CoordinateInputProps) {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  const handleSubmit = () => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      toast.error("Please enter valid numeric coordinates");
      return;
    }

    if (latNum < -90 || latNum > 90) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }

    if (lonNum < -180 || lonNum > 180) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }

    onLocationSet(latNum, lonNum);
    toast.success(`Location set to ${latNum.toFixed(5)}, ${lonNum.toFixed(5)}`);
    setLat("");
    setLon("");
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          step="any"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          placeholder="Latitude"
          className="bg-background/50"
        />
        <Input
          type="number"
          step="any"
          value={lon}
          onChange={(e) => setLon(e.target.value)}
          placeholder="Longitude"
          className="bg-background/50"
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!lat.trim() || !lon.trim()}
        size="sm"
        className="w-full gap-2"
      >
        <MapPin className="w-4 h-4" />
        Set Location
      </Button>
    </div>
  );
}
