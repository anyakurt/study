// Shared, in-memory record of attention check results for the current
// participant session. Since the whole study runs as one continuous
// single-page app with no reload between steps, a plain module-scoped
// object persists correctly across every component that imports it -- no
// need to reconstruct another component's storage identifier, which is
// step-position-dependent and not safe to guess.
//
// This is only used to decide, live, whether the exclusion screen should
// show. Each check still records its own pass/fail permanently through its
// own setAnswer call, so the exported data is complete and correct even if
// this in-memory tally were ever wrong.

export const attentionCheckResults: {
  postAVLAT?: boolean;
  task1?: boolean;
  task4?: boolean;
} = {};

export function countFailures(): number {
  return Object.values(attentionCheckResults).filter((correct) => correct === false).length;
}