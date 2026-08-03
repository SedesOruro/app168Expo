import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

function createGradient(color1: string, color2: string) {
    return `linear-gradient(to bottom, ${color1}, ${color2})`;
}

// SETUP COLORS
const GREY = {
    0: '#FFFFFF',
    100: '#F9FAFB',
    200: '#F4F6F8',
    300: '#DFE3E8',
    400: '#C4CDD5',
    500: '#919EAB',
    600: '#637381',
    700: '#454F5B',
    800: '#212B36',
    900: '#161C24',
    500_8: alpha('#919EAB', 0.08),
    500_12: alpha('#919EAB', 0.12),
    500_16: alpha('#919EAB', 0.16),
    500_24: alpha('#919EAB', 0.24),
    500_32: alpha('#919EAB', 0.32),
    500_48: alpha('#919EAB', 0.48),
    500_56: alpha('#919EAB', 0.56),
    500_80: alpha('#919EAB', 0.8)
};

const PRIMARY = {
    lighter: '#ECEFF1',
    light: '#B0BEC5',
    main: '#607D8B',
    dark: '#455A64',
    darker: '#263238',
    contrastText: '#fff'
};

const SECONDARY = {
    lighter: '#E8EAF6',
    light: '#9FA8DA',
    main: '#5C6BC0',
    dark: '#303F9F',
    darker: '#1A237E',
    contrastText: '#fff'
};

const INFO = {
    lighter: '#E3F2FD',
    light: '#64B5F6',
    main: '#2196F3',
    dark: '#1976D2',
    darker: '#0D47A1',
    contrastText: '#fff'
};

const SUCCESS = {
    lighter: '#E0F2F1',
    light: '#80CBC4',
    main: '#26A69A',
    dark: '#00796B',
    darker: '#004D40',
    contrastText: GREY[800]
};

const WARNING = {
    lighter: '#FFF3E0',
    light: '#FFB74D',
    main: '#FF9800',
    dark: '#F57C00',
    darker: '#E65100',
    contrastText: GREY[800]
};

const ERROR = {
    lighter: '#FFEBEB',
    light: '#FFADAD',
    main: '#FF4747',
    dark: '#F50000',
    darker: '#660000',
    contrastText: '#fff'
};

const GRADIENTS = {
    primary: createGradient(PRIMARY.light, PRIMARY.main),
    info: createGradient(INFO.light, INFO.main),
    success: createGradient(SUCCESS.light, SUCCESS.main),
    warning: createGradient(WARNING.light, WARNING.main),
    error: createGradient(ERROR.light, ERROR.main)
};

const CHART_COLORS = {
    violet: ['#826AF9', '#9E86FF', '#D0AEFF', '#F7D2FF'],
    blue: ['#2D99FF', '#83CFFF', '#A5F3FF', '#CCFAFF'],
    green: ['#2CD9C5', '#60F1C8', '#A4F7CC', '#C0F2DC'],
    yellow: ['#FFE700', '#FFEF5A', '#FFF7AE', '#FFF3D6'],
    red: ['#FF6C40', '#FF8F6D', '#FFBD98', '#FFE7D9']
};

export const getPalette = (mode: 'light' | 'dark') => {
    const isDark = mode === 'dark';

    return {
    common: { black: '#000', white: '#fff' },
    mode,
    primary: { ...PRIMARY },
    secondary: { ...SECONDARY },
    info: { ...INFO },
    success: { ...SUCCESS },
    warning: { ...WARNING },
    error: { ...ERROR },
    grey: GREY,
    gradients: GRADIENTS,
    chart: CHART_COLORS,
    divider: isDark ? alpha(GREY[500], 0.24) : GREY[500_24],
    text: isDark
        ? { primary: GREY[100], secondary: GREY[300], tertiary: GREY[400], disabled: GREY[600] }
        : { primary: GREY[800], secondary: GREY[700], tertiary: GREY[600], disabled: GREY[400] },
    background: isDark
        ? { paper: GREY[800], default: GREY[900], neutral: alpha(GREY[500], 0.16) }
        : { paper: '#fff', default: GREY[100], neutral: GREY[200] },
    action: {
        active: isDark ? GREY[300] : GREY[600],
        hover: GREY[500_8],
        selected: GREY[500_16],
        disabled: GREY[500_80],
        disabledBackground: GREY[500_24],
        focus: GREY[500_24],
        hoverOpacity: 0.08,
        disabledOpacity: 0.48
    }
};
};

const palette = getPalette('light');

export default palette;
