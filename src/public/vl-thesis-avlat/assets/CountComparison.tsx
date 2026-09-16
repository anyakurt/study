import { useEffect, useState } from 'react';
import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { StimulusParams } from '../../../store/types';
import { countFailures } from './attentionCheckState';
import { performanceScoreState } from './performanceScoreState';

interface CountComparisonParams {
  imagePath: string;
  splitValue: number;
  correctAnswer: boolean;
  debugShowScore?: boolean;
}

// Same display width convention as ClickToSelect.tsx / ClickToSelectRange.tsx.
const DISPLAY_WIDTH = 650;

export default function CountComparison({ parameters, setAnswer }: StimulusParams<CountComparisonParams>) {
  const [selected, setSelected] = useState<'True' | 'False' | null>(null);

  // Frozen at mount: if a prior attention check already failed twice by the
  // time this trial loads, this screen shows the exclusion message instead
  // of the real trial, and never lets the participant answer it.
  const [excludedOnLoad] = useState(() => countFailures() >= 2);

  useEffect(() => {
    setAnswer({
      status: false,
      answers: { countComparison: null, excludedOnLoad },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (choice: 'True' | 'False') => {
    setSelected(choice);

    const correct = (choice === 'True') === parameters.correctAnswer;
    performanceScoreState.task3[parameters.imagePath] = correct ? 1 : 0;

    setAnswer({
      status: true,
      answers: {
        countComparison: choice,
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
        <Text fw={600}>
          There are MORE data points to the RIGHT of {parameters.splitValue}.
        </Text>

        <Group gap="sm">
          <Button
            variant={selected === 'True' ? 'filled' : 'outline'}
            onClick={() => handleSelect('True')}
          >
            True
          </Button>
          <Button
            variant={selected === 'False' ? 'filled' : 'outline'}
            onClick={() => handleSelect('False')}
          >
            False
          </Button>
        </Group>

        {parameters.debugShowScore && (
          <Text size="sm" fw={700} c="grape">
            [DEBUG] Points: {performanceScoreState.task3[parameters.imagePath] ?? 0} / 1
          </Text>
        )}
      </Stack>
    </Group>
  );
}