import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { Combobox } from './Combobox';
import { ComboboxOption } from './Combobox.types';

const OPTIONS: ComboboxOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte', disabled: true },
];

describe('Combobox', () => {
  it('renders without errors', () => {
    render(<Combobox options={OPTIONS} />);
  });

  it('renders with label', () => {
    render(<Combobox label="Framework" options={OPTIONS} />);
    expect(screen.getByText('Framework')).toBeInTheDocument();
  });

  it('renders the combobox input', () => {
    render(<Combobox options={OPTIONS} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows dropdown options when focused', async () => {
    render(<Combobox options={OPTIONS} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'React' })).toBeInTheDocument();
  });

  it('selects an option on click', async () => {
    const handleChange = vi.fn();
    render(<Combobox options={OPTIONS} onChange={handleChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'React' }));
    expect(handleChange).toHaveBeenCalledWith({ value: 'react', label: 'React' });
  });

  it('fills input with selected option label', async () => {
    render(<Combobox options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.click(screen.getByRole('option', { name: 'React' }));
    expect(input).toHaveValue('React');
  });

  it('filters options based on input', async () => {
    render(<Combobox options={OPTIONS} />);
    await userEvent.type(screen.getByRole('combobox'), 'vue');
    expect(screen.getByRole('option', { name: 'Vue' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'React' })).not.toBeInTheDocument();
  });

  it('shows no options when no results', async () => {
    render(<Combobox options={OPTIONS} />);
    await userEvent.type(screen.getByRole('combobox'), 'xyz');
    expect(screen.getByText('No options found')).toBeInTheDocument();
  });

  it('shows custom emptyState', async () => {
    render(<Combobox options={OPTIONS} emptyState={<span>Nothing here</span>} />);
    await userEvent.type(screen.getByRole('combobox'), 'xyz');
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('shows loading state with custom loadingState', async () => {
    const loadOptions = vi.fn(() => new Promise<ComboboxOption[]>(() => {}));
    vi.useFakeTimers();
    try {
      render(
        <Combobox
          loadOptions={loadOptions}
          loadingState={<span>Fetching…</span>}
          debounceMs={100}
        />
      );
      const input = screen.getByRole('combobox');
      fireEvent.focus(input);
      act(() => { vi.advanceTimersByTime(100); });
      await act(async () => { await Promise.resolve(); });
      expect(screen.getByRole('status')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('is disabled when disabled prop is set', () => {
    render(<Combobox options={OPTIONS} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('does not select a disabled option', async () => {
    const handleChange = vi.fn();
    render(<Combobox options={OPTIONS} onChange={handleChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    const disabledOpt = screen.getByRole('option', { name: 'Svelte' });
    fireEvent.mouseDown(disabledOpt);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('navigates options with arrow keys', async () => {
    render(<Combobox options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant');
  });

  it('selects highlighted option on Enter', async () => {
    const handleChange = vi.fn();
    render(<Combobox options={OPTIONS} onChange={handleChange} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    expect(handleChange).toHaveBeenCalled();
  });

  it('closes dropdown on Escape key', async () => {
    render(<Combobox options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('restores input value on Escape', async () => {
    render(<Combobox options={OPTIONS} value={OPTIONS[0]} onChange={vi.fn()} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.type(input, 'xyz');
    await userEvent.keyboard('{Escape}');
    expect(input).toHaveValue('React');
  });

  it('opens dropdown on ArrowDown when closed', () => {
    render(<Combobox options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('does not show dropdown when readOnly', async () => {
    render(<Combobox options={OPTIONS} readOnly />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('clears selection with clearable button', async () => {
    const handleChange = vi.fn();
    render(
      <Combobox
        options={OPTIONS}
        value={OPTIONS[0]}
        onChange={handleChange}
        clearable
      />
    );
    const clearBtn = screen.getByRole('button', { name: /Clear/i });
    fireEvent.mouseDown(clearBtn);
    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it('uses custom filter function', async () => {
    const customFilter = vi.fn((opts: ComboboxOption[]) => [opts[0]]);
    render(<Combobox options={OPTIONS} filter={customFilter} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.type(screen.getByRole('combobox'), 'r');
    expect(customFilter).toHaveBeenCalled();
  });

  it('groups options by groupBy function', async () => {
    const groupedOptions: ComboboxOption[] = [
      { value: 'react', label: 'React', category: 'Frontend' },
      { value: 'vue', label: 'Vue', category: 'Frontend' },
      { value: 'express', label: 'Express', category: 'Backend' },
    ];
    render(
      <Combobox
        options={groupedOptions}
        groupBy={(o) => String(o.category)}
      />
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    render(
      <div>
        <Combobox options={OPTIONS} />
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
      render(<Combobox options={OPTIONS} />);
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
    render(<Combobox options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.blur(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('works in controlled mode', () => {
    const handleChange = vi.fn();
    render(
      <Combobox options={OPTIONS} value={OPTIONS[0]} onChange={handleChange} />
    );
    expect(screen.getByRole('combobox')).toHaveValue('React');
  });

  it('syncs input when controlled value changes', () => {
    const { rerender } = render(
      <Combobox options={OPTIONS} value={OPTIONS[0]} onChange={vi.fn()} />
    );
    expect(screen.getByRole('combobox')).toHaveValue('React');
    rerender(<Combobox options={OPTIONS} value={OPTIONS[1]} onChange={vi.fn()} />);
    expect(screen.getByRole('combobox')).toHaveValue('Vue');
  });

  it('renders error message', () => {
    render(
      <Combobox options={OPTIONS} validationState="error" errorMessage="Required" />
    );
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('renders helper text', () => {
    render(<Combobox options={OPTIONS} helperText="Select a framework" />);
    expect(screen.getByText('Select a framework')).toBeInTheDocument();
  });

  it('uses custom renderOption function', async () => {
    render(
      <Combobox options={OPTIONS} renderOption={(o) => <strong>{o.label}</strong>} />
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('React').closest('strong')).toBeInTheDocument();
  });

  it('loads options asynchronously', async () => {
    const loadOptions = vi.fn().mockResolvedValue([
      { value: 'node', label: 'Node.js' },
    ]);
    vi.useFakeTimers();
    try {
      render(<Combobox loadOptions={loadOptions} debounceMs={300} />);
      const input = screen.getByRole('combobox');
      fireEvent.focus(input);
      act(() => { vi.advanceTimersByTime(300); });
      await act(async () => { await Promise.resolve(); });
      expect(loadOptions).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('guards against async race conditions', async () => {
    let resolveFirst!: (v: ComboboxOption[]) => void;
    let resolveSecond!: (v: ComboboxOption[]) => void;
    const firstPromise = new Promise<ComboboxOption[]>((r) => { resolveFirst = r; });
    const secondPromise = new Promise<ComboboxOption[]>((r) => { resolveSecond = r; });

    let callCount = 0;
    const loadOptions = vi.fn(() => {
      callCount++;
      return callCount === 1 ? firstPromise : secondPromise;
    });

    vi.useFakeTimers();
    try {
      render(<Combobox loadOptions={loadOptions} debounceMs={100} />);
      const input = screen.getByRole('combobox');
      fireEvent.focus(input);

      // First query
      fireEvent.change(input, { target: { value: 'r' } });
      act(() => { vi.advanceTimersByTime(100); });

      // Second query (overrides first)
      fireEvent.change(input, { target: { value: 'react' } });
      act(() => { vi.advanceTimersByTime(100); });

      // Resolve second first
      await act(async () => { resolveSecond([{ value: 'react', label: 'React' }]); });
      // Resolve first (stale – should be ignored)
      await act(async () => { resolveFirst([{ value: 'ruby', label: 'Ruby' }]); });

      // Only the second result should show
      expect(screen.queryByRole('option', { name: 'Ruby' })).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('navigates up with ArrowUp key', async () => {
    render(<Combobox options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-activedescendant');
  });

  it('highlights option on mouse enter', async () => {
    render(<Combobox options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    const opt = screen.getByRole('option', { name: 'Vue' });
    fireEvent.mouseEnter(opt);
    expect(input).toHaveAttribute('aria-activedescendant');
  });

  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Combobox options={OPTIONS} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
