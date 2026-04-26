import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { MultiSelect } from './MultiSelect';
import { MultiSelectOption } from './MultiSelect.types';

const OPTIONS: MultiSelectOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte', disabled: true },
];

describe('MultiSelect', () => {
  it('renders without errors', () => {
    render(<MultiSelect options={OPTIONS} />);
  });

  it('renders with label', () => {
    render(<MultiSelect label="Frameworks" options={OPTIONS} />);
    expect(screen.getByText('Frameworks')).toBeInTheDocument();
  });

  it('renders the combobox input', () => {
    render(<MultiSelect options={OPTIONS} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows dropdown options when focused', async () => {
    render(<MultiSelect options={OPTIONS} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'React' })).toBeInTheDocument();
  });

  it('selects an option on click and shows it as a tag', async () => {
    const handleChange = vi.fn();
    render(<MultiSelect options={OPTIONS} onChange={handleChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'React' }));
    expect(handleChange).toHaveBeenCalledWith([{ value: 'react', label: 'React' }]);
  });

  it('deselects an option when clicked again', async () => {
    const handleChange = vi.fn();
    const selected = [OPTIONS[0]];
    render(<MultiSelect options={OPTIONS} value={selected} onChange={handleChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'React' }));
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('removes a tag via the remove button', async () => {
    const handleChange = vi.fn();
    render(
      <MultiSelect
        options={OPTIONS}
        value={[OPTIONS[0]]}
        onChange={handleChange}
      />
    );
    const removeBtn = screen.getByRole('button', { name: /Remove React/i });
    await userEvent.click(removeBtn);
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('removes last tag on Backspace when input is empty', async () => {
    const handleChange = vi.fn();
    render(
      <MultiSelect
        options={OPTIONS}
        value={[OPTIONS[0], OPTIONS[1]]}
        onChange={handleChange}
      />
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{Backspace}');
    expect(handleChange).toHaveBeenCalledWith([OPTIONS[0]]);
  });

  it('filters options based on search input', async () => {
    render(<MultiSelect options={OPTIONS} />);
    await userEvent.type(screen.getByRole('combobox'), 'vue');
    expect(screen.getByRole('option', { name: 'Vue' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'React' })).not.toBeInTheDocument();
  });

  it('shows no options message when no results', async () => {
    render(<MultiSelect options={OPTIONS} noOptionsMessage="Nothing found" />);
    await userEvent.type(screen.getByRole('combobox'), 'xyz');
    expect(screen.getByText('Nothing found')).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    render(<MultiSelect options={OPTIONS} loading />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  });

  it('is disabled when disabled prop is set', () => {
    render(<MultiSelect options={OPTIONS} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('does not select a disabled option', async () => {
    const handleChange = vi.fn();
    render(<MultiSelect options={OPTIONS} onChange={handleChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    const disabledOpt = screen.getByRole('option', { name: 'Svelte' });
    fireEvent.mouseDown(disabledOpt);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('respects maxTags limit', async () => {
    const handleChange = vi.fn();
    render(
      <MultiSelect
        options={OPTIONS}
        value={[OPTIONS[0], OPTIONS[1]]}
        onChange={handleChange}
        maxTags={2}
      />
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'Angular' }));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('clears all selections with clearable button', async () => {
    const handleChange = vi.fn();
    render(
      <MultiSelect
        options={OPTIONS}
        value={[OPTIONS[0], OPTIONS[1]]}
        onChange={handleChange}
        clearable
      />
    );
    const clearBtn = screen.getByRole('button', { name: /Clear all/i });
    fireEvent.mouseDown(clearBtn);
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('allows creatable entries', async () => {
    const handleChange = vi.fn();
    render(<MultiSelect options={OPTIONS} onChange={handleChange} creatable />);
    await userEvent.type(screen.getByRole('combobox'), 'SolidJS');
    const createOption = screen.getByText(/Create "SolidJS"/i);
    fireEvent.mouseDown(createOption);
    expect(handleChange).toHaveBeenCalled();
    const call = handleChange.mock.calls[0][0] as MultiSelectOption[];
    expect(call[0].label).toBe('SolidJS');
  });

  it('groups options by groupBy function', async () => {
    const groupedOptions: MultiSelectOption[] = [
      { value: 'react', label: 'React', category: 'Frontend' },
      { value: 'vue', label: 'Vue', category: 'Frontend' },
      { value: 'express', label: 'Express', category: 'Backend' },
    ];
    render(
      <MultiSelect
        options={groupedOptions}
        groupBy={(o) => String(o.category)}
      />
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('navigates options with arrow keys', async () => {
    render(<MultiSelect options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant');
  });

  it('selects highlighted option on Enter', async () => {
    const handleChange = vi.fn();
    render(<MultiSelect options={OPTIONS} onChange={handleChange} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    expect(handleChange).toHaveBeenCalled();
  });

  it('closes dropdown on Escape key', async () => {
    render(<MultiSelect options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens dropdown on ArrowDown when closed', () => {
    render(<MultiSelect options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('does not show dropdown when readOnly', async () => {
    render(<MultiSelect options={OPTIONS} readOnly />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    render(
      <div>
        <MultiSelect options={OPTIONS} />
        <button data-testid="outside">Outside</button>
      </div>
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes dropdown on blur after timeout', () => {
    vi.useFakeTimers();
    try {
      render(<MultiSelect options={OPTIONS} />);
      const input = screen.getByRole('combobox');
      fireEvent.focus(input);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      fireEvent.blur(input);
      act(() => { vi.runAllTimers(); });
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not close dropdown immediately on blur', () => {
    render(<MultiSelect options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.blur(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('works in controlled mode', () => {
    const handleChange = vi.fn();
    render(
      <MultiSelect
        options={OPTIONS}
        value={[OPTIONS[0]]}
        onChange={handleChange}
      />
    );
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('renders helper text', () => {
    render(<MultiSelect options={OPTIONS} helperText="Pick frameworks" />);
    expect(screen.getByText('Pick frameworks')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(
      <MultiSelect options={OPTIONS} validationState="error" errorMessage="Required" />
    );
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('loads options asynchronously', async () => {
    const loadOptions = vi.fn().mockResolvedValue([
      { value: 'async1', label: 'Async Option 1' },
    ]);
    vi.useFakeTimers();
    try {
      render(<MultiSelect loadOptions={loadOptions} debounceMs={300} />);
      const input = screen.getByRole('combobox');
      fireEvent.focus(input);
      act(() => { vi.advanceTimersByTime(300); });
      await act(async () => { await Promise.resolve(); });
      expect(loadOptions).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('uses custom renderTag function', async () => {
    render(
      <MultiSelect
        options={OPTIONS}
        value={[OPTIONS[0]]}
        renderTag={(opt, onRemove) => (
          <button
            key={opt.value}
            type="button"
            data-testid="custom-tag"
            onClick={onRemove}
          >
            {opt.label}
          </button>
        )}
      />
    );
    expect(screen.getByTestId('custom-tag')).toHaveTextContent('React');
  });

  it('uses custom renderOption function', async () => {
    render(<MultiSelect options={OPTIONS} renderOption={(o) => <em>{o.label}</em>} />);
    await userEvent.click(screen.getByRole('combobox'));
    const emEl = screen.getByText('React').closest('em');
    expect(emEl).toBeInTheDocument();
  });

  it('navigates up with ArrowUp key', async () => {
    render(<MultiSelect options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-activedescendant');
  });

  it('highlights option on mouse enter', async () => {
    render(<MultiSelect options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    const opt = screen.getByRole('option', { name: 'Vue' });
    fireEvent.mouseEnter(opt);
    expect(input).toHaveAttribute('aria-activedescendant');
  });

  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<MultiSelect options={OPTIONS} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
