export const Colors = {
  // Backgrounds
  bg: {
    primary:  '#0a0a12',
    secondary: '#10101c',
    card:     '#14142a',
    elevated: '#1a1a2e',
    input:    '#12121f',
  },
  // Borders
  border: {
    default: '#1e1e3a',
    subtle:  '#14142a',
    focus:   '#6366f1',
  },
  // Text
  text: {
    primary:   '#e2e8f0',
    secondary: '#8892a4',
    muted:     '#475569',
    inverse:   '#0a0a12',
  },
  // Brand
  brand: {
    primary: '#6366f1',
    light:   '#818cf8',
    dim:     '#1e1b4b',
    glow:    'rgba(99, 102, 241, 0.15)',
  },
  // Semantic
  success: '#22c55e',
  successDim: 'rgba(34, 197, 94, 0.12)',
  danger:  '#ef4444',
  dangerDim: 'rgba(239, 68, 68, 0.12)',
  warning: '#f59e0b',
  warningDim: 'rgba(245, 158, 11, 0.12)',
  // Blockchain brand colors
  chain: {
    ethereum: '#627eea',
    bitcoin:  '#f7931a',
    solana:   '#9945ff',
  },
} as const;

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;

export const FontSize = {
  xs:  11,
  sm:  13,
  md:  15,
  lg:  17,
  xl:  20,
  xxl: 26,
  h1:  32,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium:  '500' as const,
  semibold:'600' as const,
  bold:    '700' as const,
  black:   '800' as const,
} as const;
