import { useEffect, useState } from 'react';
import { Box, Group, Radio, Stack, Text } from '@mantine/core';
import { StimulusParams } from '../../../../src/store/types';
import { attentionCheckResults } from './attentionCheckState';

interface AttentionCheckPostAVLATParams {
  imagePath: string;
}

const DISPLAY_WIDTH = 650;

const OPTIONS = [
  { value: 'A', label: 'Tokyo' },
  { value: 'B', label: 'New York City' },
  { value: 'C', label: 'Beijing' },
  { value: 'D', label: 'London' },
  { value: 'E', label: 'Skip' },
];

const CORRECT_VALUE = 'B';

export default function AttentionCheckPostAVLAT({ parameters, setAnswer }: StimulusParams<AttentionCheckPostAVLATParams>) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setAnswer({
      status: false,
      answers: { correct: null, selected: null },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (value: string) => {
    const correct = value === CORRECT_VALUE;
    attentionCheckResults.postAVLAT = correct;
    setSelected(value);

    setAnswer({
      status: true,
      answers: { correct, selected: value },
    });
  };

  return (
    <Group align="flex-start" gap="xl" wrap="nowrap">
      <Box style={{ flexShrink: 0 }}>
        <img
          src={import.meta.env.BASE_URL + parameters.imagePath}
          alt="Bubble chart"
          style={{ width: DISPLAY_WIDTH, display: 'block' }}
        />
      </Box>

      <Stack gap="lg" style={{ minWidth: 260, paddingTop: 4 }}>
        <Text fw={600}>
          Select the city labeled &quot;New York City&quot; below. This is an attention check.
        </Text>

        <Radio.Group value={selected} onChange={handleSelect}>
          <Stack gap="xs">
            {OPTIONS.map((option) => (
              <Radio
                key={option.value}
                value={option.value}
                label={`${option.value}. ${option.label}`}
              />
            ))}
          </Stack>
        </Radio.Group>
      </Stack>
    </Group>
  );
}