import React, { forwardRef } from 'react';
import { Icon, IconProps } from '../Icon';

type BuiltInIconProps = Omit<IconProps, 'children' | 'viewBox'>;

function createIcon(displayName: string, path: React.ReactNode) {
  const Component = forwardRef<SVGSVGElement, BuiltInIconProps>((props, ref) => (
    <Icon ref={ref} {...props}>
      {path}
    </Icon>
  ));
  Component.displayName = displayName;
  return Component;
}

export const ChevronDownIcon = createIcon(
  'ChevronDownIcon',
  <polyline points="6 9 12 15 18 9" />
);

export const ChevronUpIcon = createIcon(
  'ChevronUpIcon',
  <polyline points="18 15 12 9 6 15" />
);

export const ChevronLeftIcon = createIcon(
  'ChevronLeftIcon',
  <polyline points="15 18 9 12 15 6" />
);

export const ChevronRightIcon = createIcon(
  'ChevronRightIcon',
  <polyline points="9 18 15 12 9 6" />
);

export const CloseIcon = createIcon(
  'CloseIcon',
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>
);

export const CheckIcon = createIcon(
  'CheckIcon',
  <polyline points="20 6 9 17 4 12" />
);

export const InfoIcon = createIcon(
  'InfoIcon',
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </>
);

export const WarningIcon = createIcon(
  'WarningIcon',
  <>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>
);

export const ErrorIcon = createIcon(
  'ErrorIcon',
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </>
);

export const SuccessIcon = createIcon(
  'SuccessIcon',
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="16 10 11 15 8 12" />
  </>
);

export const MenuIcon = createIcon(
  'MenuIcon',
  <>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </>
);

export const SearchIcon = createIcon(
  'SearchIcon',
  <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </>
);

export const PlusIcon = createIcon(
  'PlusIcon',
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>
);

export const MoreIcon = createIcon(
  'MoreIcon',
  <>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </>
);
