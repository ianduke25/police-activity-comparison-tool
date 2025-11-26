import { useState, useEffect, useMemo } from "react";
import { FileUpload } from "@/components/FileUpload";
import { CrimeMap } from "@/components/CrimeMap";
import { OffenseFilter } from "@/components/OffenseFilter";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { ControlPanel } from "@/components/ControlPanel";
import { CrimeData, analyzeConcentricCircles, compareTwoAreas } from "@/lib/crimeAnalysis";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

const Index = () => {
  const [data, setData] = useState<CrimeData[]>([]);
  const [offenseTypes, setOffenseTypes] = useState<string[]>([]);
  const [selectedOffenses, setSelectedOffenses] = useState<string[]>([]);
  
  const [mode, setMode] = useState<"concentric" | "comparison">("concentric");
  const [center1, setCenter1] = useState<[number, number] | null>(null);
  const [center2, setCenter2] = useState<[number, number] | null>(null);
  
  const [innerRadius, setInnerRadius] = useState(500);
  const [outerRadius, setOuterRadius] = useState(1500);
  const [comparisonRadius, setComparisonRadius] = useState(800);

  useEffect(() => {
    if (data.length > 0) {
      const types = Array.from(new Set(data.map((d) => d.offenseType || "UNKNOWN")));
      setOffenseTypes(types.sort());
      setSelectedOffenses(types);
      
      // Set default center to data centroid
      const avgLat = data.reduce((sum, d) => sum + d.lat, 0) / data.length;
      const avgLon = data.reduce((sum, d) => sum + d.lon, 0) / data.length;
      setCenter1([avgLat, avgLon]);
    }
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((d) => selectedOffenses.includes(d.offenseType || "UNKNOWN"));
  }, [data, selectedOffenses]);

  const concentricResult = useMemo(() => {
    if (mode !== "concentric" || !center1) return null;
    return analyzeConcentricCircles(
      filteredData,
      center1[0],
      center1[1],
      innerRadius / 1000,
      outerRadius / 1000
    );
  }, [mode, filteredData, center1, innerRadius, outerRadius]);

  const comparisonResult = useMemo(() => {
    if (mode !== "comparison" || !center1 || !center2) return null;
    return compareTwoAreas(
      filteredData,
      center1[0],
      center1[1],
      center2[0],
      center2[1],
      comparisonRadius / 1000
    );
  }, [mode, filteredData, center1, center2, comparisonRadius]);

  const handleReset = () => {
    setCenter1(null);
    setCenter2(null);
    setInnerRadius(500);
    setOuterRadius(1500);
    setComparisonRadius(800);
  };

  if (data.length === 0) {
    return <FileUpload onDataLoaded={setData} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 glow">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient">
              Crime Hotspot Explorer
            </h1>
            <p className="text-muted-foreground mt-1">
              Statistical analysis of spatial crime concentrations
            </p>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar - Filters */}
        <div className="lg:col-span-3">
          <OffenseFilter
            offenseTypes={offenseTypes}
            selectedOffenses={selectedOffenses}
            onSelectionChange={setSelectedOffenses}
          />
        </div>

        {/* Main content */}
        <div className="lg:col-span-6 space-y-6">
          <ControlPanel
            mode={mode}
            onModeChange={(newMode) => {
              setMode(newMode);
              if (newMode === "concentric") {
                setCenter2(null);
              }
            }}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            comparisonRadius={comparisonRadius}
            onInnerRadiusChange={setInnerRadius}
            onOuterRadiusChange={setOuterRadius}
            onComparisonRadiusChange={setComparisonRadius}
            onReset={handleReset}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="h-[calc(100vh-20rem)]"
          >
            <CrimeMap
              data={filteredData}
              mode={mode}
              center1={center1}
              center2={center2}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              comparisonRadius={comparisonRadius}
              onCenter1Change={setCenter1}
              onCenter2Change={setCenter2}
            />
          </motion.div>
        </div>

        {/* Right sidebar - Analysis */}
        <div className="lg:col-span-3">
          <AnalysisPanel
            mode={mode}
            concentricResult={concentricResult}
            comparisonResult={comparisonResult}
            center1={center1}
            center2={center2}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            comparisonRadius={comparisonRadius}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
