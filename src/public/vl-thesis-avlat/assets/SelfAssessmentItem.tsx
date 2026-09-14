import { useEffect, useState } from 'react';
import { Box, Group, Stack, Text } from '@mantine/core';
import { StimulusParams } from '../../../../src/store/types';

interface SelfAssessmentItemParams {
  imagePath?: string;
  promptText: string;
  leftLabel: string;
  rightLabel: string;
  responseId: string;
}

const DISPLAY_WIDTH = 450;
const SCALE_VALUES = [1, 2, 3, 4, 5, 6];

export default function SelfAssessmentItem({ parameters, setAnswer }: StimulusParams<SelfAssessmentItemParams>) {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    setAnswer({
      status: false,
      answers: { [parameters.responseId]: null },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (value: number) => {
    setSelected(value);
    setAnswer({
      status: true,
      answers: { [parameters.responseId]: value },
    });
  };

  return (
    <Group align="flex-start" gap="xl" wrap="nowrap">
      {parameters.imagePath && (
        <Box style={{ flexShrink: 0 }}>
          <img
            src={import.meta.env.BASE_URL + parameters.imagePath}
            alt="Chart example"
            style={{ width: DISPLAY_WIDTH, display: 'block' }}
          />
        </Box>
      )}

      <Stack gap="lg" style={{ minWidth: 260, paddingTop: 4 }}>
        <Text fw={600}>{parameters.promptText}</Text>

        <Stack gap="xs">
          <Group gap="md" wrap="nowrap">
            {SCALE_VALUES.map((value) => (
              <Stack key={value} gap={4} align="center">
                <Text size="xs">{value}</Text>
                <Box
                  onClick={() => handleSelect(value)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: '2px solid #495057',
                    backgroundColor: selected === value ? '#495057' : 'transparent',
                    cursor: 'pointer',
                  }}
                />
              </Stack>
            ))}
          </Group>
          <Group justify="space-between" style={{ width: '100%' }}>
            <Text size="sm" c="dimmed">{parameters.leftLabel}</Text>
            <Text size="sm" c="dimmed">{parameters.rightLabel}</Text>
          </Group>
        </Stack>
      </Stack>
    </Group>
  );
}