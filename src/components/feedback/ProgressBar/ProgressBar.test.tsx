import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';
import { expectNoA11yViolations } from '../../../test-utils/axe';

describe('ProgressBar', () => {
  it('renders a progressbar role', () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('sets aria-valuenow, aria-valuemin, aria-valuemax', () => {
    render(<ProgressBar value={40} max={100} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('sets aria-valuetext to percentage', () => {
    render(<ProgressBar value={75} max={100} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '75%');
  });

  it('clamps value below 0', () => {
    render(<ProgressBar value={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps value above max', () => {
    render(<ProgressBar value={150} max={100} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('renders label and value when showValue is true', () => {
    render(<ProgressBar value={50} label="Upload" showValue />);
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('omits aria-valuenow when indeterminate', () => {
    render(<ProgressBar indeterminate aria-label="Loading" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  it('applies status class', () => {
    render(<ProgressBar data-testid="pb" value={100} status="success" />);
    expect(screen.getByTestId('pb').className).toMatch(/status-success/);
  });

  it('applies indeterminate class', () => {
    render(<ProgressBar data-testid="pb" indeterminate />);
    expect(screen.getByTestId('pb').className).toMatch(/indeterminate/);
  });

  it('applies striped class', () => {
    render(<ProgressBar data-testid="pb" value={50} striped />);
    expect(screen.getByTestId('pb').className).toMatch(/striped/);
  });

  it('applies size class', () => {
    render(<ProgressBar data-testid="pb" size="lg" value={50} />);
    expect(screen.getByTestId('pb').className).toMatch(/size-lg/);
  });

  it('handles max of 0 by reporting 0%', () => {
    render(<ProgressBar value={5} max={0} aria-label="empty" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuetext', '0%');
    expect(bar).toHaveAttribute('aria-valuemax', '0');
  });

  it('normalizes a negative max to 0 to keep ARIA values valid', () => {
    render(<ProgressBar value={5} max={-10} aria-label="bad" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemax', '0');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
    expect(bar).toHaveAttribute('aria-valuetext', '0%');
  });

  it('forwards aria-label from props onto the progressbar element', () => {
    render(<ProgressBar value={50} aria-label="Upload progress" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Upload progress');
  });

  it('forwards aria-labelledby from props onto the progressbar element', () => {
    render(
      <>
        <span id="pb-label">Upload</span>
        <ProgressBar value={50} aria-labelledby="pb-label" />
      </>
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-labelledby', 'pb-label');
  });

  it('uses the label prop as the accessible name when no aria-label is provided', () => {
    render(<ProgressBar value={50} label="Uploading" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Uploading');
  });
});

describe('ProgressBar a11y (axe)', () => {
  it('has no detectable axe violations', async () => {
    const { container } = render(<ProgressBar value={60} label="Progress" showValue />);
    await expectNoA11yViolations(container);
  });
});
