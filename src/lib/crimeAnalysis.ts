export interface CrimeData {
  lat: number;
  lon: number;
  offenseType?: string;
  offenseDate?: Date;
  [key: string]: any;
}

export interface AnalysisResult {
  insideRate: number;
  outsideRate: number;
  rateRatio: number;
  pValue: number;
  ciLow: number;
  ciHigh: number;
  insideCount: number;
  outsideCount: number;
  insideArea: number;
  outsideArea: number;
}

export interface ComparisonResult {
  area1Rate: number;
  area2Rate: number;
  rateRatio: number;
  pValue: number;
  ciLow: number;
  ciHigh: number;
  area1Count: number;
  area2Count: number;
  area1Area: number;
  area2Area: number;
}

// Haversine distance in meters (matches Python implementation exactly)
export function haversineDistanceMeters(
  centerLat: number,
  centerLon: number,
  pointLat: number,
  pointLon: number
): number {
  const R = 6371000; // Earth radius in meters

  const lat1 = toRad(centerLat);
  const lon1 = toRad(centerLon);
  const lat2 = toRad(pointLat);
  const lon2 = toRad(pointLon);

  const dlat = lat2 - lat1;
  const dlon = lon2 - lon1;

  const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(a));

  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Normal CDF approximation
function normalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

// Error function approximation
function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * x);
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

// Poisson rate ratio test
export function calculateRateRatio(
  count1: number,
  exposure1: number,
  count2: number,
  exposure2: number
): {
  rateRatio: number;
  pValue: number;
  ciLow: number;
  ciHigh: number;
  rate1: number;
  rate2: number;
} | null {
  if (count1 === 0 || count2 === 0 || exposure1 <= 0 || exposure2 <= 0) {
    return null;
  }

  const rate1 = count1 / exposure1;
  const rate2 = count2 / exposure2;
  const rateRatio = rate1 / rate2;
  
  const logRR = Math.log(rateRatio);
  const se = Math.sqrt(1 / count1 + 1 / count2);
  const z = logRR / se;
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));

  const ciLow = Math.exp(logRR - 1.96 * se);
  const ciHigh = Math.exp(logRR + 1.96 * se);

  return {
    rateRatio,
    pValue,
    ciLow,
    ciHigh,
    rate1,
    rate2,
  };
}

// Analyze concentric circles (radii in meters)
export function analyzeConcentricCircles(
  data: CrimeData[],
  centerLat: number,
  centerLon: number,
  innerRadiusM: number,
  outerRadiusM: number
): AnalysisResult | null {
  // Convert to km for area calculation
  const innerRadiusKm = innerRadiusM / 1000;
  const outerRadiusKm = outerRadiusM / 1000;
  const innerArea = Math.PI * innerRadiusKm * innerRadiusKm;
  const outerArea = Math.PI * (outerRadiusKm * outerRadiusKm - innerRadiusKm * innerRadiusKm);

  let insideCount = 0;
  let outsideCount = 0;

  data.forEach((point) => {
    const distance = haversineDistanceMeters(centerLat, centerLon, point.lat, point.lon);
    if (distance <= innerRadiusM) {
      insideCount++;
    } else if (distance <= outerRadiusM) {
      outsideCount++;
    }
  });

  const stats = calculateRateRatio(insideCount, innerArea, outsideCount, outerArea);
  
  if (!stats) return null;

  return {
    insideRate: stats.rate1,
    outsideRate: stats.rate2,
    rateRatio: stats.rateRatio,
    pValue: stats.pValue,
    ciLow: stats.ciLow,
    ciHigh: stats.ciHigh,
    insideCount,
    outsideCount,
    insideArea: innerArea,
    outsideArea: outerArea,
  };
}

// Analyze two separate circles (radius in meters)
export function compareTwoAreas(
  data: CrimeData[],
  center1Lat: number,
  center1Lon: number,
  center2Lat: number,
  center2Lon: number,
  radiusM: number
): ComparisonResult | null {
  // Convert to km for area calculation
  const radiusKm = radiusM / 1000;
  const area = Math.PI * radiusKm * radiusKm;

  let area1Count = 0;
  let area2Count = 0;

  data.forEach((point) => {
    const distance1 = haversineDistanceMeters(center1Lat, center1Lon, point.lat, point.lon);
    const distance2 = haversineDistanceMeters(center2Lat, center2Lon, point.lat, point.lon);
    
    if (distance1 <= radiusM) {
      area1Count++;
    }
    if (distance2 <= radiusM) {
      area2Count++;
    }
  });

  const stats = calculateRateRatio(area1Count, area, area2Count, area);
  
  if (!stats) return null;

  return {
    area1Rate: stats.rate1,
    area2Rate: stats.rate2,
    rateRatio: stats.rateRatio,
    pValue: stats.pValue,
    ciLow: stats.ciLow,
    ciHigh: stats.ciHigh,
    area1Count,
    area2Count,
    area1Area: area,
    area2Area: area,
  };
}
