// Utilities for the final results screen. Each function scans the
// participant's whole `answers` object and identifies relevant entries by
// their CONTENT SHAPE, not by key name -- keys are step-position-dependent
// (confirmed earlier in this build) and unsafe to guess or hardcode.

type AnswersRecord = Record<string, {
  answer?: Record<string, unknown>;
  correctAnswer?: { id: string; answer: unknown }[];
}>;

// A-VLAT: percentage of items answered correctly, out of 27. This is a
// simple, participant-facing "fun" number -- NOT the scientific score.
// The real ability estimate (theta) already lives untouched in every
// stored VLAT answer under the 'score' key, for actual analysis.
export function getAVLATPercentCorrect(answers: AnswersRecord): number {
  let total = 0;
  let correct = 0;

  Object.values(answers).forEach((entry) => {
    const vlatResp = entry.answer?.vlatResp;
    const correctAnswerEntry = entry.correctAnswer?.find((c) => c.id === 'vlatResp');
    if (vlatResp !== undefined && correctAnswerEntry !== undefined) {
      total += 1;
      if (vlatResp === correctAnswerEntry.answer) {
        correct += 1;
      }
    }
  });

  if (total === 0) {
    return 0;
  }
  return Math.round((correct / total) * 100);
}

// Self-assessment: sum of the four 1-6 ratings (range 4-24), shown as a
// percentage of the maximum possible sum.
const SELF_ASSESSMENT_IDS = [
  'sglBoxplot', 'sglViolinPlot', 'sglHistogram', 'sglJitteredStripplot',
  'sgl5BarCharts', 'sgl5LinePlots', 'sgl5Pies', 'sgl5InferSize', 'sgl5DetermineDifference',
];
const SELF_ASSESSMENT_MAX = SELF_ASSESSMENT_IDS.length * 5; // 9 items x 5 = 45

export function getSelfAssessmentPercent(answers: AnswersRecord): number {
  let sum = 0;
  let found = 0;

  Object.values(answers).forEach((entry) => {
    SELF_ASSESSMENT_IDS.forEach((id) => {
      const raw = entry.answer?.[id];
      // Custom components (our own 4 items) store a plain number. Native
      // reVISit response widgets (the 5 SGL items, via the built-in likert
      // type) store the selected value as a STRING -- both need to be
      // accepted here, or the string-valued ones get silently skipped.
      const numValue = typeof raw === 'number'
        ? raw
        : (typeof raw === 'string' && raw.trim() !== '' && !Number.isNaN(Number(raw)) ? Number(raw) : null);

      if (numValue !== null) {
        sum += numValue - 1; // convert 1-6 scale to 0-5 for percentage calculation
        found += 1;
      }
    });
  });

  if (found === 0) {
    return 0;
  }
  return Math.round((sum / SELF_ASSESSMENT_MAX) * 100);
}