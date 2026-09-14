import { useEffect, useState } from 'react';
import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { StimulusParams } from '../../../../src/store/types';
import { attentionCheckResults, countFailures } from './attentionCheckState';

interface AttentionCheckTask4Params {
  imagePath: string;
}

// Same display width convention as MedianComparison.tsx, which this check
// is styled to match.
const DISPLAY_WIDTH = 450;

export default function AttentionCheckTask4({ parameters, setAnswer }: StimulusParams<AttentionCheckTask4Params>) {
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  // Frozen at mount: unlike Task 1's check, Task 4's check CAN legitimately
  // be reached already at two failures (post-A-VLAT + Task 1's check both
  // failed), so it needs its own on-load gate.
  const [excludedOnLoad] = useState(() => countFailures() >= 2);

  useEffect(() => {
    setAnswer({
      status: false,
      answers: { correct: null, choice: null, excludedOnLoad },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (choice: 'A' | 'B' | 'C' | 'D') => {
    if (excludedOnLoad) {
      return;
    }
    const correct = choice === 'C';
    attentionCheckResults.task4 = correct;
    setSelected(choice);

    setAnswer({
      status: true,
      answers: { correct, choice },
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
          Select the letter &quot;C&quot; below. This is an attention check.
        </Text>

        <Stack gap="sm">
          {(['A', 'B', 'C', 'D'] as const).map((option) => (
            <Button
              key={option}
              variant={selected === option ? 'filled' : 'outline'}
              onClick={() => handleSelect(option)}
            >
              {option}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Group>
  );
}