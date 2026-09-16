import { useEffect, useState } from 'react';
import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { StimulusParams } from '../../../../src/store/types';
import { countFailures } from './attentionCheckState';
import { performanceScoreState } from './performanceScoreState';

interface MedianComparisonParams {
  imagePath: string;
  correctAnswer: 'A' | 'B' | 'C';
  debugShowScore?: boolean;
}

// Same display width convention as the other custom trial components.
const DISPLAY_WIDTH = 450;

export default function MedianComparison({ parameters, setAnswer }: StimulusParams<MedianComparisonParams>) {
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | null>(null);

  // Frozen at mount: if a prior attention check already failed twice by the
  // time this trial loads, this screen shows the exclusion message instead
  // of the real trial, and never lets the participant answer it.
  const [excludedOnLoad] = useState(() => countFailures() >= 2);

  useEffect(() => {
    setAnswer({
      status: false,
      answers: { medianComparison: null, excludedOnLoad },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (choice: 'A' | 'B' | 'C') => {
    setSelected(choice);

    const correct = choice === parameters.correctAnswer;
    performanceScoreState.task4[parameters.imagePath] = correct ? 1 : 0;

    setAnswer({
      status: true,
      answers: {
        medianComparison: choice,
      },
    });
  };

  if (excludedOnLoad) {
    return (
      <Text fw={700} c="red" size="lg">
        Sorry, you are removed from the study. You failed several attention checks.
      </Text>
    );
  }

  return (
    <Group align="flex-start" gap="xl" wrap="nowrap">
      <Box style={{ flexShrink: 0 }}>
        <img
          src={import.meta.env.BASE_URL + parameters.imagePath}
          alt="Distribution chart"
          style={{ width: DISPLAY_WIDTH, display: 'block' }}
        />
      </Box>

      <Stack gap="lg" style={{ minWidth: 260, paddingTop: 200 }}>
        <Text fw={600}>Which group has the higher median?</Text>

        <Stack gap="sm">
          {(['A', 'B', 'C'] as const).map((option) => (
            <Button
              key={option}
              variant={selected === option ? 'filled' : 'outline'}
              onClick={() => handleSelect(option)}
            >
              {option}
            </Button>
          ))}
        </Stack>

        {parameters.debugShowScore && (
          <Text size="sm" fw={700} c="grape">
            [DEBUG] Points: {performanceScoreState.task4[parameters.imagePath] ?? 0} / 1
          </Text>
        )}
      </Stack>
    </Group>
  );
}