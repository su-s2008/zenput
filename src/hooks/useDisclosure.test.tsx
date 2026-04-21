import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { useDisclosure } from './useDisclosure';

function Harness({
  open,
  onOpenChange,
  defaultOpen,
}: {
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  defaultOpen?: boolean;
}) {
  const d = useDisclosure({ open, onOpenChange, defaultOpen });
  return (
    <div>
      <span data-testid="open">{String(d.open)}</span>
      <button onClick={d.onOpen}>open</button>
      <button onClick={d.onClose}>close</button>
      <button onClick={d.onToggle}>toggle</button>
      <button
        onClick={() => d.setOpen((prev) => !prev)}
        data-testid="updater"
      >
        updater
      </button>
    </div>
  );
}

describe('useDisclosure', () => {
  it('starts closed by default and opens/closes/toggles', () => {
    render(<Harness />);
    expect(screen.getByTestId('open')).toHaveTextContent('false');
    act(() => {
      screen.getByText('open').click();
    });
    expect(screen.getByTestId('open')).toHaveTextContent('true');
    act(() => {
      screen.getByText('toggle').click();
    });
    expect(screen.getByTestId('open')).toHaveTextContent('false');
    act(() => {
      screen.getByText('close').click();
    });
    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('respects defaultOpen', () => {
    render(<Harness defaultOpen />);
    expect(screen.getByTestId('open')).toHaveTextContent('true');
  });

  it('supports functional updater and is resilient to sequential toggles', () => {
    render(<Harness />);
    act(() => {
      // Two updater calls in a single batch — should end up back at false.
      screen.getByTestId('updater').click();
      screen.getByTestId('updater').click();
    });
    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('reports changes via onOpenChange in uncontrolled mode only when value changes', () => {
    const onOpenChange = jest.fn();
    render(<Harness onOpenChange={onOpenChange} />);
    act(() => {
      screen.getByText('open').click();
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    act(() => {
      // Same value — should not re-fire.
      screen.getByText('open').click();
    });
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it('in controlled mode, notifies onOpenChange and resolves updater against the current prop', () => {
    const onOpenChange = jest.fn();
    const { rerender } = render(
      <Harness open={false} onOpenChange={onOpenChange} />
    );
    act(() => {
      screen.getByText('toggle').click();
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    rerender(<Harness open={true} onOpenChange={onOpenChange} />);
    act(() => {
      screen.getByTestId('updater').click();
    });
    // Should resolve against current prop (true) => false.
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});
