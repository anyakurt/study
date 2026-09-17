import { useEffect, useRef, useState } from 'react';
import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { StimulusParams } from '../../../../src/store/types';
import { countFailures } from './attentionCheckState';
import { performanceScoreState } from './performanceScoreState';

interface RangeClickRecord {
  pixelX: number;
  pixelY: number;
  dataValue: number;
  [key: string]: number;
}

// Each slot (min/max) is either a real click, the string 'idk' (an honest
// "I don't know" for that specific value), or null (not yet answered).
type SlotState = RangeClickRecord | 'idk' | null;

interface ClickToSelectRangeParams {
  imagePath: string;
  imageWidth: number;
  imageHeight: number;
  plotAreaLeftPx: number;
  plotAreaRightPx: number;
  domainMin: number;
  domainMax: number;
  correctMinLow: number;
  correctMinHigh: number;
  correctMaxLow: number;
  correctMaxHigh: number;
  debugShowScore?: boolean;
}

function pixelToDataValue(pixelX: number, params: ClickToSelectRangeParams): number {
  const { plotAreaLeftPx, plotAreaRightPx, domainMin, domainMax } = params;
  const fraction = (pixelX - plotAreaLeftPx) / (plotAreaRightPx - plotAreaLeftPx);
  return domainMin + fraction * (domainMax - domainMin);
}

// Silent scoring: up to 2 points (1 for min, 1 for max). A slot only scores
// if it's a real click within its acceptable range -- 'idk' and null both
// score 0, same as an incorrect click, but 'idk' is stored as its own
// distinct value so analysis can tell an honest non-answer apart from a
// genuine wrong guess.
function scoreRangeAnswer(params: ClickToSelectRangeParams, min: SlotState, max: SlotState): number {
  let points = 0;
  if (min !== null && min !== 'idk' && min.dataValue >= params.correctMinLow && min.dataValue <= params.correctMinHigh) {
    points += 1;
  }
  if (max !== null && max !== 'idk' && max.dataValue >= params.correctMaxLow && max.dataValue <= params.correctMaxHigh) {
    points += 1;
  }
  return points;
}

// Same display width convention as ClickToSelect.tsx (Task 1). The click-
// coordinate math scales against this via getBoundingClientRect(), so this
// number is always safe to change on its own.
const DISPLAY_WIDTH = 650;

export default function ClickToSelectRange({ parameters, setAnswer }: StimulusParams<ClickToSelectRangeParams>) {
  const [minSlot, setMinSlot] = useState<SlotState>(null);
  const [maxSlot, setMaxSlot] = useState<SlotState>(null);
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

  const isComplete = minSlot !== null && maxSlot !== null;
  const currentPrompt = minSlot === null
    ? 'Click on the MINIMUM value in the dataset.'
    : maxSlot === null
      ? 'Click on the MAXIMUM value in the dataset.'
      : 'Both values recorded.';

  const toStoredValue = (slot: SlotState) => (slot === null || slot === 'idk' ? null : slot);
  const isIdk = (slot: SlotState) => slot === 'idk';

  const reportAnswer = (nextMin: SlotState, nextMax: SlotState) => {
    performanceScoreState.task2[parameters.imagePath] = (nextMin !== null && nextMax !== null)
      ? scoreRangeAnswer(parameters, nextMin, nextMax)
      : 0;

    setAnswer({
      status: nextMin !== null && nextMax !== null,
      answers: {
        minimumClick: toStoredValue(nextMin),
        maximumClick: toStoredValue(nextMax),
        minimumIdk: isIdk(nextMin),
        maximumIdk: isIdk(nextMax),
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

    if (minSlot === null) {
      setMinSlot(record);
      reportAnswer(record, maxSlot);
    } else {
      setMaxSlot(record);
      reportAnswer(minSlot, record);
    }
  };

  // Marks whichever slot is currently being asked for (min first, then
  // max) as an honest "I don't know", same as a click would fill it.
  const handleIdk = () => {
    if (isComplete) {
      return;
    }
    if (minSlot === null) {
      setMinSlot('idk');
      reportAnswer('idk', maxSlot);
    } else {
      setMaxSlot('idk');
      reportAnswer(minSlot, 'idk');
    }
  };

  const handleResetMin = () => {
    setMinSlot(null);
    reportAnswer(null, maxSlot);
  };

  const handleResetMax = () => {
    setMaxSlot(null);
    reportAnswer(minSlot, null);
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
        {minSlot !== null && minSlot !== 'idk' && (
          <>
            <Box
              style={{
                position: 'absolute',
                left: (minSlot.pixelX / parameters.imageWidth) * 100 + '%',
                top: (minSlot.pixelY / parameters.imageHeight) * 100 + '%',
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
                left: (minSlot.pixelX / parameters.imageWidth) * 100 + '%',
                top: (minSlot.pixelY / parameters.imageHeight) * 100 + '%',
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
        {maxSlot !== null && maxSlot !== 'idk' && (
          <>
            <Box
              style={{
                position: 'absolute',
                left: (maxSlot.pixelX / parameters.imageWidth) * 100 + '%',
                top: (maxSlot.pixelY / parameters.imageHeight) * 100 + '%',
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
                left: (maxSlot.pixelX / parameters.imageWidth) * 100 + '%',
                top: (maxSlot.pixelY / parameters.imageHeight) * 100 + '%',
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
          {minSlot === null && (
            <>
              Click on the <Text component="span" c="blue" fw={700}>MINIMUM</Text> value in the dataset.
            </>
          )}
          {minSlot !== null && maxSlot === null && (
            <>
              Click on the <Text component="span" c="red" fw={700}>MAXIMUM</Text> value in the dataset.
            </>
          )}
          {minSlot !== null && maxSlot !== null && 'Both values recorded.'}
        </Text>

        {!isComplete && (
          <Stack gap="xs">
            <Text size="sm">If you don&apos;t know please press the button:</Text>
            <Button variant="outline" size="xs" onClick={handleIdk} style={{ alignSelf: 'flex-start' }}>
              I don&apos;t know
            </Button>
          </Stack>
        )}

        {minSlot === 'idk' && (
          <Text size="sm" c="dimmed">Minimum: you selected &quot;I don&apos;t know&quot;</Text>
        )}
        {maxSlot === 'idk' && (
          <Text size="sm" c="dimmed">Maximum: you selected &quot;I don&apos;t know&quot;</Text>
        )}

        <Stack gap="md">
          {minSlot !== null && (
            <Stack gap="xs">
              <Text size="sm">If you want to reselect MIN click:</Text>
              <Button variant="outline" size="xs" onClick={handleResetMin} style={{ alignSelf: 'flex-start' }}>
                Reset minimum
              </Button>
            </Stack>
          )}
          {maxSlot !== null && (
            <Stack gap="xs">
              <Text size="sm">If you want to reselect MAX click:</Text>
              <Button variant="outline" size="xs" onClick={handleResetMax} style={{ alignSelf: 'flex-start' }}>
                Reset maximum
              </Button>
            </Stack>
          )}

          {parameters.debugShowScore && (
            <Text size="sm" fw={700} c="grape">
              [DEBUG] Points: {performanceScoreState.task2[parameters.imagePath] ?? 0} / 2
            </Text>
          )}
        </Stack>
      </Stack>
    </Group>
  );
}