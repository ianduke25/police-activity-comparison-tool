import { useCallback } from "react";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { CrimeData } from "@/lib/crimeAnalysis";

interface FileUploadProps {
  onDataLoaded: (data: CrimeData[]) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const handleFile = useCallback(
    (file: File) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed: CrimeData[] = [];
          
          results.data.forEach((row: any) => {
            try {
              let lat: number | undefined;
              let lon: number | undefined;
              
              // Try to parse coordinates column if it exists
              if (row.coordinates) {
                try {
                  const coords = typeof row.coordinates === 'string' 
                    ? JSON.parse(row.coordinates.replace(/'/g, '"'))
                    : row.coordinates;
                  lat = coords.latitude;
                  lon = coords.longitude;
                } catch {
                  // If parsing fails, continue to check for direct lat/lon columns
                }
              }
              
              // Check for direct lat/lon columns
              if (!lat || !lon) {
                lat = row.lat || row.latitude;
                lon = row.lon || row.longitude;
              }
              
              if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
                // Parse offensedateutc if present
                let offenseDate: Date | undefined;
                if (row.offensedateutc) {
                  const parsed_date = new Date(row.offensedateutc);
                  if (!isNaN(parsed_date.getTime())) {
                    offenseDate = parsed_date;
                  }
                }
                
                // Skip rows without valid dates
                if (!offenseDate) return;
                
                parsed.push({
                  lat: Number(lat),
                  lon: Number(lon),
                  offenseType: row.offense_grouping || row.offensecode || row.offense_type || "UNKNOWN",
                  offenseDate,
                  ...row,
                });
              }
            } catch (error) {
              console.warn("Failed to parse row:", error);
            }
          });
          
          if (parsed.length > 0) {
            onDataLoaded(parsed);
          } else {
            alert("No valid coordinates found in the file. Please ensure your CSV has 'coordinates', 'lat/lon', or 'latitude/longitude' columns.");
          }
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          alert("Failed to parse CSV file. Please check the format.");
        },
      });
    },
    [onDataLoaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type === "text/csv") {
        handleFile(file);
      } else {
        alert("Please upload a CSV file");
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-screen p-8"
    >
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="glass-panel w-full max-w-2xl p-12 rounded-2xl text-center cursor-pointer hover:border-primary/50 transition-all duration-300"
      >
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-6">
            <div className="p-6 rounded-full bg-primary/10">
              <Upload className="w-16 h-16 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-bold text-gradient">
                Upload Data
              </h2>
              <p className="text-muted-foreground text-lg">
                Drop your CSV file here or click to browse
              </p>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Required columns: coordinates (JSON) or lat/lon or latitude/longitude</p>
              <p>Optional: offense_grouping, offensecode, or offense_type</p>
            </div>
          </div>
        </label>
        
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </motion.div>
  );
}
