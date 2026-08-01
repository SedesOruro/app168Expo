export const fontFamily = {
  regular: 'WorkSans-Regular',
  medium: 'WorkSans-Medium',
  semiBold: 'WorkSans-SemiBold',
  bold: 'WorkSans-Bold',
};

export const typography = {
  display: `
    font-family: ${fontFamily.bold};
    font-size: 32px;
    line-height: 40px;
  `,
  h1: `
    font-family: ${fontFamily.bold};
    font-size: 28px;
    line-height: 34px;
  `,
  h2: `
    font-family: ${fontFamily.semiBold};
    font-size: 22px;
    line-height: 28px;
  `,
  h3: `
    font-family: ${fontFamily.semiBold};
    font-size: 18px;
    line-height: 24px;
  `,
  body: `
    font-family: ${fontFamily.regular};
    font-size: 16px;
    line-height: 22px;
  `,
  bodyStrong: `
    font-family: ${fontFamily.semiBold};
    font-size: 16px;
    line-height: 22px;
  `,
  caption: `
    font-family: ${fontFamily.medium};
    font-size: 12px;
    line-height: 16px;
  `,
};

export type AppTypographyTokens = typeof typography;
