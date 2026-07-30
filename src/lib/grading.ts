/** CBC / KNEC 8-point achievement scale (KJSEA 2025+) */

export type CbcBand =
  | "EE1"
  | "EE2"
  | "ME1"
  | "ME2"
  | "AE1"
  | "AE2"
  | "BE1"
  | "BE2";

export interface GradeResult {
  band: CbcBand;
  level: number; // 8 (EE1) .. 1 (BE2)
  label: string;
  points: number; // same as level for ranking averages
}

const SCALE: Array<{
  band: CbcBand;
  min: number;
  max: number;
  level: number;
  label: string;
}> = [
  { band: "EE1", min: 90, max: 100, level: 8, label: "Exceeding Expectations 1" },
  { band: "EE2", min: 75, max: 89, level: 7, label: "Exceeding Expectations 2" },
  { band: "ME1", min: 58, max: 74, level: 6, label: "Meeting Expectations 1" },
  { band: "ME2", min: 41, max: 57, level: 5, label: "Meeting Expectations 2" },
  { band: "AE1", min: 31, max: 40, level: 4, label: "Approaching Expectations 1" },
  { band: "AE2", min: 21, max: 30, level: 3, label: "Approaching Expectations 2" },
  { band: "BE1", min: 11, max: 20, level: 2, label: "Below Expectations 1" },
  { band: "BE2", min: 1, max: 10, level: 1, label: "Below Expectations 2" },
];

export const GRADING_SCALE = SCALE;

export function gradeFromScore(score: number | null | undefined): GradeResult | null {
  if (score === null || score === undefined || Number.isNaN(score)) return null;
  if (score <= 0) {
    return { band: "BE2", level: 1, label: "Below Expectations 2", points: 1 };
  }
  const clamped = Math.min(100, Math.max(0, score));
  const match =
    SCALE.find((s) => clamped >= s.min && clamped <= s.max) ??
    SCALE[SCALE.length - 1];
  return {
    band: match.band,
    level: match.level,
    label: match.label,
    points: match.level,
  };
}

export function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function stdDev(values: number[]): number | null {
  if (values.length < 2) return null;
  const m = mean(values)!;
  const variance =
    values.reduce((acc, v) => acc + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function passRate(scores: number[], passThreshold = 41): number | null {
  if (!scores.length) return null;
  const passed = scores.filter((s) => s >= passThreshold).length;
  return (passed / scores.length) * 100;
}

/** Rank by average descending; ties share rank (competition ranking). */
export function rankByAverage(
  items: { id: string; average: number | null }[]
): Map<string, number> {
  const sorted = [...items]
    .filter((i) => i.average !== null)
    .sort((a, b) => (b.average! - a.average!));
  const ranks = new Map<string, number>();
  let i = 0;
  while (i < sorted.length) {
    const avg = sorted[i].average!;
    let j = i;
    while (j < sorted.length && sorted[j].average === avg) j++;
    const rank = i + 1;
    for (let k = i; k < j; k++) ranks.set(sorted[k].id, rank);
    i = j;
  }
  return ranks;
}

export function bandColorClass(band: CbcBand | string | null | undefined): string {
  if (!band) return "badge-muted";
  if (band.startsWith("EE")) return "badge-ee";
  if (band.startsWith("ME")) return "badge-me";
  if (band.startsWith("AE")) return "badge-ae";
  return "badge-be";
}

export function round1(n: number | null | undefined): number | null {
  if (n === null || n === undefined || Number.isNaN(n)) return null;
  return Math.round(n * 10) / 10;
}

export function round2(n: number | null | undefined): number | null {
  if (n === null || n === undefined || Number.isNaN(n)) return null;
  return Math.round(n * 100) / 100;
}
