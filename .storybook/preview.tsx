import React from 'react';
import type { Preview, Decorator } from '@storybook/react';
import { ThemeProvider } from '../src/context';
import type { Theme, Direction } from '../src/context';

const THEMES: Record<string, Theme> = {
  Default: {},
  Indigo: {
    primaryColor: '#6366f1',
    focusRingColor: '#6366f1',
    borderRadius: '8px',
  },
  Emerald: {
    primaryColor: '#10b981',
    focusRingColor: '#10b981',
    borderRadius: '4px',
    successColor: '#059669',
  },
  Rose: {
    primaryColor: '#f43f5e',
    focusRingColor: '#f43f5e',
    borderRadius: '12px',
    errorColor: '#e11d48',
  },
  Dark: {
    primaryColor: '#818cf8',
    bgColor: '#1e1e2e',
    textColor: '#cdd6f4',
    borderColor: '#45475a',
    placeholderColor: '#6c7086',
    disabledBg: '#313244',
    disabledText: '#585b70',
  },
};

const VALID_DIRECTIONS: ReadonlySet<Direction> = new Set<Direction>(['ltr', 'rtl', 'auto']);

function resolveDirection(value: unknown): Direction {
  if (typeof value === 'string' && VALID_DIRECTIONS.has(value as Direction)) {
    return value as Direction;
  }
  return 'ltr';
}

const withThemeProvider: Decorator = (Story, context) => {
  const themeName = context.globals.theme || 'Default';
  const theme = THEMES[themeName] || {};
  const bgColor = theme.bgColor;
  const dir = resolveDirection(context.globals.direction);
  return (
    <div style={{ padding: '1.5rem', backgroundColor: bgColor || 'transparent' }}>
      <ThemeProvider theme={theme} dir={dir}>
        <Story />
      </ThemeProvider>
    </div>
  );
};

const preview: Preview = {
  decorators: [withThemeProvider],
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'Default',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: Object.keys(THEMES),
        dynamicTitle: true,
      },
    },
    direction: {
      description: 'Text direction (LTR / RTL)',
      defaultValue: 'ltr',
      toolbar: {
        title: 'Direction',
        icon: 'paragraph',
        items: [
          { value: 'ltr', title: 'LTR' },
          { value: 'rtl', title: 'RTL' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};

export default preview;
