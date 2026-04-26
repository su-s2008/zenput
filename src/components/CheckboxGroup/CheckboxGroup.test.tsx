import { vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { CheckboxGroup } from './CheckboxGroup';
import { expectNoA11yViolations } from '../../test-utils/axe';

const OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
];

describe('CheckboxGroup', () => {
  it('renders without errors', () => {
    const { container } = render(<CheckboxGroup options={OPTIONS} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders group label', () => {
    render(<CheckboxGroup label="Frameworks" options={OPTIONS} />);
    expect(screen.getByText('Frameworks')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<CheckboxGroup options={OPTIONS} />);
    expect(screen.getByLabelText('React')).toBeInTheDocument();
    expect(screen.getByLabelText('Vue')).toBeInTheDocument();
    expect(screen.getByLabelText('Angular')).toBeInTheDocument();
  });

  it('pre-selects defaultValue options', () => {
    render(<CheckboxGroup options={OPTIONS} defaultValue={['react']} />);
    expect(screen.getByLabelText('React')).toBeChecked();
    expect(screen.getByLabelText('Vue')).not.toBeChecked();
  });

  it('calls onChange when an option is toggled', async () => {
    const handleChange = vi.fn();
    render(<CheckboxGroup options={OPTIONS} onChange={handleChange} />);
    await userEvent.click(screen.getByLabelText('React'));
    expect(handleChange).toHaveBeenCalledWith(['react']);
  });

  it('removes value when already-checked option is unchecked', async () => {
    const handleChange = vi.fn();
    render(<CheckboxGroup options={OPTIONS} defaultValue={['react']} onChange={handleChange} />);
    await userEvent.click(screen.getByLabelText('React'));
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('disables all options when disabled', () => {
    render(<CheckboxGroup options={OPTIONS} disabled />);
    screen.getAllByRole('checkbox').forEach((cb) => expect(cb).toBeDisabled());
  });

  it('renders error message', () => {
    render(
      <CheckboxGroup options={OPTIONS} validationState="error" errorMessage="Select at least one" />
    );
    expect(screen.getByText('Select at least one')).toBeInTheDocument();
  });

  it('forwards ref to wrapper div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<CheckboxGroup options={OPTIONS} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('a11y (axe)', () => {
  it('has no detectable axe violations in default render', async () => {
    const { container } = render(<CheckboxGroup label="Frameworks" options={OPTIONS} />);
    await expectNoA11yViolations(container);
  });
});
