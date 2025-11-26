import { useEffect, useRef } from "react";
import L, { Map as LeafletMap, Circle as LeafletCircle, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { CrimeData } from "@/lib/crimeAnalysis";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface CrimeMapProps {
  data: CrimeData[];
  mode: "concentric" | "comparison";
  center1: [number, number] | null;
  center2: [number, number] | null;
  innerRadius: number; // meters
  outerRadius: number; // meters
  comparisonRadius: number; // meters
  onCenter1Change: (center: [number, number]) => void;
  onCenter2Change: (center: [number, number]) => void;
}

export function CrimeMap({
  data,
  mode,
  center1,
  center2,
  innerRadius,
  outerRadius,
  comparisonRadius,
  onCenter1Change,
  onCenter2Change,
}: CrimeMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const heatLayerRef = useRef<L.HeatLayer | null>(null as any);
  const innerCircleRef = useRef<LeafletCircle | null>(null);
  const outerCircleRef = useRef<LeafletCircle | null>(null);
  const compCircle1Ref = useRef<LeafletCircle | null>(null);
  const compCircle2Ref = useRef<LeafletCircle | null>(null);
  const marker1Ref = useRef<LeafletMarker | null>(null);
  const marker2Ref = useRef<LeafletMarker | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCenter: [number, number] = [
      data[0]?.lat || 42.3601,
      data[0]?.lon || -71.0589,
    ];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    // Click handler to place centroids
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (mode === "concentric") {
        if (!center1) {
          onCenter1Change([lat, lng]);
        } else {
          onCenter1Change([lat, lng]);
        }
      } else {
        if (!center1) {
          onCenter1Change([lat, lng]);
        } else if (!center2) {
          onCenter2Change([lat, lng]);
        }
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update heatmap when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (!data || data.length === 0) return;

    const points: [number, number, number][] = data.map((point) => [
      point.lat,
      point.lon,
      1,
    ]);

    // @ts-ignore leaflet.heat extension
    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: "#1a1a2e",
        0.2: "#16213e",
        0.4: "#0f3460",
        0.6: "#533483",
        0.8: "#e94560",
        1.0: "#f4a261",
      },
    });

    heat.addTo(map);
    heatLayerRef.current = heat;
  }, [data]);

  // Update view when primary center changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center1) return;
    map.setView(center1, map.getZoom());
  }, [center1]);

  // Helper to ensure draggable marker exists and syncs with state
  const ensureMarker = (
    center: [number, number] | null,
    ref: React.MutableRefObject<LeafletMarker | null>,
    color: string,
    onChange: (center: [number, number]) => void,
  ) => {
    const map = mapRef.current;
    if (!map) return;

    if (!center) {
      if (ref.current) {
        map.removeLayer(ref.current);
        ref.current = null;
      }
      return;
    }

    if (!ref.current) {
      const marker = L.marker(center, { draggable: true, autoPan: true });
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChange([pos.lat, pos.lng]);
      });
      marker.addTo(map);
      ref.current = marker;
    } else {
      ref.current.setLatLng(center);
    }
  };

  // Update shapes and markers when mode/centers/radii change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear all circles first
    [innerCircleRef, outerCircleRef, compCircle1Ref, compCircle2Ref].forEach((ref) => {
      if (ref.current) {
        map.removeLayer(ref.current);
        ref.current = null;
      }
    });

    if (mode === "concentric" && center1) {
      innerCircleRef.current = L.circle(center1, {
        radius: innerRadius,
        color: "#10b981",
        weight: 2,
        fillColor: "#10b981",
        fillOpacity: 0.1,
      }).addTo(map);

      outerCircleRef.current = L.circle(center1, {
        radius: outerRadius,
        color: "#f59e0b",
        weight: 2,
        fillColor: "#f59e0b",
        fillOpacity: 0.05,
      }).addTo(map);
    }

    if (mode === "comparison") {
      if (center1) {
        compCircle1Ref.current = L.circle(center1, {
          radius: comparisonRadius,
          color: "#06b6d4",
          weight: 2,
          fillColor: "#06b6d4",
          fillOpacity: 0.15,
        }).addTo(map);
      }
      if (center2) {
        compCircle2Ref.current = L.circle(center2, {
          radius: comparisonRadius,
          color: "#a855f7",
          weight: 2,
          fillColor: "#a855f7",
          fillOpacity: 0.15,
        }).addTo(map);
      }
    }

    // Markers
    ensureMarker(center1, marker1Ref, "#10b981", onCenter1Change);
    ensureMarker(center2, marker2Ref, "#a855f7", onCenter2Change);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, center1, center2, innerRadius, outerRadius, comparisonRadius]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border shadow-lg">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
