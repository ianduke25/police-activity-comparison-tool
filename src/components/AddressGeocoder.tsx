import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";
import { geocodeUSCensus } from "@/lib/geocoding";
import { toast } from "sonner";

interface AddressGeocoderProps {
  onLocationFound: (lat: number, lon: number, address: string) => void;
  label?: string;
  placeholder?: string;
}

export function AddressGeocoder({
  onLocationFound,
  label = "Enter Address",
  placeholder = "123 Main St, Boston, MA 02101",
}: AddressGeocoderProps) {
  const [address, setAddress] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleGeocode = async () => {
    if (!address.trim()) {
      toast.error("Please enter an address");
      return;
    }

    setIsGeocoding(true);

    try {
      const result = await geocodeUSCensus(address);

      if (result) {
        onLocationFound(result.latitude, result.longitude, result.matchedAddress);
        toast.success(`Location found: ${result.matchedAddress}`);
        setAddress(""); // Clear input after success
      } else {
        toast.error("Address not found. Please try a different address or be more specific.");
      }
    } catch (error) {
      toast.error("Failed to geocode address. Please try again.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGeocode();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="address-input" className="text-sm">
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          id="address-input"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isGeocoding}
          className="flex-1 bg-background/50"
        />
        <Button
          onClick={handleGeocode}
          disabled={isGeocoding || !address.trim()}
          size="default"
          className="gap-2"
        >
          {isGeocoding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Finding...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Locate
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Enter a U.S. address to place a marker on the map
      </p>
    </div>
  );
}
