import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, Marker, useMapEvents, useMap } from "react-leaflet";
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
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
  innerRadius: number;
  outerRadius: number;
  comparisonRadius: number;
  onCenter1Change: (center: [number, number]) => void;
  onCenter2Change: (center: [number, number]) => void;
}

function MapClickHandler({ 
  mode, 
  center1,
  center2,
  onCenter1Change, 
  onCenter2Change 
}: Pick<CrimeMapProps, "mode" | "center1" | "center2" | "onCenter1Change" | "onCenter2Change">) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      
      if (mode === "concentric" && !center1) {
        onCenter1Change([lat, lng]);
      } else if (mode === "comparison") {
        if (!center1) {
          onCenter1Change([lat, lng]);
        } else if (!center2) {
          onCenter2Change([lat, lng]);
        }
      }
    },
  });

  return null;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
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
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    data[0]?.lat || 42.3601,
    data[0]?.lon || -71.0589,
  ]);

  useEffect(() => {
    if (center1) {
      setMapCenter(center1);
    }
  }, [center1]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border shadow-lg">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <HeatmapLayer
          points={data}
          longitudeExtractor={(point: CrimeData) => point.lon}
          latitudeExtractor={(point: CrimeData) => point.lat}
          intensityExtractor={() => 1}
          radius={20}
          blur={15}
          max={2}
          gradient={{
            0.0: "#1a1a2e",
            0.2: "#16213e",
            0.4: "#0f3460",
            0.6: "#533483",
            0.8: "#e94560",
            1.0: "#f4a261",
          }}
        />

        <MapClickHandler
          mode={mode}
          center1={center1}
          center2={center2}
          onCenter1Change={onCenter1Change}
          onCenter2Change={onCenter2Change}
        />

        {center1 && <MapUpdater center={center1} />}

        {mode === "concentric" && center1 && (
          <>
            <Circle
              center={center1}
              radius={innerRadius}
              pathOptions={{
                color: "#10b981",
                fillColor: "#10b981",
                fillOpacity: 0.1,
                weight: 2,
              }}
            />
            <Circle
              center={center1}
              radius={outerRadius}
              pathOptions={{
                color: "#f59e0b",
                fillColor: "#f59e0b",
                fillOpacity: 0.05,
                weight: 2,
              }}
            />
            <Marker 
              position={center1}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  onCenter1Change([position.lat, position.lng]);
                },
              }}
            />
          </>
        )}

        {mode === "comparison" && (
          <>
            {center1 && (
              <>
                <Circle
                  center={center1}
                  radius={comparisonRadius}
                  pathOptions={{
                    color: "#06b6d4",
                    fillColor: "#06b6d4",
                    fillOpacity: 0.15,
                    weight: 2,
                  }}
                />
                <Marker 
                  position={center1}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const marker = e.target;
                      const position = marker.getLatLng();
                      onCenter1Change([position.lat, position.lng]);
                    },
                  }}
                />
              </>
            )}
            {center2 && (
              <>
                <Circle
                  center={center2}
                  radius={comparisonRadius}
                  pathOptions={{
                    color: "#a855f7",
                    fillColor: "#a855f7",
                    fillOpacity: 0.15,
                    weight: 2,
                  }}
                />
                <Marker 
                  position={center2}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const marker = e.target;
                      const position = marker.getLatLng();
                      onCenter2Change([position.lat, position.lng]);
                    },
                  }}
                />
              </>
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
}
