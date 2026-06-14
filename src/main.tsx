import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import './index.css';

const bodyFont = [
  'Inter',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
].join(',');

// One cohesive typeface (Inter) for an Apple/Linear-grade, consistent system.
const displayFont = bodyFont;

// Single brand gradient — reserved strictly for the primary AI action.
const BRAND_GRADIENT = 'linear-gradient(120deg, #5B5BD6 0%, #7C5CFF 55%, #22B8CF 100%)';

// Soft, layered elevation token — one shadow used across the product.
const SOFT_SHADOW = '0 1px 2px rgba(16,24,40,0.04), 0 8px 24px -16px rgba(16,24,40,0.18)';
const SOFT_SHADOW_LG = '0 1px 2px rgba(16,24,40,0.04), 0 18px 48px -24px rgba(16,24,40,0.24)';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5B5BD6',
      dark: '#4B4ACF',
      light: '#8B8AE6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7C5CFF',
      dark: '#6A47F0',
      light: '#A78BFA',
      contrastText: '#ffffff',
    },
    info: { main: '#22B8CF', dark: '#0E9FB8', contrastText: '#ffffff' },
    success: { main: '#16A34A', dark: '#15803D' },
    warning: { main: '#D97706', dark: '#B45309' },
    error: { main: '#DC2626', dark: '#B91C1C' },
    background: {
      default: '#FBFBFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#18181B',
      secondary: '#71717A',
    },
    divider: '#ECECEE',
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: bodyFont,
    h1: { fontFamily: displayFont, fontWeight: 700, fontSize: '2rem', lineHeight: 1.15, letterSpacing: '-0.025em' },
    h2: { fontFamily: displayFont, fontWeight: 700, fontSize: '1.625rem', lineHeight: 1.2, letterSpacing: '-0.02em' },
    h3: { fontFamily: displayFont, fontWeight: 650, fontSize: '1.3125rem', lineHeight: 1.25, letterSpacing: '-0.018em' },
    h4: { fontFamily: displayFont, fontWeight: 650, fontSize: '1.125rem', lineHeight: 1.3, letterSpacing: '-0.014em' },
    h5: { fontFamily: displayFont, fontWeight: 650, fontSize: '1rem', lineHeight: 1.4, letterSpacing: '-0.01em' },
    h6: { fontFamily: displayFont, fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.4, letterSpacing: '0.01em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.84375rem', lineHeight: 1.55 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0, fontSize: '0.875rem' },
    overline: { fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(79,70,229,0.35) transparent',
        },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-track': { background: 'transparent' },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(24,24,27,0.16)',
          borderRadius: 999,
          border: '2px solid transparent',
          backgroundClip: 'content-box',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'rgba(24,24,27,0.28)',
        },
        body: { backgroundColor: '#FBFBFB' },
        '::selection': {
          backgroundColor: 'rgba(91,91,214,0.18)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 16,
          paddingRight: 16,
          transition: 'background-color 150ms ease, border-color 150ms ease, box-shadow 200ms ease, transform 120ms ease',
        },
        sizeLarge: { paddingTop: 11, paddingBottom: 11, fontSize: '0.9375rem', paddingLeft: 22, paddingRight: 22 },
        sizeSmall: { paddingTop: 5, paddingBottom: 5, fontSize: '0.8125rem' },
        // Brand gradient reserved strictly for the primary (AI) action.
        containedPrimary: {
          background: BRAND_GRADIENT,
          backgroundSize: '160% 160%',
          boxShadow: '0 1px 2px rgba(16,24,40,0.10), 0 8px 20px -10px rgba(91,91,214,0.55)',
          transition: 'background-position 400ms ease, box-shadow 220ms ease, transform 120ms ease',
          '&:hover': {
            backgroundPosition: '100% 0%',
            boxShadow: '0 1px 2px rgba(16,24,40,0.10), 0 12px 26px -10px rgba(124,92,255,0.55)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: '#E0E0E3',
          color: '#18181B',
          '&:hover': { borderColor: '#C9C9CE', backgroundColor: '#F6F6F7' },
        },
        text: {
          '&:hover': { backgroundColor: '#F6F6F7' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: 12 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'background-color 150ms ease, color 150ms ease',
          '&:hover': { backgroundColor: '#F0F0F2' },
        },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: '#ECECEE' } },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#ffffff',
          transition: 'box-shadow 160ms ease, border-color 160ms ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E0E0E3',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#C9C9CE',
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(91, 91, 214, 0.16)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#5B5BD6',
            borderWidth: 1,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: 44,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.78rem',
          borderRadius: 8,
          backgroundColor: '#18181B',
          padding: '7px 11px',
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: '1px solid #ECECEE',
          boxShadow: SOFT_SHADOW_LG,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: '1px solid #ECECEE',
          boxShadow: SOFT_SHADOW,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
  },
});

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </StrictMode>,
  );
}
