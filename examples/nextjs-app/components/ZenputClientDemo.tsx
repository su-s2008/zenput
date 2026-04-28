'use client';

/**
 * ZenputClientDemo — a **Client Component** that exercises a representative
 * subset of zenput components and hooks.
 *
 * This file has `'use client'` so it can safely use hooks. The zenput
 * components it imports also ship with `'use client'` in their dist bundles.
 */
import { useState } from 'react';
import {
  ThemeProvider,
  TextInput,
  Button,
  Checkbox,
  Badge,
  Spinner,
} from 'zenput';

export default function ZenputClientDemo() {
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);

  return (
    <ThemeProvider storageKey="zp-theme">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 }}>
        <h2>Client Component Demo</h2>

        <TextInput
          label="Name"
          placeholder="Enter your name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <Checkbox
          label="I agree to the terms"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Button variant="primary" size="md">
            Submit
          </Button>
          <Badge tone="brand">New</Badge>
          <Spinner size="sm" />
        </div>

        {value && (
          <p>
            Hello, <strong>{value}</strong>!
          </p>
        )}
      </div>
    </ThemeProvider>
  );
}
