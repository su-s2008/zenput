import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonTable, SkeletonCard } from './Skeleton';
import { expectNoA11yViolations } from '../../../test-utils/axe';

describe('Skeleton', () => {
  it('renders an aria-hidden element when loading', () => {
    render(<Skeleton data-testid="s" width={200} height={20} />);
    const el = screen.getByTestId('s');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders children when loading is false', () => {
    render(<Skeleton loading={false}>Loaded content</Skeleton>);
    expect(screen.getByText('Loaded content')).toBeInTheDocument();
  });

  it('applies shimmer class by default', () => {
    render(<Skeleton data-testid="s" />);
    expect(screen.getByTestId('s').className).toMatch(/shimmer/);
  });

  it('applies pulse class when animation="pulse"', () => {
    render(<Skeleton data-testid="s" animation="pulse" />);
    expect(screen.getByTestId('s').className).toMatch(/pulse/);
  });

  it('applies no animation class when animation="none"', () => {
    render(<Skeleton data-testid="s" animation="none" />);
    const el = screen.getByTestId('s');
    expect(el.className).not.toMatch(/shimmer/);
    expect(el.className).not.toMatch(/pulse/);
  });

  it('applies circle variant class', () => {
    render(<Skeleton data-testid="s" variant="circle" width={40} height={40} />);
    expect(screen.getByTestId('s').className).toMatch(/variant-circle/);
  });

  it('applies inline width and height styles', () => {
    render(<Skeleton data-testid="s" width={120} height={16} />);
    const el = screen.getByTestId('s');
    expect(el.style.width).toBe('120px');
    expect(el.style.height).toBe('16px');
  });

  it('renders as a custom element via "as" prop', () => {
    render(<Skeleton as="div" data-testid="s" />);
    expect(screen.getByTestId('s').tagName).toBe('DIV');
  });
});

describe('SkeletonText', () => {
  it('renders the correct number of lines', () => {
    const { container } = render(<SkeletonText lines={4} data-testid="t" />);
    // Each line is a Skeleton with class containing "skeleton" and aria-hidden
    const lines = container.querySelectorAll('[class*="skeleton"]');
    expect(lines).toHaveLength(4);
  });

  it('renders a single line without applying lastLineWidth shrink', () => {
    const { container } = render(<SkeletonText lines={1} />);
    const lines = container.querySelectorAll('[class*="skeleton"]');
    expect(lines).toHaveLength(1);
    expect((lines[0] as HTMLElement).style.width).toBe('100%');
  });

  it('shrinks the last line width when more than one line', () => {
    const { container } = render(<SkeletonText lines={3} lastLineWidth={0.5} />);
    const lines = container.querySelectorAll('[class*="skeleton"]');
    expect((lines[lines.length - 1] as HTMLElement).style.width).toBe('50%');
  });

  it('forwards animation prop to lines', () => {
    const { container } = render(<SkeletonText lines={2} animation="pulse" />);
    const lines = container.querySelectorAll('[class*="skeleton"]');
    expect((lines[0] as HTMLElement).className).toMatch(/pulse/);
  });
});

describe('Skeleton extras', () => {
  it('applies an explicit radius for non-circle variants', () => {
    render(<Skeleton data-testid="s" variant="rect" radius={12} />);
    expect(screen.getByTestId('s').style.borderRadius).toBe('12px');
  });

  it('ignores radius for circle variant', () => {
    render(<Skeleton data-testid="s" variant="circle" radius={12} width={40} height={40} />);
    expect(screen.getByTestId('s').style.borderRadius).toBe('');
  });

  it('accepts string width/height units verbatim', () => {
    render(<Skeleton data-testid="s" width="50%" height="2rem" />);
    const el = screen.getByTestId('s');
    expect(el.style.width).toBe('50%');
    expect(el.style.height).toBe('2rem');
  });
});

