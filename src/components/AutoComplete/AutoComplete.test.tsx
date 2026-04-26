import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { AutoComplete } from './AutoComplete';
import { expectNoA11yViolations } from '../../test-utils/axe';

const OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
];

describe('AutoComplete', () => {
  it('renders without errors', () => {
    render(<AutoComplete options={OPTIONS} />);
  });

  it('renders with label', () => {
    render(<AutoComplete label="Framework" options={OPTIONS} />);
    expect(screen.getByText('Framework')).toBeInTheDocument();
  });

  it('renders the text input', () => {
    render(<AutoComplete options={OPTIONS} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows dropdown options when focused', async () => {
    render(<AutoComplete options={OPTIONS} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'React' })).toBeInTheDocument();
  });

  it('filters options based on input', async () => {
    render(<AutoComplete options={OPTIONS} />);
    await userEvent.type(screen.getByRole('combobox'), 'vue');
    expect(screen.getByRole('option', { name: 'Vue' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'React' })).not.toBeInTheDocument();
  });

  it('selects an option on click', async () => {
    const handleSelect = vi.fn();
    render(<AutoComplete options={OPTIONS} onSelect={handleSelect} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'React' }));
    expect(handleSelect).toHaveBeenCalledWith({ value: 'react', label: 'React' });
  });

  it('shows no options message when no results', async () => {
    render(<AutoComplete options={OPTIONS} noOptionsMessage="Nothing found" />);
    await userEvent.type(screen.getByRole('combobox'), 'xyz');
    expect(screen.getByText('Nothing found')).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    render(<AutoComplete options={OPTIONS} loading />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is set', () => {
    render(<AutoComplete options={OPTIONS} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('calls onSearch when typing', async () => {
    const handleSearch = vi.fn();
    render(<AutoComplete options={OPTIONS} onSearch={handleSearch} />);
    await userEvent.type(screen.getByRole('combobox'), 'reac');
    expect(handleSearch).toHaveBeenCalledWith('reac');
  });

  it('renders error message', () => {
    render(
      <AutoComplete options={OPTIONS} validationState="error" errorMessage="Selection required" />
    );
    expect(screen.getByText('Selection required')).toBeInTheDocument();
  });

  it('navigates options with arrow keys', async () => {
    render(<AutoComplete options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant');
  });

  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<AutoComplete options={OPTIONS} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('closes dropdown on Escape key', async () => {
    render(<AutoComplete options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens dropdown on ArrowDown when closed', async () => {
    render(<AutoComplete options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('opens dropdown on Enter when closed', async () => {
    render(<AutoComplete options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('navigates up with ArrowUp key', async () => {
    render(<AutoComplete options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-activedescendant');
  });

  it('selects highlighted option on Enter', async () => {
    const handleSelect = vi.fn();
    render(<AutoComplete options={OPTIONS} onSelect={handleSelect} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    expect(handleSelect).toHaveBeenCalledWith(OPTIONS[0]);
  });

  it('closes dropdown with allowCustomValue on Enter without highlight', async () => {
    render(<AutoComplete options={OPTIONS} allowCustomValue />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    fireEvent.keyDown(input, { key: 'Enter' });
    // With allowCustomValue and no highlighted index, dropdown closes
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('does not show dropdown when readOnly', async () => {
    render(<AutoComplete options={OPTIONS} readOnly />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('calls onFocus when input is focused', async () => {
    const handleFocus = vi.fn();
    render(<AutoComplete options={OPTIONS} onFocus={handleFocus} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(handleFocus).toHaveBeenCalled();
  });

  it('calls onBlur when input loses focus', async () => {
    const handleBlur = vi.fn();
    render(<AutoComplete options={OPTIONS} onBlur={handleBlur} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
  });

  it('closes dropdown when clicking outside', async () => {
    render(
      <div>
        <AutoComplete options={OPTIONS} />
        <button data-testid="outside">Outside</button>
      </div>
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes dropdown on blur after the blur timeout runs', () => {
    vi.useFakeTimers();
    try {
      render(<AutoComplete options={OPTIONS} />);
      const input = screen.getByRole('combobox');
      fireEvent.focus(input);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.blur(input);

      act(() => {
        vi.runAllTimers();
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not close dropdown immediately on blur (close is deferred by timeout)', () => {
    render(<AutoComplete options={OPTIONS} />);
    const input = screen.getByRole('combobox');

    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Blur fires but the dropdown must not close synchronously — only after
    // the blur-delay timer fires.
    fireEvent.blur(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('cleans up blur timeout on unmount', () => {
    const { unmount } = render(<AutoComplete options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.blur(input);
    // Unmount while timeout is pending – should not throw
    expect(() => unmount()).not.toThrow();
  });

  it('works in controlled mode', () => {
    const handleChange = vi.fn();
    render(<AutoComplete options={OPTIONS} value="React" onChange={handleChange} />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('React');
    fireEvent.change(input, { target: { value: 'x' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('does not select a disabled option', () => {
    const disabledOptions = [
      { value: 'react', label: 'React', disabled: true },
      { value: 'vue', label: 'Vue' },
    ];
    const handleSelect = vi.fn();
    render(<AutoComplete options={disabledOptions} onSelect={handleSelect} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    const option = screen.getByRole('option', { name: 'React' });
    fireEvent.mouseDown(option);
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it('highlights option on mouse enter', () => {
    render(<AutoComplete options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    const option = screen.getByRole('option', { name: 'Vue' });
    fireEvent.mouseEnter(option);
    expect(input).toHaveAttribute('aria-activedescendant');
  });
});

describe('a11y (axe)', () => {
  it('has no detectable axe violations in default render', async () => {
    const { container } = render(<AutoComplete label="Framework" options={OPTIONS} />);
    await expectNoA11yViolations(container);
  });
});
