export const animations = {
  fast: 180,
  normal: 320,
  slow: 520,
  entrance: 720,
  easing: {
    standard: [0.4, 0, 0.2, 1],
    emphasized: [0.2, 0, 0, 1],
  },
};

export type AppAnimationTokens = typeof animations;
