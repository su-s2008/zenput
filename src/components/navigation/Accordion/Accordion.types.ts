import React from 'react';

export interface AccordionProps {
  /** Allow multiple items to be expanded simultaneously. Default: `false`. */
  multiple?: boolean;
  /** Controlled open item value(s). Use an array when `multiple` is `true`. */
  value?: string | string[];
  /** Initial open item value(s) for uncontrolled usage. */
  defaultValue?: string | string[];
  /** Callback fired when the set of open items changes. */
  onChange?: (value: string | string[]) => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface AccordionItemProps {
  /** Unique value that identifies this item within the accordion. Required. */
  value: string;
  /** When `true` the item cannot be expanded or collapsed. */
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
