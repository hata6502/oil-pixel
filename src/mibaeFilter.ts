import Color from "color";
import * as colorDiff from "color-diff";

import { palettes } from "./palettes";
import { ToneType, tonePeriod, tones } from "./tones";

export function* mibaeFilter(image: HTMLImageElement) {
  console.time("mibaeFilter");

  const canvasElement = document.createElement("canvas");
  const normalizeZoom = Math.min(
    Math.sqrt((640 * 360) / (image.naturalWidth * image.naturalHeight)),
    1
  );
  canvasElement.width = image.naturalWidth * normalizeZoom;
  canvasElement.height = image.naturalHeight * normalizeZoom;
  const canvasContext = canvasElement.getContext("2d", {
    willReadFrequently: true,
  });
  if (!canvasContext) {
    throw new Error("Canvas is not a 2D context");
  }
  canvasContext.fillStyle = "#ffffff";
  canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
  canvasContext.drawImage(
    image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  const density = 2;
  const shrinkedCanvasElement = document.createElement("canvas");
  shrinkedCanvasElement.width = canvasElement.width / density;
  shrinkedCanvasElement.height = canvasElement.height / density;
  const shrinkedContext = shrinkedCanvasElement.getContext("2d", {
    willReadFrequently: true,
  });
  if (!shrinkedContext) {
    throw new Error("Canvas is not a 2D context");
  }
  shrinkedContext.imageSmoothingEnabled = false;
  shrinkedContext.drawImage(
    canvasElement,
    0,
    0,
    shrinkedCanvasElement.width,
    shrinkedCanvasElement.height
  );

  for (let y = 0; y < shrinkedCanvasElement.height; y++) {
    if (y % tonePeriod ** 2 === 0) {
      colorDiffCache.clear();
    }

    [...Array(shrinkedCanvasElement.width).keys()].forEach((x) => {
      const beginX = x - tonePeriod / 2;
      const beginY = y - tonePeriod / 2;

      const windowImageData = shrinkedContext.getImageData(
        beginX,
        beginY,
        tonePeriod,
        tonePeriod
      );

      const normalizedData = Uint8ClampedArray.from(windowImageData.data);
      const lightnesses = [];

      for (
        let dataIndex = 0;
        dataIndex < normalizedData.length;
        dataIndex += 4
      ) {
        // Out of canvas area.
        if (normalizedData[dataIndex + 3] !== 255) {
          continue;
        }

        const average = Color({
          r: normalizedData[dataIndex + 0],
          g: normalizedData[dataIndex + 1],
          b: normalizedData[dataIndex + 2],
        })
          .grayscale()
          .red();

        normalizedData[dataIndex + 0] =
          normalizedData[dataIndex + 1] =
          normalizedData[dataIndex + 2] =
          average;

        lightnesses.push(average);
      }

      const maxLightness = Math.max(...lightnesses);
      const minLightness = Math.min(...lightnesses);

      for (
        let dataIndex = 0;
        dataIndex < normalizedData.length;
        dataIndex += 4
      ) {
        // Out of canvas area.
        if (normalizedData[dataIndex + 3] !== 255) {
          continue;
        }

        normalizedData[dataIndex + 0] =
          normalizedData[dataIndex + 1] =
          normalizedData[dataIndex + 2] =
          ((normalizedData[dataIndex + 0] - minLightness) * 255) /
          (maxLightness - minLightness);
      }

      const offsetX = Math.abs(beginX % tonePeriod);
      const offsetY = Math.abs(beginY % tonePeriod);

      const { toneType } = getBestPattern({
        data: normalizedData,
        patterns: Object.keys(tones).map((toneType) => ({
          toneType: toneType as ToneType,
          backgroundColor: palettes.light[0],
          foregroundColor: palettes.dark[0],
          offsetY,
          offsetX,
        })),
      });
      const tone = tones[toneType];

      const { backgroundColor } = getBestPattern({
        data: windowImageData.data,
        patterns: colors.map((backgroundColor) => ({
          toneType,
          backgroundColor,
          foregroundColor: palettes.dark[0],
          offsetY,
          offsetX,
        })),
      });

      const { foregroundColor } = getBestPattern({
        data: windowImageData.data,
        patterns: colors.map((foregroundColor) => ({
          toneType,
          backgroundColor,
          foregroundColor,
          offsetY,
          offsetX,
        })),
      });

      const isForeground = tone.bitmap[y % tonePeriod][x % tonePeriod];

      canvasContext.fillStyle = isForeground
        ? foregroundColor
        : backgroundColor;

      canvasContext.fillRect(x * density, y * density, density, density);

      // Floyd–Steinberg dithering
      const [originalR, originalG, originalB] = shrinkedContext.getImageData(
        x,
        y,
        1,
        1
      ).data;

      const [putR, putG, putB] = canvasContext.getImageData(
        x * density,
        y * density,
        1,
        1
      ).data;

      ditheringPattern.forEach(({ deltaX, deltaY, rate }) => {
        const NeighborhoodImageData = shrinkedContext.getImageData(
          x + deltaX,
          y + deltaY,
          1,
          1
        );

        NeighborhoodImageData.data[0] += (originalR - putR) * rate;
        NeighborhoodImageData.data[1] += (originalG - putG) * rate;
        NeighborhoodImageData.data[2] += (originalB - putB) * rate;

        shrinkedContext.putImageData(
          NeighborhoodImageData,
          x + deltaX,
          y + deltaY
        );
      });
    });

    yield canvasElement.toDataURL();
  }

  console.timeEnd("mibaeFilter");
}

interface Pattern {
  toneType: ToneType;
  backgroundColor: string;
  foregroundColor: string;
  offsetY: number;
  offsetX: number;
}

const ditheringRate = 0.5;
const ditheringPattern = [
  {
    deltaX: 1,
    deltaY: 0,
    rate: (7 / 16) * ditheringRate,
  },
  {
    deltaX: -1,
    deltaY: 1,
    rate: (3 / 16) * ditheringRate,
  },
  {
    deltaX: 0,
    deltaY: 1,
    rate: (5 / 16) * ditheringRate,
  },
  {
    deltaX: 1,
    deltaY: 1,
    rate: (1 / 16) * ditheringRate,
  },
];

const colors = Object.values(palettes).flat();
const tonePeriodRange = [...Array(tonePeriod).keys()];

const patternImageDataCache = Object.fromEntries(
  Object.keys(tones).map((toneType) => {
    return [
      toneType,
      Object.fromEntries(
        colors.map((backgroundColor) => {
          return [
            backgroundColor,
            Object.fromEntries(
              colors.map((foregroundColor) => {
                return [
                  foregroundColor,
                  tonePeriodRange.map((_offsetY) => {
                    return tonePeriodRange.map((_offsetX) => {
                      return undefined as ImageData | undefined;
                    });
                  }),
                ];
              })
            ),
          ];
        })
      ),
    ];
  })
);

const getPatternImageData = ({
  toneType,
  backgroundColor,
  foregroundColor,
  offsetY,
  offsetX,
}: Pattern) => {
  const cachedPatternImageData =
    patternImageDataCache[toneType][backgroundColor][foregroundColor][offsetY][
    offsetX
    ];

  if (cachedPatternImageData) {
    return cachedPatternImageData;
  }

  const tone = tones[toneType];
  const data: number[] = [];

  tonePeriodRange.forEach((y) => {
    tonePeriodRange.forEach((x) => {
      const isForeground =
        tone.bitmap[(y + offsetY) % tonePeriod][(x + offsetX) % tonePeriod];

      const color = isForeground ? foregroundColor : backgroundColor;

      data.push(...Color(color).rgb().array(), 255);
    });
  });

  const patternImageData = new ImageData(
    new Uint8ClampedArray(data),
    tonePeriod,
    tonePeriod
  );

  patternImageDataCache[toneType][backgroundColor][foregroundColor][offsetY][
    offsetX
  ] = patternImageData;

  return patternImageData;
};

const colorDiffCache = new Map<string, number>();
const getBestPattern = ({
  data,
  patterns,
}: {
  data: Uint8ClampedArray;
  patterns: Pattern[];
}) => {
  let bestPattern = patterns[0];
  let bestPatternDistance = Infinity;

  patterns.forEach((pattern) => {
    let distance = 0;

    for (let dataIndex = 0; dataIndex < data.length; dataIndex += 4) {
      // Out of canvas area.
      if (data[dataIndex + 3] !== 255) {
        continue;
      }

      const patternImageData = getPatternImageData(pattern);

      const colorDiffKey = [
        data[dataIndex + 0],
        data[dataIndex + 1],
        data[dataIndex + 2],
        patternImageData.data[dataIndex + 0],
        patternImageData.data[dataIndex + 1],
        patternImageData.data[dataIndex + 2],
      ].join("-");

      const diff =
        colorDiffCache.get(colorDiffKey) ??
        colorDiff.diff(
          colorDiff.rgb_to_lab({
            R: data[dataIndex + 0],
            G: data[dataIndex + 1],
            B: data[dataIndex + 2],
          }),
          colorDiff.rgb_to_lab({
            R: patternImageData.data[dataIndex + 0],
            G: patternImageData.data[dataIndex + 1],
            B: patternImageData.data[dataIndex + 2],
          })
        );

      colorDiffCache.set(colorDiffKey, diff);
      distance += diff;
      if (distance >= bestPatternDistance) {
        return;
      }
    }

    bestPattern = pattern;
    bestPatternDistance = distance;
  });

  return bestPattern;
};
