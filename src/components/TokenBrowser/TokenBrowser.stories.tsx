import type { Meta, StoryObj } from '@storybook/react';
import { TokenBrowser } from './TokenBrowser';
import { ThemeProvider } from '../../context/ThemeProvider';

const meta: Meta<typeof TokenBrowser> = {
  title: 'Documentation/TokenBrowser',
  component: TokenBrowser,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Interactive browser for exploring all design tokens in the system. Use this to understand available tokens, their values, and how they change across themes.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TokenBrowser>;

export const Default: Story = {};

export const Colors: Story = {
  args: {
    defaultCategory: 'colors',
  },
};

export const Typography: Story = {
  args: {
    defaultCategory: 'typography',
  },
};

export const Spacing: Story = {
  args: {
    defaultCategory: 'spacing',
  },
};

export const Components: Story = {
  args: {
    defaultCategory: 'components',
  },
};

export const Recipes: Story = {
  args: {
    defaultCategory: 'recipes',
  },
};

export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider theme={{ mode: 'dark' }}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export const HighContrast: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider theme={{ mode: 'highContrast' }}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export const CompactDensity: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider theme={{ density: 'compact' }}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export const SpaciousDensity: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider theme={{ density: 'spacious' }}>
        <Story />
      </ThemeProvider>
    ),
  ],
};
