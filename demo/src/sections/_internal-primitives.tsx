// Build-check stub only — not referenced from App.tsx.
// Importing each new primitive here catches broken re-exports at demo build time.
import { Portal } from 'zenput';
import { useControllableState, useFocusTrap } from 'zenput';
import type { PortalProps, UseControllableStateOptions, UseFocusTrapOptions } from 'zenput';

// Silence "unused variable" lint warnings — this module is intentionally unused at runtime.
void Portal;
void useControllableState;
void useFocusTrap;
void (null as unknown as PortalProps);
void (null as unknown as UseControllableStateOptions<unknown>);
void (null as unknown as UseFocusTrapOptions);
