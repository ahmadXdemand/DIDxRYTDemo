import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// App primary color: #784af4 (purple)
const primaryColor = '#784af4';
const primaryLightColor = '#a47ff7';
const primaryDarkColor = '#5932d9';

// Create theme with consistent brand colors
const createAppTheme = (mode: PaletteMode) => {
  let theme = createTheme({
    palette: {
      mode,
      primary: {
        main: primaryColor,
        light: primaryLightColor,
        dark: primaryDarkColor,
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#21CBF3',
        light: '#67daff',
        dark: '#0d9ec0',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'light' ? '#f8f9fa' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#24292e' : '#e1e4e8',
        secondary: mode === 'light' ? '#586069' : '#8b949e',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        fontWeight: 500,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 3px 5px 2px rgba(120, 74, 244, .15)',
            },
          },
          containedPrimary: {
            background: `linear-gradient(45deg, ${primaryColor} 30%, ${primaryLightColor} 90%)`,
            '&:hover': {
              background: `linear-gradient(45deg, ${primaryDarkColor} 30%, ${primaryColor} 90%)`,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: mode === 'light' ? '#bbb #f5f5f5' : '#444 #2b2b2b',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              backgroundColor: mode === 'light' ? '#bbb' : '#444',
              borderRadius: 8,
              minHeight: 24,
            },
            '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
              backgroundColor: mode === 'light' ? '#999' : '#555',
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              backgroundColor: mode === 'light' ? '#999' : '#555',
            },
            '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
              backgroundColor: mode === 'light' ? '#f5f5f5' : '#2b2b2b',
            },
          },
        },
      },
    },
  });

  // Make fonts responsive
  theme = responsiveFontSizes(theme);

  return theme;
};

export default createAppTheme; 