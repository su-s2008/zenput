import React, { forwardRef } from 'react';
import { TimeInputProps } from './TimeInput.types';
import { NativeTypedInputField } from '../_shared/NativeTypedInputField';
import styles from './TimeInput.module.css';

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>((props, ref) => (
  <NativeTypedInputField {...props} ref={ref} type="time" styles={styles} />
));

TimeInput.displayName = 'TimeInput';
