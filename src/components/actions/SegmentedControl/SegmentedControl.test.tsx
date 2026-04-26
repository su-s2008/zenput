import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  SegmentedControl,
  SegmentedControlItem,
  ToggleGroup,
  ToggleGroupItem,
} from './SegmentedControl';
import { expectNoA11yViolations } from '../../../test-utils/axe';

function BasicSC(props: { onChange?: (v: string) => void }) {
  return (
    <SegmentedControl defaultValue="day" aria-label="Period" onChange={props.onChange}>
      <SegmentedControlItem value="day">Day</SegmentedControlItem>
      <SegmentedControlItem value="week">Week</SegmentedControlItem>
      <SegmentedControlItem value="month">Month</SegmentedControlItem>
    </SegmentedControl>
  );
}

describe('SegmentedControl', () => {
  it('renders all items', () => {
    render(<BasicSC />);
    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('Week')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
  });

  it('defaults to defaultValue', () => {
    render(<BasicSC />);
    const dayBtn = screen.getByRole('radio', { name: 'Day' });
    expect(dayBtn).toHaveAttribute('aria-checked', 'true');
  });

  it('switches selection on click', async () => {
    render(<BasicSC />);
    await userEvent.click(screen.getByRole('radio', { name: 'Week' }));
    expect(screen.getByRole('radio', { name: 'Week' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange when selection changes', async () => {
    const onChange = vi.fn();
    render(<BasicSC onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Week' }));
    expect(onChange).toHaveBeenCalledWith('week');
  });

  it('is a radiogroup', () => {
    render(<BasicSC />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('navigates with ArrowRight', () => {
    render(<BasicSC />);
    const group = screen.getByRole('radiogroup');
    screen.getByRole('radio', { name: 'Day' }).focus();
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(screen.getByRole('radio', { name: 'Week' })).toHaveAttribute('aria-checked', 'true');
  });

  it('navigates with ArrowLeft and wraps', () => {
    render(<BasicSC />);
    const group = screen.getByRole('radiogroup');
    screen.getByRole('radio', { name: 'Day' }).focus();
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(screen.getByRole('radio', { name: 'Month' })).toHaveAttribute('aria-checked', 'true');
  });

  it('goes to first item on Home key', () => {
    render(<BasicSC />);
    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'Home' });
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveAttribute('aria-checked', 'true');
  });

  it('goes to last item on End key', () => {
    render(<BasicSC />);
    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'End' });
    expect(screen.getByRole('radio', { name: 'Month' })).toHaveAttribute('aria-checked', 'true');
  });

  it('works in controlled mode', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <SegmentedControl value="day" onChange={onChange} aria-label="P">
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
      </SegmentedControl>
    );
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('radio', { name: 'Week' }));
    expect(onChange).toHaveBeenCalledWith('week');
    // value prop hasn't changed so still day
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveAttribute('aria-checked', 'true');

    rerender(
      <SegmentedControl value="week" onChange={onChange} aria-label="P">
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
      </SegmentedControl>
    );
    expect(screen.getByRole('radio', { name: 'Week' })).toHaveAttribute('aria-checked', 'true');
  });

  it('throws when SegmentedControlItem is used outside SegmentedControl', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<SegmentedControlItem value="x">X</SegmentedControlItem>)).toThrow();
    spy.mockRestore();
  });

  it('renders with leftIcon on SegmentedControlItem', () => {
    render(
      <SegmentedControl defaultValue="a" aria-label="P">
        <SegmentedControlItem value="a" leftIcon={<span data-testid="icon">★</span>}>
          A
        </SegmentedControlItem>
      </SegmentedControl>
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});

describe('ToggleGroup — single', () => {
  it('renders with role="group"', () => {
    render(
      <ToggleGroup type="single" defaultValue="a" aria-label="Formatting">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('selects item on click', async () => {
    render(
      <ToggleGroup type="single" defaultValue="a" aria-label="Fmt">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    );
    await userEvent.click(screen.getByRole('button', { name: 'B' }));
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onValueChange on click', async () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup type="single" defaultValue="a" aria-label="Fmt" onValueChange={onValueChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    );
    await userEvent.click(screen.getByRole('button', { name: 'B' }));
    expect(onValueChange).toHaveBeenCalledWith('b');
  });
});

describe('ToggleGroup — multiple', () => {
  it('toggles multiple items independently', async () => {
    render(
      <ToggleGroup type="multiple" defaultValue={['a']} aria-label="Fmt">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
        <ToggleGroupItem value="c">C</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'B' }));
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('aria-pressed', 'true');
    // A still selected
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('deselects an already-selected item', async () => {
    render(
      <ToggleGroup type="multiple" defaultValue={['a', 'b']} aria-label="Fmt">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    );
    await userEvent.click(screen.getByRole('button', { name: 'A' }));
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('throws when ToggleGroupItem is used outside ToggleGroup', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ToggleGroupItem value="x">X</ToggleGroupItem>)).toThrow();
    spy.mockRestore();
  });
});

describe('SegmentedControl a11y (axe)', () => {
  it('has no axe violations', async () => {
    const { container } = render(
      <SegmentedControl defaultValue="day" aria-label="Period">
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="month">Month</SegmentedControlItem>
      </SegmentedControl>
    );
    await expectNoA11yViolations(container);
  });
});

describe('ToggleGroup a11y (axe)', () => {
  it('has no axe violations for single', async () => {
    const { container } = render(
      <ToggleGroup type="single" defaultValue="bold" aria-label="Text formatting">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>
    );
    await expectNoA11yViolations(container);
  });

  it('has no axe violations for multiple', async () => {
    const { container } = render(
      <ToggleGroup type="multiple" defaultValue={['bold']} aria-label="Text formatting">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>
    );
    await expectNoA11yViolations(container);
  });
});
