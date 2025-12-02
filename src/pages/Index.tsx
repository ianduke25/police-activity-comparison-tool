import { useState, useEffect, useMemo } from "react";
import { FileUpload } from "@/components/FileUpload";
import { CrimeMap } from "@/components/CrimeMap";
import { OffenseFilter } from "@/components/OffenseFilter";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { ControlPanel } from "@/components/ControlPanel";
import { DateRangeFilter } from "@/components/DateRangeFilter";
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
  
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Calculate min/max dates from data
  const { minDate, maxDate } = useMemo(() => {
    if (data.length === 0) return { minDate: null, maxDate: null };
    const dates = data.map(d => d.offenseDate).filter((d): d is Date => d !== undefined);
    if (dates.length === 0) return { minDate: null, maxDate: null };
    return {
      minDate: new Date(Math.min(...dates.map(d => d.getTime()))),
      maxDate: new Date(Math.max(...dates.map(d => d.getTime()))),
    };
  }, [data]);

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

  // Set default date range when data loads
  useEffect(() => {
    if (minDate && maxDate) {
      setStartDate(minDate);
      setEndDate(maxDate);
    }
  }, [minDate, maxDate]);

  const filteredData = useMemo(() => {
    if (selectedOffenses.length === 0) {
      return [];
    }
    return data.filter((d) => {
      const matchesOffense = selectedOffenses.includes(d.offenseType || "UNKNOWN");
      const matchesDate = d.offenseDate && 
        (!startDate || d.offenseDate >= startDate) &&
        (!endDate || d.offenseDate <= endDate);
      return matchesOffense && matchesDate;
    });
  }, [data, selectedOffenses, startDate, endDate]);

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
              Richmond Police Activity Comparison Interface
            </h1>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar - Filters */}
        <div className="lg:col-span-3 space-y-4">
          <DateRangeFilter
            minDate={minDate}
            maxDate={maxDate}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
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
            onCoordinateSet={(lat, lon, forArea2) => {
              if (forArea2) {
                setCenter2([lat, lon]);
              } else {
                setCenter1([lat, lon]);
              }
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full aspect-square"
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
