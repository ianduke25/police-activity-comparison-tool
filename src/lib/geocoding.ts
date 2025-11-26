export interface GeocodingResult {
  matchedAddress: string;
  latitude: number;
  longitude: number;
}

/**
 * Geocode a U.S. address using the Census Bureau Geocoding API
 * https://geocoding.geo.census.gov/geocoder/
 */
export async function geocodeUSCensus(address: string): Promise<GeocodingResult | null> {
  if (!address || address.trim().length === 0) {
    return null;
  }

  const url = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress";
  const params = new URLSearchParams({
    address: address.trim(),
    benchmark: "Public_AR_Current",
    format: "json",
  });

  try {
    const response = await fetch(`${url}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Geocoding API error:", response.status);
      return null;
    }

    const data = await response.json();
    const matches = data?.result?.addressMatches;

    if (!matches || matches.length === 0) {
      return null;
    }

    const match = matches[0];
    return {
      matchedAddress: match.matchedAddress,
      latitude: match.coordinates.y,
      longitude: match.coordinates.x,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}
