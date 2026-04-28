'use client';
import React, { forwardRef } from 'react';
import { DateInputProps } from './DateInput.types';
import { NativeTypedInputField } from '../_shared/NativeTypedInputField';
import styles from './DateInput.module.css';

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>((props, ref) => (
  <NativeTypedInputField {...props} ref={ref} type="date" styles={styles} />
));

DateInput.displayName = 'DateInput';
