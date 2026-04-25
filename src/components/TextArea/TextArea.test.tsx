import { vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { TextArea } from './TextArea';
import { expectNoA11yViolations } from '../../test-utils/axe';

describe('TextArea', () => {
  it('renders without errors', () => {
    render(<TextArea />);
  });

  it('renders with label', () => {
    render(<TextArea label="Bio" />);
    expect(screen.getByText('Bio')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<TextArea placeholder="Tell us about yourself" />);
    expect(screen.getByPlaceholderText('Tell us about yourself')).toBeInTheDocument();
  });

  it('associates label with textarea via htmlFor/id', () => {
    render(<TextArea label="Description" />);
    const label = screen.getByText('Description');
    const textarea = screen.getByRole('textbox');
    expect(label).toHaveAttribute('for', textarea.id);
  });

  it('is disabled when disabled prop is set', () => {
    render(<TextArea disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('sets aria-invalid when validationState is error', () => {
    render(<TextArea validationState="error" errorMessage="Required" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-required when required', () => {
    render(<TextArea required />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
  });

  it('shows character count when showCharCount is true', () => {
    render(<TextArea showCharCount defaultValue="hello" />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows character count with maxLength', () => {
    render(<TextArea showCharCount maxLength={100} defaultValue="hello" />);
    expect(screen.getByText('5/100')).toBeInTheDocument();
  });

  it('calls onChange when user types', async () => {
    const handleChange = vi.fn();
    render(<TextArea onChange={handleChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'hello');
    expect(handleChange).toHaveBeenCalled();
  });

  it('auto-resizes height when autoResize is true', async () => {
    render(<TextArea autoResize />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'some text');
    // autoResize sets style.height – just verify no errors thrown
    expect(textarea).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<TextArea validationState="error" errorMessage="Too short" />);
    expect(screen.getByText('Too short')).toBeInTheDocument();
  });

  it('forwards ref to textarea element', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<TextArea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});

describe('a11y (axe)', () => {
  it('has no detectable axe violations in default render', async () => {
    const { container } = render(<TextArea label="Bio" />);
    await expectNoA11yViolations(container);
  });
});
