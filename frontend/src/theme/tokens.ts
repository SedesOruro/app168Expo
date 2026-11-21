/** Mismas escalas que la app movil (src/shared/theme). */
export const radius = { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

export const spacing = { none: 0, xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 40 } as const;

/** Sombras de la app (shadowColor #17262A) traducidas a box-shadow CSS. */
export const shadows = {
  sm: '0 2px 6px rgba(23, 38, 42, 0.08)',
  md: '0 6px 12px rgba(23, 38, 42, 0.12)',
  lg: '0 10px 18px rgba(23, 38, 42, 0.16)',
} as const;
