import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { SearchInput } from './SearchInput';
import { expectNoA11yViolations } from '../../test-utils/axe';

describe('SearchInput', () => {
  it('renders without errors', () => {
    render(<SearchInput />);
  });

  it('renders with label', () => {
    render(<SearchInput label="Search" />);
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders as type="search"', () => {
    render(<SearchInput />);
    expect(document.querySelector('input[type="search"]')).toBeInTheDocument();
  });

  it('shows a search icon by default', () => {
    render(<SearchInput />);
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('shows clear button when value is present', async () => {
    render(<SearchInput />);
    const input = document.querySelector('input') as HTMLInputElement;
    await userEvent.type(input, 'hello');
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('hides clear button when value is empty', () => {
    render(<SearchInput />);
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('calls onSearch when Enter is pressed', async () => {
    const handleSearch = vi.fn();
    render(<SearchInput onSearch={handleSearch} />);
    const input = document.querySelector('input') as HTMLInputElement;
    await userEvent.type(input, 'react{Enter}');
    expect(handleSearch).toHaveBeenCalledWith('react');
  });

  it('is disabled when disabled prop is set', () => {
    render(<SearchInput disabled />);
    expect(document.querySelector('input')).toBeDisabled();
  });

  it('renders error message', () => {
    render(<SearchInput validationState="error" errorMessage="Search failed" />);
    expect(screen.getByText('Search failed')).toBeInTheDocument();
  });

  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<SearchInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('clears the input when clear button is clicked', async () => {
    render(<SearchInput />);
    const input = document.querySelector('input') as HTMLInputElement;
    await userEvent.type(input, 'hello');
    const clearBtn = screen.getByLabelText('Clear search');
    await userEvent.click(clearBtn);
    expect(input).toHaveValue('');
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('calls onSearch with empty string when clear button is clicked', async () => {
    const handleSearch = vi.fn();
    render(<SearchInput onSearch={handleSearch} />);
    const input = document.querySelector('input') as HTMLInputElement;
    await userEvent.type(input, 'test');
    const clearBtn = screen.getByLabelText('Clear search');
    await userEvent.click(clearBtn);
    expect(handleSearch).toHaveBeenCalledWith('');
  });

  it('calls onChange with synthetic event when clear is clicked in controlled mode', () => {
    const handleChange = vi.fn();
    render(<SearchInput value="existing" onChange={handleChange} />);
    const clearBtn = screen.getByLabelText('Clear search');
    fireEvent.click(clearBtn);
    expect(handleChange).toHaveBeenCalled();
  });

  it('hides search icon when showSearchIcon is false', () => {
    render(<SearchInput showSearchIcon={false} />);
    expect(screen.queryByText('🔍')).not.toBeInTheDocument();
  });

  it('calls onKeyDown when a key is pressed', async () => {
    const handleKeyDown = vi.fn();
    render(<SearchInput onKeyDown={handleKeyDown} />);
    const input = document.querySelector('input') as HTMLInputElement;
    await userEvent.type(input, '{Enter}');
    expect(handleKeyDown).toHaveBeenCalled();
  });
});

describe('a11y (axe)', () => {
  it('has no detectable axe violations in default render', async () => {
    const { container } = render(<SearchInput label="Search" />);
    await expectNoA11yViolations(container);
  });
});
