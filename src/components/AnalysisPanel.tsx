import { motion } from "framer-motion";
import { ComparisonResult } from "@/lib/crimeAnalysis";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AnalysisPanelProps {
  comparisonResult?: ComparisonResult | null;
  center1?: [number, number] | null;
  center2?: [number, number] | null;
  comparisonRadius?: number;
}

export function AnalysisPanel({
  comparisonResult,
  center1,
  center2,
  comparisonRadius,
}: AnalysisPanelProps) {
  const getRatioIcon = (ratio: number) => {
    if (ratio > 1.1) return <TrendingUp className="w-5 h-5 text-data-viz-3" />;
    if (ratio < 0.9) return <TrendingDown className="w-5 h-5 text-data-viz-2" />;
    return <Minus className="w-5 h-5 text-muted-foreground" />;
  };

  const getRatioColor = (ratio: number) => {
    if (ratio > 1.1) return "text-data-viz-3";
    if (ratio < 0.9) return "text-data-viz-2";
    return "text-muted-foreground";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel p-6 rounded-xl space-y-6 h-full overflow-y-auto"
    >
      <div>
        <h3 className="text-xl font-display font-bold mb-2">
          Descriptive Statistics
        </h3>
        <p className="text-sm text-muted-foreground">
          Comparing two separate areas
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {center1 && (
            <div className="space-y-1">
              <div className="text-xs text-data-viz-1">Area 1 Center</div>
              <div className="text-sm font-mono">
                {center1[0].toFixed(5)}, {center1[1].toFixed(5)}
              </div>
            </div>
          )}
          {center2 && (
            <div className="space-y-1">
              <div className="text-xs text-data-viz-2">Area 2 Center</div>
              <div className="text-sm font-mono">
                {center2[0].toFixed(5)}, {center2[1].toFixed(5)}
              </div>
            </div>
          )}
        </div>

        {center1 && center2 && comparisonResult ? (
          <>
            <div className="h-px bg-border" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-data-viz-1">Area 1 Count</div>
                <div className="text-2xl font-bold text-data-viz-1">
                  {comparisonResult.area1Count}
                </div>
                <div className="text-xs text-muted-foreground">
                  {comparisonResult.area1Rate.toFixed(3)} crimes/km²
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-data-viz-2">Area 2 Count</div>
                <div className="text-2xl font-bold text-data-viz-2">
                  {comparisonResult.area2Count}
                </div>
                <div className="text-xs text-muted-foreground">
                  {comparisonResult.area2Rate.toFixed(3)} crimes/km²
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rate Ratio (A1/A2)</span>
              <div className="flex items-center gap-2">
                {getRatioIcon(comparisonResult.rateRatio)}
                <span className={`text-2xl font-bold ${getRatioColor(comparisonResult.rateRatio)}`}>
                  {comparisonResult.rateRatio.toFixed(3)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm leading-relaxed">
                {comparisonResult.rateRatio > 1.1 ? (
                  <>Area 1 has a police activity rate <strong>{comparisonResult.rateRatio.toFixed(2)}x as high as</strong> the police activity rate of Area 2.</>
                ) : comparisonResult.rateRatio < 0.9 ? (
                  <>Area 1 has a police activity rate <strong>{comparisonResult.rateRatio.toFixed(2)}x as high as</strong> the police activity rate of Area 2.</>
                ) : (
                  <>Police activity rates are similar between the two areas.</>
                )}
              </p>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-8">
            {!center1 ? "Click on the map to place Area 1" : "Click on the map to place Area 2"}
          </div>
        )}
      </div>
    </motion.div>
  );
}
