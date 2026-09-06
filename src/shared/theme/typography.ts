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

/**
 * Los tokens de `typography` son cadenas CSS y solo sirven dentro de
 * styled-components. Las pantallas usan `StyleSheet.create`, que necesita objetos,
 * asi que aqui va la version equivalente. Los dos exports describen la misma escala;
 * si se cambia un tamano hay que cambiarlo en ambos.
 *
 * Importante: React Native no sintetiza pesos sobre fuentes personalizadas. Poner
 * `fontWeight: '900'` junto a WorkSans no da negrita, simplemente se ignora o cae a
 * la fuente del sistema. El peso se elige con la familia, nunca con `fontWeight`.
 */
export const estilosTexto = {
  display: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    lineHeight: 40,
  },
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
  },
  h2: {
    fontFamily: fontFamily.semiBold,
    fontSize: 22,
    lineHeight: 28,
  },
  h3: {
    fontFamily: fontFamily.semiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  bodyStrong: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  },
} as const;

export type AppEstilosTexto = typeof estilosTexto;
