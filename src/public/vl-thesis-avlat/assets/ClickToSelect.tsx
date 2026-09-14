import { useEffect, useRef, useState } from 'react';
import { Box, Button, Checkbox, Group, Stack, Text } from '@mantine/core';
import { StimulusParams } from '../../../../src/store/types';
import { countFailures } from './attentionCheckState';

interface ClickRecord {
  pixelX: number;
  pixelY: number;
  dataValue: number;
  [key: string]: number;
}

interface ClickToSelectParams {
  imagePath: string;
  imageWidth: number;
  imageHeight: number;
  plotAreaLeftPx: number;
  plotAreaRightPx: number;
  domainMin: number;
  domainMax: number;
  allowNoOutliers: boolean;
  maxClicks: number;
  clickLabel?: string;
}

function pixelToDataValue(pixelX: number, params: ClickToSelectParams): number {
  const { plotAreaLeftPx, plotAreaRightPx, domainMin, domainMax } = params;
  const fraction = (pixelX - plotAreaLeftPx) / (plotAreaRightPx - plotAreaLeftPx);
  return domainMin + fraction * (domainMax - domainMin);
}

// Display width for the chart image. The click-coordinate math scales
// against this via getBoundingClientRect(), so changing this number alone
// is always safe -- it never throws off the pixel-to-data conversion.
const DISPLAY_WIDTH = 650;

export default function ClickToSelect({ parameters, setAnswer }: StimulusParams<ClickToSelectParams>) {
  const [clicks, setClicks] = useState<ClickRecord[]>([]);
  const [noOutliersPressed, setNoOutliersPressed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Frozen at mount: if a prior attention check already failed twice by the
  // time this trial loads, this screen shows the exclusion message instead
  // of the real trial, and never lets the participant answer it.
  const [excludedOnLoad] = useState(() => countFailures() >= 2);

  useEffect(() => {
    setAnswer({
      status: false,
      answers: { clicks: [], noOutliersPressed: false, excludedOnLoad },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    

    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = parameters.imageWidth / rect.width;
    const scaleY = parameters.imageHeight / rect.height;
    const pixelX = (event.clientX - rect.left) * scaleX;
    const pixelY = (event.clientY - rect.top) * scaleY;

    const dataValue = pixelToDataValue(pixelX, parameters);

    const newClicks = [{ pixelX, pixelY, dataValue }];
    setClicks(newClicks);
    setNoOutliersPressed(false);

    setAnswer({
      status: newClicks.length >= parameters.maxClicks || parameters.allowNoOutliers === false,
      answers: {
        clicks: newClicks,
        noOutliersPressed: false,
      },
    });
  };

  // Checking the box and clicking the chart are mutually exclusive answers,
  // so toggling the box on clears any click, and toggling it off clears the
  // "no outliers" selection and re-enables clicking.
  const handleNoOutliersToggle = (checked: boolean) => {
    setNoOutliersPressed(checked);
    if (checked) {
      setClicks([]);
      setAnswer({
        status: true,
        answers: {
          clicks: [],
          noOutliersPressed: true,
        },
      });
    } else {
      setAnswer({
        status: false,
        answers: {
          clicks: [],
          noOutliersPressed: false,
        },
      });
    }
  };

  const handleReset = () => {
    setClicks([]);
    setAnswer({
      status: false,
      answers: {
        clicks: [],
        noOutliersPressed: false,
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
      <Box style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
        <img
          ref={imgRef}
          src={import.meta.env.BASE_URL + parameters.imagePath}
          alt="Distribution chart"
          onClick={handleImageClick}
          style={{
            cursor: clicks.length >= parameters.maxClicks ? 'default' : 'crosshair',
            width: DISPLAY_WIDTH,
            display: 'block',
          }}
        />
        {clicks.map((click, i) => (
          <Box
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            style={{
              position: 'absolute',
              left: (click.pixelX / parameters.imageWidth) * 100 + '%',
              top: (click.pixelY / parameters.imageHeight) * 100 + '%',
              width: 10,
              height: 10,
              marginLeft: -5,
              marginTop: -5,
              borderRadius: '50%',
              border: '2px solid #f55520',
              pointerEvents: 'none',
            }}
          />
        ))}
      </Box>

      <Stack gap="lg" style={{ minWidth: 260, paddingTop: 200 }}>
        <Text fw={600}>
          Click on the outlier that lies furthest outside the rest of the data.
        </Text>

        <Stack gap="xs">
          <Text fw={600}>
            <Text component="span" c="red" fw={700}>* </Text>
            If there are none, check the box:
          </Text>

          {parameters.allowNoOutliers && (
            <Checkbox
              label="No outliers"
              checked={noOutliersPressed}
              onChange={(event) => handleNoOutliersToggle(event.currentTarget.checked)}
              disabled={clicks.length > 0}
              style={{ alignSelf: 'flex-start' }}
            />
          )}

          <Text size="sm" c="dimmed" style={{ paddingTop: 40 }}>
            {noOutliersPressed
              ? 'You selected "No Outliers"'
              : clicks.length > 0 ? (
                  <Text size="sm" c="dimmed">
                    {clicks.length} of {parameters.maxClicks} click{parameters.maxClicks > 1 ? 's' : ''} recorded.
                  </Text>
                ) : null}
          </Text>

          {clicks.length > 0 && (
            <Button variant= "light" size="xs" onClick={handleReset} style={{ alignSelf: 'flex-start' }}>
              Reset
            </Button>
          )}
        </Stack>
      </Stack>
    </Group>
  );
}