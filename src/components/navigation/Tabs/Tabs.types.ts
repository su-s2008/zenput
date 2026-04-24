import React from 'react';

export interface TabsProps {
  /** Controlled selected tab value. */
  value?: string;
  /** Initial selected tab value for uncontrolled usage. */
  defaultValue?: string;
  /** Callback fired when the selected tab changes. */
  onChange?: (value: string) => void;
  /** Orientation of the tab list. Default: `'horizontal'`. */
  orientation?: 'horizontal' | 'vertical';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface TabProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** Unique value that identifies this tab. Required. */
  value: string;
  children: React.ReactNode;
}

export interface TabPanelsProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Must match the `value` of its corresponding `<Tab>`. */
  value: string;
  children: React.ReactNode;
}
