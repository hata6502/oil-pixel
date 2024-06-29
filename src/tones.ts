export type ToneType = keyof typeof tones;

export const tonePeriod = 4;

export const tones = {
  fill: {
    bitmap: [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
    ],
  },
  dotBold: {
    bitmap: [
      [1, 1, 1, 1],
      [0, 1, 0, 1],
      [1, 1, 1, 1],
      [0, 1, 0, 1],
    ],
  },
  dotMedium: {
    bitmap: [
      [1, 0, 1, 0],
      [0, 1, 0, 1],
      [1, 0, 1, 0],
      [0, 1, 0, 1],
    ],
  },
  dotLight: {
    bitmap: [
      [1, 0, 1, 0],
      [0, 0, 0, 0],
      [1, 0, 1, 0],
      [0, 0, 0, 0],
    ],
  },
  slashBold: {
    bitmap: [
      [1, 1, 1, 0],
      [1, 1, 0, 1],
      [1, 0, 1, 1],
      [0, 1, 1, 1],
    ],
  },
  slashLight: {
    bitmap: [
      [1, 0, 0, 0],
      [0, 0, 0, 1],
      [0, 0, 1, 0],
      [0, 1, 0, 0],
    ],
  },
  backslashBold: {
    bitmap: [
      [1, 1, 1, 0],
      [0, 1, 1, 1],
      [1, 0, 1, 1],
      [1, 1, 0, 1],
    ],
  },
  backslashLight: {
    bitmap: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ],
  },
  horizontalBold: {
    bitmap: [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
  },
  horizontalMedium: {
    bitmap: [
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
  },
  horizontalLight: {
    bitmap: [
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  verticalBold: {
    bitmap: [
      [1, 1, 1, 0],
      [1, 1, 1, 0],
      [1, 1, 1, 0],
      [1, 1, 1, 0],
    ],
  },
  verticalMedium: {
    bitmap: [
      [1, 0, 1, 0],
      [1, 0, 1, 0],
      [1, 0, 1, 0],
      [1, 0, 1, 0],
    ],
  },
  verticalLight: {
    bitmap: [
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
    ],
  },
};
