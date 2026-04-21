import React from 'react';
import { render, screen } from '@testing-library/react';
import { Stack, HStack, VStack } from './Stack';

describe('Stack', () => {
  it('renders with column direction by default and token gap', () => {
    render(
      <Stack data-testid="s">
        <span>a</span>
        <span>b</span>
      </Stack>
    );
    const el = screen.getByTestId('s') as HTMLElement;
    expect(el.style.flexDirection).toBe('column');
    expect(el.style.gap).toBe('var(--zp-space-2)');
  });

  it('HStack sets row direction', () => {
    render(
      <HStack data-testid="s" gap="4">
        <span>a</span>
      </HStack>
    );
    const el = screen.getByTestId('s') as HTMLElement;
    expect(el.style.flexDirection).toBe('row');
    expect(el.style.gap).toBe('var(--zp-space-4)');
  });

  it('VStack sets column direction', () => {
    render(
      <VStack data-testid="s">
        <span>a</span>
      </VStack>
    );
    expect((screen.getByTestId('s') as HTMLElement).style.flexDirection).toBe(
      'column'
    );
  });

  it('maps align and justify to flex values', () => {
    render(
      <Stack data-testid="s" align="center" justify="between">
        <span>a</span>
      </Stack>
    );
    const el = screen.getByTestId('s') as HTMLElement;
    expect(el.style.alignItems).toBe('center');
    expect(el.style.justifyContent).toBe('space-between');
  });
});
