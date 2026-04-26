/**
 * Shared state hook used by Dialog and Drawer. Both overlay-panel components
 * need identical context values for their open state, trigger-focus restoration,
 * accessible-name registration, and stable IDs.
 *
 * Not exported from the public package surface — use the concrete Dialog /
 * Drawer components instead.
 */
import React, { useCallback, useId, useMemo, useRef, useState } from 'react';
import { useDisclosure } from '../../../hooks/useDisclosure';

export interface OverlayPanelState {
  open: boolean;
  setOpen: (next: boolean) => void;
  /** Ref to the current trigger DOM node; used for focus restoration on close. */
  triggerRef: React.RefObject<HTMLElement | null>;
  /** Setter called by the trigger sub-component to register its DOM node. */
  setTriggerNode: (node: HTMLElement | null) => void;
  contentId: string;
  titleId: string;
  descriptionId: string;
  registerTitle: (mounted: boolean) => void;
  hasTitle: boolean;
  registerDescription: (mounted: boolean) => void;
  hasDescription: boolean;
}

export interface UseOverlayPanelStateOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Sets up the common state and stable callbacks shared by Dialog and Drawer.
 * Returns a memoised context-value object ready to be spread into a React
 * context provider.
 */
export function useOverlayPanelState({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
}: UseOverlayPanelStateOptions): OverlayPanelState {
  const { open, setOpen } = useDisclosure({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
  });

  const triggerRef = useRef<HTMLElement | null>(null);
  const contentId = useId();
  const titleId = useId();
  const descriptionId = useId();

  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);

  const setOpenBool = useCallback((next: boolean) => setOpen(next), [setOpen]);
  const setTriggerNode = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
  }, []);
  const registerTitle = useCallback((mounted: boolean) => setHasTitle(mounted), []);
  const registerDescription = useCallback((mounted: boolean) => setHasDescription(mounted), []);

  return useMemo<OverlayPanelState>(
    () => ({
      open,
      setOpen: setOpenBool,
      triggerRef,
      setTriggerNode,
      contentId,
      titleId,
      descriptionId,
      registerTitle,
      hasTitle,
      registerDescription,
      hasDescription,
    }),
    [
      open,
      setOpenBool,
      setTriggerNode,
      contentId,
      titleId,
      descriptionId,
      registerTitle,
      hasTitle,
      registerDescription,
      hasDescription,
    ]
  );
}
