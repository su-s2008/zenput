import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Stat } from './Stat';
import { expectNoA11yViolations } from '../../test-utils/axe';

describe('Stat', () => {
  it('renders label and value', () => {
    render(<Stat label="Revenue" value="$12,345" />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$12,345')).toBeInTheDocument();
  });

  it('renders optional hint', () => {
    render(<Stat label="Orders" value="142" hint="12 today" />);
    expect(screen.getByText('12 today')).toBeInTheDocument();
  });

  it('renders an icon chip when icon is provided', () => {
    render(<Stat label="Users" value="80" icon={<svg data-testid="i" />} />);
    expect(screen.getByTestId('i')).toBeInTheDocument();
  });

  it('shows skeletons when loading=true and hides the real value', () => {
    const { container } = render(<Stat label="Revenue" value="$1,000" hint="hint" loading />);
    expect(screen.queryByText('$1,000')).not.toBeInTheDocument();
    expect(screen.queryByText('hint')).not.toBeInTheDocument();
    // Skeletons use aria-hidden, so check by class.
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
  });

  it('derives up direction from positive delta value', () => {
    render(<Stat label="x" value="1" delta={{ value: 12.4, caption: 'vs last' }} />);
    // default label includes a + sign and value
    expect(screen.getByText('+12.4')).toBeInTheDocument();
    expect(screen.getByText('vs last')).toBeInTheDocument();
  });

  it('derives down direction from negative delta value', () => {
    render(<Stat label="x" value="1" delta={{ value: -3 }} />);
    expect(screen.getByText('−3')).toBeInTheDocument();
  });

  it('uses the explicit delta label when provided', () => {
    render(<Stat label="x" value="1" delta={{ value: 5, label: 'Up 5pt' }} />);
    expect(screen.getByText('Up 5pt')).toBeInTheDocument();
  });

  it('renders the trend slot', () => {
    render(<Stat label="x" value="1" trend={<svg data-testid="spark" />} />);
    expect(screen.getByTestId('spark')).toBeInTheDocument();
  });

  it('renders "No change" label when direction is flat with no value', () => {
    render(<Stat label="x" value="1" delta={{ direction: 'flat' }} />);
    expect(screen.getByText('No change')).toBeInTheDocument();
  });

  it('passes a11y checks', async () => {
    const { container } = render(
      <Stat
        label="Total revenue"
        value="$12,345"
        hint="142 lifetime orders"
        delta={{ value: 12.4, caption: 'vs last month' }}
      />
    );
    await expectNoA11yViolations(container);
  });
});
