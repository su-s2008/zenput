import { vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { RadioGroup } from './RadioGroup';
import { expectNoA11yViolations } from '../../test-utils/axe';

const OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

describe('RadioGroup', () => {
  it('renders without errors', () => {
    const { container } = render(<RadioGroup name="plan" options={OPTIONS} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders group label', () => {
    render(<RadioGroup name="plan" label="Plan" options={OPTIONS} />);
    expect(screen.getByText('Plan')).toBeInTheDocument();
  });

  it('renders all radio options', () => {
    render(<RadioGroup name="plan" options={OPTIONS} />);
    expect(screen.getByLabelText('Free')).toBeInTheDocument();
    expect(screen.getByLabelText('Pro')).toBeInTheDocument();
    expect(screen.getByLabelText('Enterprise')).toBeInTheDocument();
  });

  it('pre-selects defaultValue', () => {
    render(<RadioGroup name="plan" options={OPTIONS} defaultValue="pro" />);
    expect(screen.getByLabelText('Pro')).toBeChecked();
    expect(screen.getByLabelText('Free')).not.toBeChecked();
  });

  it('calls onChange with selected value', async () => {
    const handleChange = vi.fn();
    render(<RadioGroup name="plan" options={OPTIONS} onChange={handleChange} />);
    await userEvent.click(screen.getByLabelText('Pro'));
    expect(handleChange).toHaveBeenCalledWith('pro');
  });

  it('disables all options when disabled', () => {
    render(<RadioGroup name="plan" options={OPTIONS} disabled />);
    screen.getAllByRole('radio').forEach((r) => expect(r).toBeDisabled());
  });

  it('only allows one selection at a time', async () => {
    render(<RadioGroup name="plan" options={OPTIONS} />);
    await userEvent.click(screen.getByLabelText('Free'));
    await userEvent.click(screen.getByLabelText('Pro'));
    expect(screen.getByLabelText('Free')).not.toBeChecked();
    expect(screen.getByLabelText('Pro')).toBeChecked();
  });

  it('renders error message', () => {
    render(
      <RadioGroup
        name="plan"
        options={OPTIONS}
        validationState="error"
        errorMessage="Select a plan"
      />
    );
    expect(screen.getByText('Select a plan')).toBeInTheDocument();
  });

  it('forwards ref to wrapper div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<RadioGroup name="plan" options={OPTIONS} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('a11y (axe)', () => {
  it('has no detectable axe violations in default render', async () => {
    const { container } = render(<RadioGroup name="plan" label="Plan" options={OPTIONS} />);
    await expectNoA11yViolations(container);
  });
});
