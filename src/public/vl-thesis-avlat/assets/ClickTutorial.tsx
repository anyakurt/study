import { useEffect, useState } from 'react';
import { Box, Group, Stack, Text } from '@mantine/core';
import { StimulusParams } from '../../../../src/store/types';

interface ClickTutorialParams {
  imagePath: string;
  imageWidth: number;
  imageHeight: number;
  targetXMinPx: number;
  targetXMaxPx: number;
  targetYMinPx: number;
  targetYMaxPx: number;
  targetLabel: string;
}

interface ClickRecord {
  pixelX: number;
  pixelY: number;
}

const DISPLAY_WIDTH = 450;

// Tutorial-only component: unlike every real trial in this study, this one
// shows immediate correctness feedback and allows unlimited retries. The
// point here is teaching the click mechanic itself, not measuring anything.
export default function ClickTutorial({ parameters, setAnswer }: StimulusParams<ClickTutorialParams>) {
  const [lastClick, setLastClick] = useState<ClickRecord | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [everCorrect, setEverCorrect] = useState(false);

  useEffect(() => {
    setAnswer({
      status: false,
      answers: { tutorialCompleted: false },
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

    setLastClick({ pixelX, pixelY });
    setLastCorrect(correct);

    if (correct) {
      setEverCorrect(true);
      setAnswer({
        status: true,
        answers: { tutorialCompleted: true },
      });
    }
  };

  return (
    <Group align="flex-start" gap="xl" wrap="nowrap">
      <Box style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
        <img
          src={import.meta.env.BASE_URL + parameters.imagePath}
          alt="Practice chart"
          onClick={handleImageClick}
          style={{ cursor: 'crosshair', width: DISPLAY_WIDTH, display: 'block' }}
        />
        {lastClick && (
          <Box
            style={{
              position: 'absolute',
              left: (lastClick.pixelX / parameters.imageWidth) * 100 + '%',
              top: (lastClick.pixelY / parameters.imageHeight) * 100 + '%',
              width: 10,
              height: 10,
              marginLeft: -5,
              marginTop: -5,
              borderRadius: '50%',
              border: lastCorrect ? '2px solid green' : '2px solid #f55520',
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>

      <Stack gap="lg" style={{ minWidth: 260, paddingTop: 4 }}>
        <Text fw={600}>
          Before you start, let&apos;s make sure the click tool is clear.
        </Text>
        <Text>
          Click on slice {parameters.targetLabel} in the chart.
        </Text>

        {lastCorrect === true && (
          <Text fw={700} c="green">Correct! You can move on whenever you&apos;re ready.</Text>
        )}
        {lastCorrect === false && (
          <Text fw={700} c="orange">Not quite — try clicking again.</Text>
        )}
        {everCorrect && lastCorrect === false && (
          <Text size="sm" c="dimmed">
            Your earlier correct click still counts, but feel free to keep practicing or move on :)
          </Text>
        )}
      </Stack>
    </Group>
  );
}