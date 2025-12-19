import { useState, useEffect, useMemo } from "react";
import { FileUpload } from "@/components/FileUpload";
import { CrimeMap } from "@/components/CrimeMap";
import { OffenseFilter } from "@/components/OffenseFilter";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { ControlPanel } from "@/components/ControlPanel";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { CrimeData, compareTwoAreas } from "@/lib/crimeAnalysis";
import { motion } from "framer-motion";


const Index = () => {
  const [data, setData] = useState<CrimeData[]>([]);
  const [offenseTypes, setOffenseTypes] = useState<string[]>([]);
  const [selectedOffenses, setSelectedOffenses] = useState<string[]>([]);
  
  const [center1, setCenter1] = useState<[number, number] | null>(null);
  const [center2, setCenter2] = useState<[number, number] | null>(null);
  
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

  // Don't auto-set date range - let user explicitly filter if they want

  const filteredData = useMemo(() => {
    if (selectedOffenses.length === 0) {
      return [];
    }
    return data.filter((d) => {
      const matchesOffense = selectedOffenses.includes(d.offenseType || "UNKNOWN");
      
      // Only filter by date if user has explicitly set a date range
      // If no date range set, include ALL records (even those without dates)
      const hasDateFilter = startDate || endDate;
      if (!hasDateFilter) {
        return matchesOffense;
      }
      
      // If date filter is set but record has no date, exclude it
      if (!d.offenseDate) {
        return false;
      }
      
      const matchesDate = 
        (!startDate || d.offenseDate >= startDate) &&
        (!endDate || d.offenseDate <= endDate);
      return matchesOffense && matchesDate;
    });
  }, [data, selectedOffenses, startDate, endDate]);

  const comparisonResult = useMemo(() => {
    if (!center1 || !center2) return null;
    return compareTwoAreas(
      filteredData,
      center1[0],
      center1[1],
      center2[0],
      center2[1],
      comparisonRadius
    );
  }, [filteredData, center1, center2, comparisonRadius]);

  const handleReset = () => {
    setCenter1(null);
    setCenter2(null);
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
        className="mb-4"
      >
        <h1 className="text-2xl md:text-3xl font-display font-bold text-gradient">
          Police Activity Comparison Interface
        </h1>
      </motion.header>

      {/* Control Panel - Full width at top */}
      <ControlPanel
        comparisonRadius={comparisonRadius}
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

      {/* Main content row - Filters, Map, Analysis all at same level */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
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

        {/* Map */}
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full aspect-square"
          >
            <CrimeMap
              data={filteredData}
              center1={center1}
              center2={center2}
              comparisonRadius={comparisonRadius}
              onCenter1Change={setCenter1}
              onCenter2Change={setCenter2}
            />
          </motion.div>
        </div>

        {/* Right sidebar - Analysis */}
        <div className="lg:col-span-3">
          <AnalysisPanel
            comparisonResult={comparisonResult}
            center1={center1}
            center2={center2}
            comparisonRadius={comparisonRadius}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
