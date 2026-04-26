import React from 'react';
import { render, screen } from '@testing-library/react';
import { VisuallyHidden } from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('renders children inside a span by default', () => {
    render(<VisuallyHidden>Screen reader text</VisuallyHidden>);
    const node = screen.getByText('Screen reader text');
    expect(node.tagName).toBe('SPAN');
  });

  it('respects the polymorphic `as` prop', () => {
    render(<VisuallyHidden as="label">label text</VisuallyHidden>);
    expect(screen.getByText('label text').tagName).toBe('LABEL');
  });

  it('preserves the visually-hidden styles even when a consumer passes their own style', () => {
    render(
      <VisuallyHidden style={{ position: 'static', width: '500px', color: 'red' }}>
        hidden
      </VisuallyHidden>
    );
    const node = screen.getByText('hidden');
    // Hiding styles win over consumer overrides
    expect(node.style.position).toBe('absolute');
    expect(node.style.width).toBe('1px');
    expect(node.style.overflow).toBe('hidden');
    // Non-conflicting consumer styles still pass through
    expect(node.style.color).toBe('red');
  });

  it('forwards arbitrary HTML attributes', () => {
    render(<VisuallyHidden data-testid="vh">x</VisuallyHidden>);
    expect(screen.getByTestId('vh')).toBeInTheDocument();
  });
});
