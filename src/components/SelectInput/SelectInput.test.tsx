import { vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { SelectInput } from './SelectInput';
import { expectNoA11yViolations } from '../../test-utils/axe';

const OPTIONS = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
];

describe('SelectInput', () => {
  it('renders without errors', () => {
    render(<SelectInput options={OPTIONS} />);
  });

  it('renders with label', () => {
    render(<SelectInput label="Country" options={OPTIONS} />);
    expect(screen.getByText('Country')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<SelectInput options={OPTIONS} />);
    expect(screen.getByRole('option', { name: 'United States' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'United Kingdom' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Canada' })).toBeInTheDocument();
  });

  it('renders placeholder as disabled option', () => {
    render(<SelectInput options={OPTIONS} placeholder="Select a country" />);
    const placeholder = screen.getByRole('option', { name: 'Select a country' });
    expect(placeholder).toBeDisabled();
  });

  it('is disabled when disabled prop is set', () => {
    render(<SelectInput options={OPTIONS} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('associates label with select via htmlFor/id', () => {
    render(<SelectInput label="Country" options={OPTIONS} />);
    const label = screen.getByText('Country');
    const select = screen.getByRole('combobox');
    expect(label).toHaveAttribute('for', select.id);
  });

  it('renders error message when validationState is error', () => {
    render(<SelectInput options={OPTIONS} validationState="error" errorMessage="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('calls onChange when option is selected', async () => {
    const handleChange = vi.fn();
    render(<SelectInput options={OPTIONS} onChange={handleChange} />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'uk');
    expect(handleChange).toHaveBeenCalled();
  });

  it('forwards ref to select element', () => {
    const ref = React.createRef<HTMLSelectElement>();
    render(<SelectInput options={OPTIONS} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  // ── Multi-select ──────────────────────────────────────────────────────────

  it('renders chips for preselected values when multiple is true', () => {
    render(<SelectInput options={OPTIONS} multiple selectedValues={['us', 'ca']} />);
    expect(screen.getByRole('button', { name: 'Remove United States' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Canada' })).toBeInTheDocument();
  });

  it('calls onSelectedValuesChange when a chip is removed', async () => {
    const handleChange = vi.fn();
    render(
      <SelectInput
        options={OPTIONS}
        multiple
        selectedValues={['us', 'ca']}
        onSelectedValuesChange={handleChange}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remove United States' }));
    expect(handleChange).toHaveBeenCalledWith(['ca']);
  });

  it('adds a value via the select when multiple is true', async () => {
    const handleChange = vi.fn();
    render(
      <SelectInput
        options={OPTIONS}
        multiple
        selectedValues={[]}
        onSelectedValuesChange={handleChange}
      />
    );
    await userEvent.selectOptions(screen.getByRole('combobox'), 'uk');
    expect(handleChange).toHaveBeenCalledWith(['uk']);
  });

  it('renders with required label', () => {
    render(<SelectInput label="Country" options={OPTIONS} required />);
    expect(screen.getByText('Country')).toBeInTheDocument();
  });

  it('renders success message', () => {
    render(<SelectInput options={OPTIONS} validationState="success" successMessage="Valid!" />);
    expect(screen.getByText('Valid!')).toBeInTheDocument();
  });

  it('renders multiple select with default placeholder when no placeholder prop', () => {
    render(<SelectInput options={OPTIONS} multiple selectedValues={[]} />);
    // Multiple mode renders a first option as placeholder
    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeInTheDocument();
  });

  it('getLabel falls back to value when option not found', async () => {
    const handleChange = vi.fn();
    render(
      <SelectInput
        options={OPTIONS}
        multiple
        selectedValues={['unknown-value']}
        onSelectedValuesChange={handleChange}
      />
    );
    // The chip label should fall back to the raw value when option not found
    expect(screen.getByRole('button', { name: 'Remove unknown-value' })).toBeInTheDocument();
  });
});

describe('a11y (axe)', () => {
  it('has no detectable axe violations in default render', async () => {
    const { container } = render(<SelectInput label="Country" options={OPTIONS} />);
    await expectNoA11yViolations(container);
  });
});
