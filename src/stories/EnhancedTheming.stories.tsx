import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ThemeProvider } from '../context';
import { extendTheme } from '../utils/extendTheme';
import { Button } from '../components/actions/Button';
import { TextInput } from '../components/TextInput';
import { Badge } from '../components/actions/Badge';
import { Box } from '../components/layout/Box';
import { Stack } from '../components/layout/Stack';

const meta: Meta<typeof ThemeProvider> = {
  title: 'Documentation/Enhanced Theming',
  component: ThemeProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Enhanced theming platform with per-component tokens, recipes, density scaling, and the `extendTheme()` API for theme composition.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeProvider>;

const DemoComponents = () => (
  <Stack direction="column" spacing="4">
    <Box p="4" bg="surface" radius="lg" shadow="md">
      <h3 style={{ marginTop: 0, color: 'var(--zp-color-text-primary)' }}>
        Component Showcase
      </h3>
      <Stack direction="column" spacing="3">
        <TextInput label="Email" placeholder="you@example.com" />
        <Stack direction="row" spacing="2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </Stack>
        <Stack direction="row" spacing="2">
          <Badge tone="brand">Brand</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="danger">Danger</Badge>
        </Stack>
      </Stack>
    </Box>
  </Stack>
);

export const Default: Story = {
  render: () => (
    <ThemeProvider>
      <DemoComponents />
    </ThemeProvider>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <ThemeProvider theme={{ mode: 'dark' }}>
      <DemoComponents />
    </ThemeProvider>
  ),
};

export const HighContrast: Story = {
  render: () => (
    <ThemeProvider theme={{ mode: 'highContrast' }}>
      <DemoComponents />
    </ThemeProvider>
  ),
};

export const CompactDensity: Story = {
  render: () => (
    <ThemeProvider theme={{ density: 'compact' }}>
      <DemoComponents />
    </ThemeProvider>
  ),
};

export const SpaciousDensity: Story = {
  render: () => (
    <ThemeProvider theme={{ density: 'spacious' }}>
      <DemoComponents />
    </ThemeProvider>
  ),
};

export const CustomComponentTokens: Story = {
  render: () => (
    <ThemeProvider
      theme={{
        components: {
          button: {
            borderRadius: '9999px',
            primaryBg: '#8b5cf6',
            primaryBgHover: '#7c3aed',
          },
          input: {
            borderRadius: 'var(--zp-radius-xl)',
            borderColor: '#8b5cf6',
          },
          badge: {
            borderRadius: 'var(--zp-radius-sm)',
            fontSize: 'var(--zp-font-size-sm)',
          },
        },
      }}
    >
      <DemoComponents />
    </ThemeProvider>
  ),
};

export const ExtendedTheme: Story = {
  render: () => {
    const baseTheme = {
      mode: 'light' as const,
      semantic: {
        // Indigo-600 – passes WCAG AA (6.37:1) against white inverse text.
        brand: '#4f46e5',
        brandHover: '#4338ca',
      },
    };

    const customTheme = extendTheme(baseTheme, {
      density: 'spacious',
      components: {
        button: {
          borderRadius: 'var(--zp-radius-lg)',
        },
      },
    });

    return (
      <ThemeProvider theme={customTheme}>
        <DemoComponents />
      </ThemeProvider>
    );
  },
};

export const MultipleThemeExtensions: Story = {
  render: () => {
    const baseTheme = {
      mode: 'light' as const,
      semantic: {
        // Sky-700 – passes WCAG AA (7.16:1) against white inverse text.
        brand: '#0369a1',
      },
    };

    const densityPreset = {
      density: 'compact' as const,
    };

    const componentOverrides = {
      components: {
        button: {
          borderRadius: 'var(--zp-radius-full)',
          paddingMd: 'var(--zp-space-2) var(--zp-space-6)',
        },
      },
    };

    const finalTheme = extendTheme(baseTheme, densityPreset, componentOverrides);

    return (
      <ThemeProvider theme={finalTheme}>
        <DemoComponents />
      </ThemeProvider>
    );
  },
};

export const SemanticColorOverrides: Story = {
  render: () => (
    <ThemeProvider
      theme={{
        mode: 'light',
        semantic: {
          // Pink-700 – passes WCAG AA (6.33:1) against white inverse text.
          brand: '#be185d',
          brandHover: '#9d174d',
          brandActive: '#831843',
          success: '#047857',
          danger: '#b91c1c',
        },
      }}
    >
      <DemoComponents />
    </ThemeProvider>
  ),
};

export const CustomCSSVariables: Story = {
  render: () => (
    <ThemeProvider
      theme={{
        cssVars: {
          // Amber-700 – passes WCAG AA (4.67:1) against white inverse text.
          '--custom-accent': '#b45309',
          // Amber-200 – light background used with dark text for contrast.
          '--custom-highlight': '#fde68a',
        },
      }}
    >
      <Stack direction="column" spacing="4">
        <Box
          p="4"
          style={{
            backgroundColor: 'var(--custom-accent)',
            color: 'var(--zp-color-text-inverse)',
            borderRadius: 'var(--zp-radius-lg)',
          }}
        >
          <h3 style={{ margin: 0 }}>Custom CSS Variables</h3>
          <p>These boxes use custom CSS variables passed via the theme.</p>
        </Box>
        <Box
          p="4"
          style={{
            backgroundColor: 'var(--custom-highlight)',
            color: 'var(--zp-color-text-primary)',
            borderRadius: 'var(--zp-radius-lg)',
          }}
        >
          <p style={{ margin: 0 }}>Another custom color!</p>
        </Box>
      </Stack>
    </ThemeProvider>
  ),
};
