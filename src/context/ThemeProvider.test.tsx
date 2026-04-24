import React from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import { ThemeProvider, useTheme, createTheme, tokenVar } from './ThemeProvider';

describe('ThemeProvider', () => {
  it('renders children inside a div wrapper by default', () => {
    render(
      <ThemeProvider>
        <span data-testid="child">hello</span>
      </ThemeProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('sets data-zp-theme attribute to "light" by default', () => {
    const { container } = render(<ThemeProvider><span /></ThemeProvider>);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveAttribute('data-zp-theme', 'light');
  });

  it('sets data-zp-theme to "dark" when mode is dark', () => {
    const { container } = render(
      <ThemeProvider theme={{ mode: 'dark' }}>
        <span />
      </ThemeProvider>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveAttribute('data-zp-theme', 'dark');
  });

  it('sets data-zp-theme to "highContrast" when mode is highContrast', () => {
    const { container } = render(
      <ThemeProvider theme={{ mode: 'highContrast' }}>
        <span />
      </ThemeProvider>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveAttribute('data-zp-theme', 'highContrast');
  });

  it('supports custom wrapper element via `as` prop', () => {
    const { container } = render(
      <ThemeProvider as="section">
        <span />
      </ThemeProvider>
    );
    expect(container.firstChild?.nodeName).toBe('SECTION');
  });

  it('applies legacy CSS variables when legacy theme props are set', () => {
    const { container } = render(
      <ThemeProvider
        theme={{
          primaryColor: '#ff0000',
          errorColor: '#cc0000',
          successColor: '#00cc00',
          warningColor: '#ffcc00',
          borderRadius: '8px',
          fontFamily: 'Arial',
          fontSize: '14px',
          borderColor: '#ccc',
          bgColor: '#fff',
          textColor: '#000',
          placeholderColor: '#999',
          focusRingColor: '#0000ff',
          disabledBg: '#f0f0f0',
          disabledText: '#888',
        }}
      >
        <span />
      </ThemeProvider>
    );
    const wrapper = container.firstChild as HTMLElement;
    // Legacy vars are set on the wrapper's inline style
    const style = wrapper.style as CSSStyleDeclaration & Record<string, string>;
    expect(style.getPropertyValue('--input-primary-color')).toBe('#ff0000');
    expect(style.getPropertyValue('--input-error-color')).toBe('#cc0000');
    expect(style.getPropertyValue('--input-success-color')).toBe('#00cc00');
    expect(style.getPropertyValue('--input-warning-color')).toBe('#ffcc00');
    expect(style.getPropertyValue('--input-border-radius')).toBe('8px');
    expect(style.getPropertyValue('--input-font-family')).toBe('Arial');
    expect(style.getPropertyValue('--input-font-size')).toBe('14px');
    expect(style.getPropertyValue('--input-border-color')).toBe('#ccc');
    expect(style.getPropertyValue('--input-bg-color')).toBe('#fff');
    expect(style.getPropertyValue('--input-text-color')).toBe('#000');
    expect(style.getPropertyValue('--input-placeholder-color')).toBe('#999');
    expect(style.getPropertyValue('--input-focus-ring-color')).toBe('#0000ff');
    expect(style.getPropertyValue('--input-disabled-bg')).toBe('#f0f0f0');
    expect(style.getPropertyValue('--input-disabled-text')).toBe('#888');
  });

  it('does not set legacy CSS variables when none are provided', () => {
    const { container } = render(
      <ThemeProvider theme={{ mode: 'light' }}>
        <span />
      </ThemeProvider>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--input-primary-color')).toBe('');
    expect(wrapper.style.getPropertyValue('--input-error-color')).toBe('');
  });

  it('applies custom cssVars to the wrapper', () => {
    const { container } = render(
      <ThemeProvider
        theme={{
          cssVars: {
            '--custom-brand': '#6366f1',
            '--custom-accent': '#8b5cf6',
          },
        }}
      >
        <span />
      </ThemeProvider>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--custom-brand')).toBe('#6366f1');
    expect(wrapper.style.getPropertyValue('--custom-accent')).toBe('#8b5cf6');
  });

  it('emits --zp-density-* CSS variables for compact density', () => {
    const { container } = render(
      <ThemeProvider theme={{ density: 'compact' }}>
        <span />
      </ThemeProvider>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--zp-density-scale')).toBe('0.75');
  });

  it('emits --zp-density-* CSS variables for spacious density', () => {
    const { container } = render(
      <ThemeProvider theme={{ density: 'spacious' }}>
        <span />
      </ThemeProvider>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--zp-density-scale')).toBe('1.25');
  });

  it('emits per-component CSS variables when components tokens are provided', () => {
    const { container } = render(
      <ThemeProvider
        theme={{
          components: {
            button: {
              borderRadius: '9999px',
            },
          },
        }}
      >
        <span />
      </ThemeProvider>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--zp-component-button-border-radius')).toBe('9999px');
  });
});

describe('useTheme', () => {
  it('returns the default theme values when used outside a provider', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.mode).toBe('light');
    expect(result.current.density).toBe('normal');
    expect(result.current.components).toEqual({});
  });

  it('returns the current theme values from the nearest ThemeProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'dark', density: 'compact' }}>
        {children}
      </ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.mode).toBe('dark');
    expect(result.current.density).toBe('compact');
  });

  it('exposes the theme object passed to the provider', () => {
    const theme = { mode: 'light' as const, primaryColor: '#ff0000' };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme.primaryColor).toBe('#ff0000');
  });

  it('exposes semantic colors merged with mode defaults', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'light', semantic: { brand: '#custom' } }}>
        {children}
      </ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.semantic.brand).toBe('#custom');
  });
});

describe('createTheme', () => {
  it('returns default light/normal theme for empty input', () => {
    const { mode, density } = createTheme({});
    expect(mode).toBe('light');
    expect(density).toBe('normal');
  });

  it('resolves the mode and density from the theme', () => {
    const { mode, density } = createTheme({ mode: 'dark', density: 'compact' });
    expect(mode).toBe('dark');
    expect(density).toBe('compact');
  });

  it('merges semantic overrides on top of mode defaults', () => {
    const { semantic } = createTheme({
      mode: 'light',
      semantic: { brand: '#override' },
    });
    expect(semantic.brand).toBe('#override');
  });

  it('includes extra cssVars in the output', () => {
    const { cssVars } = createTheme({
      cssVars: { '--custom-color': 'red' },
    });
    expect(cssVars['--custom-color']).toBe('red');
  });

  it('returns empty components when none are set', () => {
    const { components } = createTheme({});
    expect(components).toEqual({});
  });

  it('returns component tokens when provided', () => {
    const { components } = createTheme({
      components: { button: { borderRadius: '4px' } },
    });
    expect(components.button?.borderRadius).toBe('4px');
  });
});

describe('tokenVar', () => {
  it('returns a CSS var() reference for a given token name', () => {
    expect(tokenVar('color-brand')).toBe('var(--zp-color-brand)');
  });

  it('includes a fallback value when provided', () => {
    expect(tokenVar('color-brand', '#0000ff')).toBe('var(--zp-color-brand, #0000ff)');
  });

  it('normalizes dots in spacing keys', () => {
    expect(tokenVar('space-0.5')).toBe('var(--zp-space-0-5)');
  });
});
