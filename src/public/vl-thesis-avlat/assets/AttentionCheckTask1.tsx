import { useEffect, useState } from 'react';
import { Box, Group, Stack, Text } from '@mantine/core';
import { StimulusParams } from '../../../../src/store/types';
import { attentionCheckResults } from './attentionCheckState';

interface AttentionCheckTask1Params {
  imagePath: string;
  imageWidth: number;
  imageHeight: number;
  targetXMinPx: number;
  targetXMaxPx: number;
  targetYMinPx: number;
  targetYMaxPx: number;
}

interface ClickRecord {
  pixelX: number;
  pixelY: number;
}

const DISPLAY_WIDTH = 650;

// This check can never arrive already-excluded: it is the second of three
// checks chronologically, and only the first (post-A-VLAT) could have
// failed before it, so the running failure count here is at most 1. It
// therefore never needs an on-load exclusion gate. Its own outcome is
// recorded normally, and if it happens to push the total to two, that is
// revealed on whichever screen the participant lands on next, not here.
export default function AttentionCheckTask1({ parameters, setAnswer }: StimulusParams<AttentionCheckTask1Params>) {
  const [click, setClick] = useState<ClickRecord | null>(null);

  useEffect(() => {
    setAnswer({
      status: false,
      answers: { correct: null },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = parameters.imageWidth / rect.width;
    const scaleY = parameters.imageHeight / rect.height;
    const pixelX = (event.clientX - rect.left) * scaleX;
    const pixelY = (event.clientY - rect.top) * scaleY;

    const correct = pixelX >= parameters.targetXMinPx
      && pixelX <= parameters.targetXMaxPx
      && pixelY >= parameters.targetYMinPx
      && pixelY <= parameters.targetYMaxPx;

    attentionCheckResults.task1 = correct;
    setClick({ pixelX, pixelY });

    setAnswer({
      status: true,
      answers: { correct, pixelX, pixelY },
    });
  };

  return (
    <Group align="flex-start" gap="xl" wrap="nowrap">
      <Box style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
        <img
          src={import.meta.env.BASE_URL + parameters.imagePath}
          alt="Chart with axis labels"
          onClick={handleImageClick}
          style={{
            cursor: 'crosshair',
            width: DISPLAY_WIDTH,
            display: 'block',
          }}
        />
        {click && (
          <Box
            style={{
              position: 'absolute',
              left: (click.pixelX / parameters.imageWidth) * 100 + '%',
              top: (click.pixelY / parameters.imageHeight) * 100 + '%',
              width: 10,
              height: 10,
              marginLeft: -5,
              marginTop: -5,
              borderRadius: '50%',
              border: '2px solid red',
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>

      <Stack gap="lg" style={{ minWidth: 260, paddingTop: 200 }}>
        <Text fw={600}>
          Click on the number &quot;20&quot; on the chart. This is an attention check. 
        </Text>
      </Stack>
    </Group>
  );
}