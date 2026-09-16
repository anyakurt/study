// Shared, in-memory record of performance-check scoring for the current
// participant session, mirroring the same module-scoped pattern already
// used by attentionCheckState.ts. Each component writes its own trial's
// points here, keyed by something unique to that trial (its image path is
// convenient and already available), so re-answering a trial overwrites
// rather than double-counts.
//
// This is entirely silent during the study itself -- nothing here is shown
// to the participant until the results screen at the very end reads it.

export const performanceScoreState: {
  task1: Record<string, number>;
  task2: Record<string, number>;
  task3: Record<string, number>;
  task4: Record<string, number>;
} = { task1: {}, task2: {}, task3: {}, task4: {} };

export function getTaskTotal(task: 'task1' | 'task2' | 'task3' | 'task4'): number {
  return Object.values(performanceScoreState[task]).reduce((sum, v) => sum + v, 0);
}

export function getOverallTotal(): number {
  return (['task1', 'task2', 'task3', 'task4'] as const)
    .reduce((sum, t) => sum + getTaskTotal(t), 0);
}