import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeProvider';
import { TokenBrowser } from './TokenBrowser';

/** Wrap TokenBrowser in ThemeProvider so useTheme() works. */
const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('TokenBrowser', () => {
  it('renders without crashing', () => {
    renderWithTheme(<TokenBrowser />);
    expect(screen.getByText('Design Tokens Browser')).toBeInTheDocument();
  });

  it('shows mode, density, and variable count in the header', () => {
    renderWithTheme(<TokenBrowser />);
    expect(screen.getByText(/Mode:/)).toBeInTheDocument();
    expect(screen.getByText(/Density:/)).toBeInTheDocument();
    expect(screen.getByText(/Variables:/)).toBeInTheDocument();
  });

  it('renders the category navigation sidebar', () => {
    renderWithTheme(<TokenBrowser />);
    expect(screen.getByRole('button', { name: 'Semantic Colors' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Color Palette' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Typography' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Spacing' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Border Radius' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Shadows & Elevation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Motion' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Z-Index' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Breakpoints' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Density' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recipes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Component Tokens' })).toBeInTheDocument();
  });

  it('defaults to the "colors" (Semantic Colors) category', () => {
    renderWithTheme(<TokenBrowser />);
    const btn = screen.getByRole('button', { name: 'Semantic Colors' });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('supports a custom defaultCategory via prop', () => {
    renderWithTheme(<TokenBrowser defaultCategory="spacing" />);
    const btn = screen.getByRole('button', { name: 'Spacing' });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches category when a nav button is clicked', () => {
    renderWithTheme(<TokenBrowser />);
    fireEvent.click(screen.getByRole('button', { name: 'Typography' }));
    expect(screen.getByRole('button', { name: 'Typography' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    // Typography section headers should appear
    expect(screen.getByText('Font Families')).toBeInTheDocument();
    expect(screen.getByText('Font Sizes')).toBeInTheDocument();
    expect(screen.getByText('Font Weights')).toBeInTheDocument();
    expect(screen.getByText('Line Heights')).toBeInTheDocument();
    expect(screen.getByText('Letter Spacings')).toBeInTheDocument();
  });

  it('renders the Color Palette category', () => {
    renderWithTheme(<TokenBrowser defaultCategory="palette" />);
    // palette has named ramps like "neutral", "blue", etc.
    // just verify some content is rendered
    expect(screen.getByRole('button', { name: 'Color Palette' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('renders the Spacing category', () => {
    renderWithTheme(<TokenBrowser defaultCategory="spacing" />);
    // spacing token items should be rendered
    expect(screen.getByRole('button', { name: 'Spacing' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders the Border Radius category', () => {
    renderWithTheme(<TokenBrowser defaultCategory="radii" />);
    expect(screen.getByRole('button', { name: 'Border Radius' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('renders the Shadows & Elevation category', () => {
    renderWithTheme(<TokenBrowser defaultCategory="shadows" />);
    expect(screen.getByText('Shadows')).toBeInTheDocument();
    expect(screen.getByText('Elevation')).toBeInTheDocument();
    expect(screen.getByText('Border Widths')).toBeInTheDocument();
  });

  it('renders the Motion category', () => {
    renderWithTheme(<TokenBrowser defaultCategory="motion" />);
    expect(screen.getByText('Durations')).toBeInTheDocument();
    expect(screen.getByText('Easings')).toBeInTheDocument();
  });

  it('renders the Z-Index category', () => {
    renderWithTheme(<TokenBrowser defaultCategory="zIndex" />);
    expect(screen.getByRole('button', { name: 'Z-Index' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders the Breakpoints category', () => {
    renderWithTheme(<TokenBrowser defaultCategory="breakpoints" />);
    expect(screen.getByRole('button', { name: 'Breakpoints' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('renders the Density category with scale sections', () => {
    renderWithTheme(<TokenBrowser defaultCategory="density" />);
    expect(screen.getByText('compact')).toBeInTheDocument();
    expect(screen.getByText('normal')).toBeInTheDocument();
    expect(screen.getByText('spacious')).toBeInTheDocument();
  });

  it('renders the Recipes category with base and variant sections', () => {
    renderWithTheme(<TokenBrowser defaultCategory="recipes" />);
    expect(screen.getByText('card')).toBeInTheDocument();
    expect(screen.getByText('interactive')).toBeInTheDocument();
    expect(screen.getByText('focusRing')).toBeInTheDocument();
    expect(screen.getByText('input')).toBeInTheDocument();
    expect(screen.getByText('text')).toBeInTheDocument();
    // Base and variants headings
    expect(screen.getAllByText('Base').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Variants').length).toBeGreaterThan(0);
  });

  it('renders the Component Tokens category', () => {
    renderWithTheme(<TokenBrowser defaultCategory="components" />);
    expect(screen.getByText('button')).toBeInTheDocument();
    expect(screen.getByText('input')).toBeInTheDocument();
    expect(screen.getByText('badge')).toBeInTheDocument();
    expect(screen.getByText('dialog')).toBeInTheDocument();
    expect(screen.getByText('tooltip')).toBeInTheDocument();
    expect(screen.getByText('dataTable')).toBeInTheDocument();
  });

  it('reflects theme.components overrides in the Component Tokens panel', () => {
    render(
      <ThemeProvider theme={{ components: { button: { borderRadius: '9999px' } } }}>
        <TokenBrowser defaultCategory="components" />
      </ThemeProvider>
    );
    // The overridden value should appear in the rendered token list.
    expect(screen.getByText('9999px')).toBeInTheDocument();
  });

  it('reflects theme mode in the header info', () => {
    render(
      <ThemeProvider theme={{ mode: 'dark' }}>
        <TokenBrowser />
      </ThemeProvider>
    );
    expect(screen.getByText('Mode: dark')).toBeInTheDocument();
  });

  it('reflects density in the header info', () => {
    render(
      <ThemeProvider theme={{ density: 'compact' }}>
        <TokenBrowser />
      </ThemeProvider>
    );
    expect(screen.getByText('Density: compact')).toBeInTheDocument();
  });
});
