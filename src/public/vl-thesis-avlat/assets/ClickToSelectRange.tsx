import { useEffect, useRef, useState } from 'react';
import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { StimulusParams } from '../../../../src/store/types';
import { countFailures } from './attentionCheckState';

interface RangeClickRecord {
  pixelX: number;
  pixelY: number;
  dataValue: number;
  [key: string]: number;
}

interface ClickToSelectRangeParams {
  imagePath: string;
  imageWidth: number;
  imageHeight: number;
  plotAreaLeftPx: number;
  plotAreaRightPx: number;
  domainMin: number;
  domainMax: number;
}

function pixelToDataValue(pixelX: number, params: ClickToSelectRangeParams): number {
  const { plotAreaLeftPx, plotAreaRightPx, domainMin, domainMax } = params;
  const fraction = (pixelX - plotAreaLeftPx) / (plotAreaRightPx - plotAreaLeftPx);
  return domainMin + fraction * (domainMax - domainMin);
}

// Same display width convention as ClickToSelect.tsx (Task 1). The click-
// coordinate math scales against this via getBoundingClientRect(), so this
// number is always safe to change on its own.
const DISPLAY_WIDTH = 650;

export default function ClickToSelectRange({ parameters, setAnswer }: StimulusParams<ClickToSelectRangeParams>) {
  // Minimum and maximum are stored as two independent slots, not one array,
  // so resetting one never disturbs the other.
  const [minClick, setMinClick] = useState<RangeClickRecord | null>(null);
  const [maxClick, setMaxClick] = useState<RangeClickRecord | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Frozen at mount: if a prior attention check already failed twice by the
  // time this trial loads, this screen shows the exclusion message instead
  // of the real trial, and never lets the participant answer it.
  const [excludedOnLoad] = useState(() => countFailures() >= 2);

  useEffect(() => {
    setAnswer({
      status: false,
      answers: { minimumClick: null, maximumClick: null, excludedOnLoad },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isComplete = minClick !== null && maxClick !== null;
  const currentPrompt = minClick === null
    ? 'Click on the MINIMUM value in the dataset.'
    : maxClick === null
      ? 'Click on the MAXIMUM value in the dataset.'
      : 'Both values recorded.';

  const reportAnswer = (nextMin: RangeClickRecord | null, nextMax: RangeClickRecord | null) => {
    setAnswer({
      status: nextMin !== null && nextMax !== null,
      answers: {
        minimumClick: nextMin,
        maximumClick: nextMax,
      },
    });
  };

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (isComplete) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = parameters.imageWidth / rect.width;
    const scaleY = parameters.imageHeight / rect.height;
    const pixelX = (event.clientX - rect.left) * scaleX;
    const pixelY = (event.clientY - rect.top) * scaleY;
    const dataValue = pixelToDataValue(pixelX, parameters);
    const record = { pixelX, pixelY, dataValue };

    if (minClick === null) {
      setMinClick(record);
      reportAnswer(record, maxClick);
    } else {
      setMaxClick(record);
      reportAnswer(minClick, record);
    }
  };

  const handleResetMin = () => {
    setMinClick(null);
    reportAnswer(null, maxClick);
  };

  const handleResetMax = () => {
    setMaxClick(null);
    reportAnswer(minClick, null);
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
      <Box style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
        <img
          ref={imgRef}
          src={import.meta.env.BASE_URL + parameters.imagePath}
          alt="Distribution chart"
          onClick={handleImageClick}
          style={{
            cursor: isComplete ? 'default' : 'crosshair',
            width: DISPLAY_WIDTH,
            display: 'block',
          }}
        />
        {minClick && (
          <>
            <Box
              style={{
                position: 'absolute',
                left: (minClick.pixelX / parameters.imageWidth) * 100 + '%',
                top: (minClick.pixelY / parameters.imageHeight) * 100 + '%',
                width: 10,
                height: 10,
                marginLeft: -5,
                marginTop: -5,
                borderRadius: '50%',
                border: '2px solid blue',
                pointerEvents: 'none',
              }}
            />
            <Text
              size="xs"
              fw={700}
              style={{
                position: 'absolute',
                left: (minClick.pixelX / parameters.imageWidth) * 100 + '%',
                top: (minClick.pixelY / parameters.imageHeight) * 100 + '%',
                transform: 'translate(-50%, calc(-100% - 12px))',
                color: 'blue',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              MIN
            </Text>
          </>
        )}
        {maxClick && (
          <>
            <Box
              style={{
                position: 'absolute',
                left: (maxClick.pixelX / parameters.imageWidth) * 100 + '%',
                top: (maxClick.pixelY / parameters.imageHeight) * 100 + '%',
                width: 10,
                height: 10,
                marginLeft: -5,
                marginTop: -5,
                borderRadius: '50%',
                border: '2px solid red',
                pointerEvents: 'none',
              }}
            />
            <Text
              size="xs"
              fw={700}
              style={{
                position: 'absolute',
                left: (maxClick.pixelX / parameters.imageWidth) * 100 + '%',
                top: (maxClick.pixelY / parameters.imageHeight) * 100 + '%',
                transform: 'translate(-50%, calc(-100% - 12px))',
                color: 'red',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              MAX
            </Text>
          </>
        )}
      </Box>

      <Stack gap="lg" style={{ minWidth: 260, paddingTop: 200 }}>
        <Text fw={600}>
          {minClick === null && (
            <>
              Click on the <Text component="span" c="blue" fw={700}>MINIMUM</Text> value in the dataset.
            </>
          )}
          {minClick !== null && maxClick === null && (
            <>
              Click on the <Text component="span" c="red" fw={700}>MAXIMUM</Text> value in the dataset.
            </>
          )}
          {minClick !== null && maxClick !== null && 'Both values recorded.'}
        </Text>

        <Stack gap="md">
          {minClick && (
            <Stack gap="xs">
              <Text size="sm">If you want to reselect MIN click:</Text>
              <Button variant="outline" size="xs" onClick={handleResetMin} style={{ alignSelf: 'flex-start' }}>
                Reset minimum
              </Button>
            </Stack>
          )}
          {maxClick && (
            <Stack gap="xs">
              <Text size="sm">If you want to reselect MAX click:</Text>
              <Button variant="outline" size="xs" onClick={handleResetMax} style={{ alignSelf: 'flex-start' }}>
                Reset maximum
              </Button>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Group>
  );
}