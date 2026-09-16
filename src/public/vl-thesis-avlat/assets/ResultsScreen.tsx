import { Stack, Text, Title } from '@mantine/core';
import { StimulusParams } from '../../../../src/store/types';
import { getAVLATPercentCorrect, getSelfAssessmentPercent } from './resultsCalculation';
import { getOverallTotal } from './performanceScoreState';

type ResultsScreenParams = Record<string, never>;

// Maximum possible performance-check points: 4 trials each for Task 1 (1pt),
// Task 2 (2pts), Task 3 (1pt), Task 4 (1pt) = 4 + 8 + 4 + 4 = 20.
const PERFORMANCE_CHECK_MAX = 20;

export default function ResultsScreen({ answers }: StimulusParams<ResultsScreenParams>) {
  const avlatPercent = getAVLATPercentCorrect(answers);
  const selfAssessmentPercent = getSelfAssessmentPercent(answers);
  const performanceCheckPercent = Math.round((getOverallTotal() / PERFORMANCE_CHECK_MAX) * 100);

  return (
    <Stack gap="xl" style={{ maxWidth: 500 }}>
      <Title order={3}>Your results</Title>
      <Text size="sm" c="dimmed">
        Here&apos;s a quick look at how you did across the three parts of the study.
      </Text>


        <Stack gap={4}>
          <Text fw={600}>Self-Assessment</Text>
          <Text size="xl" fw={700}>{selfAssessmentPercent}%</Text>
          <Text size="sm" c="dimmed">of the maximum confidence rating</Text>
        </Stack>

        <Stack gap={4}>
          <Text fw={600}>Visualization Literacy Test (A-VLAT)</Text>
          <Text size="xl" fw={700}>{avlatPercent}%</Text>
          <Text size="sm" c="dimmed">correctly answered</Text>
        </Stack>

        <Stack gap={4}>
          <Text fw={600}>One-dimensional Distribution Charts (the last part)</Text>
          <Text size="xl" fw={700}>{performanceCheckPercent}%</Text>
          <Text size="sm" c="dimmed">correctly answered</Text>
        </Stack>
      </Stack>
  );
}