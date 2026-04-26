import React from 'react';
import { render, screen } from '@testing-library/react';
import { CircularProgress } from './CircularProgress';
import { expectNoA11yViolations } from '../../../test-utils/axe';

describe('CircularProgress', () => {
  it('renders a progressbar role', () => {
    render(<CircularProgress value={50} aria-label="Progress" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('sets aria-valuenow, aria-valuemin, aria-valuemax', () => {
    render(<CircularProgress value={40} max={100} aria-label="Progress" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('sets aria-valuetext to percentage', () => {
    render(<CircularProgress value={75} max={100} aria-label="Progress" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '75%');
  });

  it('clamps value below 0', () => {
    render(<CircularProgress value={-10} aria-label="Progress" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps value above max', () => {
    render(<CircularProgress value={150} max={100} aria-label="Progress" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows value when showValue is true', () => {
    render(<CircularProgress value={50} showValue />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('omits aria-valuenow when indeterminate', () => {
    render(<CircularProgress indeterminate aria-label="Loading" />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  it('applies status class', () => {
    render(<CircularProgress data-testid="cp" value={100} status="success" />);
    expect(screen.getByTestId('cp').className).toMatch(/status-success/);
  });

  it('applies indeterminate class', () => {
    render(<CircularProgress data-testid="cp" indeterminate />);
    expect(screen.getByTestId('cp').className).toMatch(/indeterminate/);
  });

  it('respects custom diameter and thickness', () => {
    render(<CircularProgress value={50} diameter={80} thickness={8} aria-label="Progress" />);
    const svg = screen.getByRole('progressbar');
    expect(svg).toHaveAttribute('width', '80');
    expect(svg).toHaveAttribute('height', '80');
  });

  it('handles max of 0 by reporting 0%', () => {
    render(<CircularProgress value={5} max={0} aria-label="empty" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuetext', '0%');
    expect(bar).toHaveAttribute('aria-valuemax', '0');
  });

  it('normalizes a negative max to 0 to keep ARIA values valid', () => {
    render(<CircularProgress value={5} max={-10} aria-label="bad" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemax', '0');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
    expect(bar).toHaveAttribute('aria-valuetext', '0%');
  });

  it('renders the textual label when showValue is false', () => {
    render(<CircularProgress value={50} label="Uploading" />);
    expect(screen.getByText('Uploading')).toBeInTheDocument();
  });

  it('hides numeric value when indeterminate even if showValue is true', () => {
    render(<CircularProgress indeterminate showValue aria-label="Loading" />);
    // No percentage text should be rendered
    expect(screen.queryByText(/%$/)).toBeNull();
  });

  it('forwards aria-label from props onto the progressbar element', () => {
    render(<CircularProgress value={50} aria-label="Upload progress" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Upload progress');
  });

  it('forwards aria-labelledby from props onto the progressbar element', () => {
    render(
      <>
        <span id="cp-label">Upload</span>
        <CircularProgress value={50} aria-labelledby="cp-label" />
      </>
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-labelledby', 'cp-label');
  });

  it('uses the label prop as the accessible name when no aria-label is provided', () => {
    render(<CircularProgress value={50} label="Uploading" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Uploading');
  });
});

describe('CircularProgress a11y (axe)', () => {
  it('has no detectable axe violations', async () => {
    const { container } = render(
      <CircularProgress value={60} label="Upload" showValue />
    );
    await expectNoA11yViolations(container);
  });
});