describe('SkeletonAvatar', () => {
  it('renders a circle variant', () => {
    render(<SkeletonAvatar data-testid="a" />);
    expect(screen.getByTestId('a').className).toMatch(/variant-circle/);
  });

  it('applies the given size', () => {
    render(<SkeletonAvatar size={60} data-testid="a" />);
    const el = screen.getByTestId('a');
    expect(el.style.width).toBe('60px');
    expect(el.style.height).toBe('60px');
  });
});

describe('Skeleton a11y (axe)', () => {
  it('has no detectable axe violations', async () => {
    const { container } = render(
      <div>
        <Skeleton width={200} height={20} />
        <SkeletonText lines={3} />
        <SkeletonAvatar size={40} />
      </div>
    );
    await expectNoA11yViolations(container);
  });
});

describe('SkeletonTable', () => {
  it('is marked aria-hidden', () => {
    render(<SkeletonTable data-testid="t" />);
    expect(screen.getByTestId('t')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders header + rows*columns cells with defaults (5 rows, 4 cols)', () => {
    const { container } = render(<SkeletonTable data-testid="t" />);
    const cells = container.querySelectorAll('[class*="skeleton"]');
    // 4 header cells + 5 * 4 body cells
    expect(cells).toHaveLength(4 + 5 * 4);
  });

  it('renders only body cells when showHeader is false', () => {
    const { container } = render(
      <SkeletonTable data-testid="t" rows={2} columns={3} showHeader={false} />
    );
    const cells = container.querySelectorAll('[class*="skeleton"]');
    expect(cells).toHaveLength(2 * 3);
  });

  it('sets gridTemplateColumns from the columns prop', () => {
    render(<SkeletonTable data-testid="t" columns={6} />);
    const el = screen.getByTestId('t');
    expect(el.style.gridTemplateColumns).toBe('repeat(6, minmax(0, 1fr))');
  });

  it('forwards className and merges custom style', () => {
    render(
      <SkeletonTable data-testid="t" className="custom-table" style={{ background: 'red' }} />
    );
    const el = screen.getByTestId('t');
    expect(el.className).toContain('custom-table');
    expect(el.style.background).toBe('red');
    expect(el.style.display).toBe('grid');
  });

  it('forwards animation prop to skeleton cells', () => {
    const { container } = render(
      <SkeletonTable rows={1} columns={1} showHeader={false} animation="pulse" />
    );
    const cell = container.querySelector('[class*="skeleton"]') as HTMLElement;
    expect(cell.className).toMatch(/pulse/);
  });
});

describe('SkeletonCard', () => {
  it('is marked aria-hidden', () => {
    render(<SkeletonCard data-testid="c" />);
    expect(screen.getByTestId('c')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the default number of body text lines (3)', () => {
    const { container } = render(<SkeletonCard data-testid="c" />);
    const cells = container.querySelectorAll('[class*="skeleton"]');
    expect(cells).toHaveLength(3);
  });

  it('renders media block when showMedia is true', () => {
    const { container } = render(<SkeletonCard data-testid="c" lines={0} showMedia />);
    const cells = container.querySelectorAll('[class*="skeleton"]');
    expect(cells).toHaveLength(1);
    expect((cells[0] as HTMLElement).className).toMatch(/variant-rect/);
  });

  it('renders avatar + 2 header text skeletons when showAvatar is true', () => {
    const { container } = render(<SkeletonCard data-testid="c" lines={0} showAvatar />);
    const cells = container.querySelectorAll('[class*="skeleton"]');
    // 1 avatar (circle) + 2 header text lines
    expect(cells).toHaveLength(3);
    expect(container.querySelectorAll('[class*="variant-circle"]')).toHaveLength(1);
  });

  it('renders 2 footer action skeletons when showFooter is true', () => {
    const { container } = render(<SkeletonCard data-testid="c" lines={0} showFooter />);
    const cells = container.querySelectorAll('[class*="skeleton"]');
    expect(cells).toHaveLength(2);
  });

  it('forwards className and merges custom style', () => {
    render(<SkeletonCard data-testid="c" className="custom-card" style={{ background: 'blue' }} />);
    const el = screen.getByTestId('c');
    expect(el.className).toContain('custom-card');
    expect(el.style.background).toBe('blue');
  });
});
