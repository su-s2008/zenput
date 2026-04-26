import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip';

afterEach(() => {
  document.querySelectorAll('[data-zenput-portal]').forEach((el) => el.remove());
  vi.useRealTimers();
});

function BasicTooltip({
  openDelay = 0,
  closeDelay = 0,
}: {
  openDelay?: number;
  closeDelay?: number;
}) {
  return (
    <Tooltip openDelay={openDelay} closeDelay={closeDelay}>
      <TooltipTrigger>
        <button>Hover me</button>
      </TooltipTrigger>
      <TooltipContent>Helpful label</TooltipContent>
    </Tooltip>
  );
}

describe('Tooltip', () => {
  it('is hidden by default', () => {
    render(<BasicTooltip />);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('opens on focus and closes on blur (no delay)', () => {
    render(<BasicTooltip />);
    const trigger = screen.getByRole('button', { name: 'Hover me' });

    act(() => {
      fireEvent.focus(trigger);
    });
    expect(screen.getByRole('tooltip')).toHaveTextContent('Helpful label');

    act(() => {
      fireEvent.blur(trigger);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('opens on pointer enter after openDelay', () => {
    vi.useFakeTimers();
    render(<BasicTooltip openDelay={100} closeDelay={0} />);
    const trigger = screen.getByRole('button');

    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('sets aria-describedby on the trigger while open', () => {
    render(<BasicTooltip />);
    const trigger = screen.getByRole('button');
    act(() => fireEvent.focus(trigger));

    const tooltip = screen.getByRole('tooltip');
    expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id);
  });

  it('closes on Escape keydown from the trigger', () => {
    render(<BasicTooltip />);
    const trigger = screen.getByRole('button');
    act(() => fireEvent.focus(trigger));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(trigger, { key: 'Escape' });
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('TooltipProvider supplies default delays to nested tooltips', () => {
    vi.useFakeTimers();
    render(
      <TooltipProvider openDelay={50} closeDelay={0}>
        <Tooltip>
          <TooltipTrigger>
            <button>x</button>
          </TooltipTrigger>
          <TooltipContent>Label</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    act(() => fireEvent.pointerEnter(screen.getByRole('button')));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('closes after closeDelay on pointer leave and cancels if re-entered', () => {
    vi.useFakeTimers();
    render(<BasicTooltip openDelay={0} closeDelay={100} />);
    const trigger = screen.getByRole('button');

    act(() => fireEvent.pointerEnter(trigger));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    act(() => fireEvent.pointerLeave(trigger));
    // Still open — closeDelay hasn't elapsed.
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('merges existing event handlers on the trigger child', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onPointerEnter = vi.fn();
    const onPointerLeave = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <Tooltip openDelay={0} closeDelay={0}>
        <TooltipTrigger>
          <button
            onFocus={onFocus}
            onBlur={onBlur}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onKeyDown={onKeyDown}
            aria-describedby="user-desc"
          >
            x
          </button>
        </TooltipTrigger>
        <TooltipContent>Label</TooltipContent>
      </Tooltip>
    );
    const trigger = screen.getByRole('button');
    act(() => fireEvent.pointerEnter(trigger));
    act(() => fireEvent.focus(trigger));
    act(() => fireEvent.keyDown(trigger, { key: 'a' }));
    act(() => fireEvent.pointerLeave(trigger));
    act(() => fireEvent.blur(trigger));

    expect(onPointerEnter).toHaveBeenCalled();
    expect(onPointerLeave).toHaveBeenCalled();
    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('merges an existing aria-describedby with the tooltip id', () => {
    render(
      <Tooltip openDelay={0}>
        <TooltipTrigger>
          <button aria-describedby="user-desc">x</button>
        </TooltipTrigger>
        <TooltipContent>Label</TooltipContent>
      </Tooltip>
    );
    const trigger = screen.getByRole('button');
    act(() => fireEvent.focus(trigger));

    const tooltip = screen.getByRole('tooltip');
    expect(trigger.getAttribute('aria-describedby')).toBe(`user-desc ${tooltip.id}`);
  });

  it('stays open while pointer is over the content', () => {
    vi.useFakeTimers();
    render(<BasicTooltip openDelay={0} closeDelay={100} />);
    const trigger = screen.getByRole('button');
    act(() => fireEvent.pointerEnter(trigger));

    const tooltip = screen.getByRole('tooltip');
    act(() => fireEvent.pointerLeave(trigger));
    act(() => fireEvent.pointerEnter(tooltip));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    // Pointer-enter on tooltip calls openNow, keeping it visible.
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it.each([
    ['top', 'start'],
    ['top', 'end'],
    ['bottom', 'center'],
    ['left', 'start'],
    ['left', 'end'],
    ['left', 'center'],
    ['right', 'start'],
    ['right', 'end'],
    ['right', 'center'],
  ] as const)('positions with side=%s align=%s', (side, align) => {
    render(
      <Tooltip openDelay={0} defaultOpen>
        <TooltipTrigger>
          <button>x</button>
        </TooltipTrigger>
        <TooltipContent side={side} align={align}>
          Label
        </TooltipContent>
      </Tooltip>
    );
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveAttribute('data-side', side);
    expect(tooltip).toHaveAttribute('data-align', align);
  });

  it('renders inline (no portal) when withPortal=false', () => {
    render(
      <div data-testid="wrapper">
        <Tooltip defaultOpen>
          <TooltipTrigger>
            <button>x</button>
          </TooltipTrigger>
          <TooltipContent withPortal={false}>Label</TooltipContent>
        </Tooltip>
      </div>
    );
    const wrapper = screen.getByTestId('wrapper');
    expect(wrapper).toContainElement(screen.getByRole('tooltip'));
  });
});
