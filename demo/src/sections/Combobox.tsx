import { useState } from 'react';
import { Combobox } from 'zenput';
import type { ComboboxOption } from 'zenput';
import { Section, Scenario } from './_shell';

const FRUITS: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'dragonfruit', label: 'Dragon Fruit' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
  { value: 'honeydew', label: 'Honeydew' },
];

const COUNTRIES: ComboboxOption[] = [
  { value: 'us', label: 'United States', group: 'Americas' },
  { value: 'ca', label: 'Canada', group: 'Americas' },
  { value: 'br', label: 'Brazil', group: 'Americas' },
  { value: 'gb', label: 'United Kingdom', group: 'Europe' },
  { value: 'de', label: 'Germany', group: 'Europe' },
  { value: 'fr', label: 'France', group: 'Europe' },
  { value: 'jp', label: 'Japan', group: 'Asia' },
  { value: 'in', label: 'India', group: 'Asia' },
];

export function ComboboxSection() {
  const [value, setValue] = useState<ComboboxOption | null>(null);

  return (
    <Section
      id="combobox"
      name="Combobox"
      description="Searchable single-select with static options, async loading, and grouped options."
    >
      <Scenario title="Basic">
        <Combobox
          label="Favourite fruit"
          options={FRUITS}
          placeholder="Search fruits…"
          clearable
        />
      </Scenario>

      <Scenario title="Controlled">
        <div>
          <Combobox
            label="Select a fruit (controlled)"
            options={FRUITS}
            value={value}
            onChange={setValue}
            placeholder="Search fruits…"
            clearable
          />
          <p style={{ marginTop: '8px', fontSize: '0.85em', color: 'var(--zp-color-text-muted)' }}>
            Selected: <strong>{value?.label ?? 'none'}</strong>
          </p>
        </div>
      </Scenario>

      <Scenario title="Grouped options">
        <Combobox
          label="Country"
          options={COUNTRIES}
          groupBy={(opt) => (opt as ComboboxOption & { group: string }).group}
          placeholder="Search countries…"
          clearable
        />
      </Scenario>

      <Scenario title="Async options (simulated)">
        <Combobox
          label="Search (async)"
          loadOptions={(query) =>
            new Promise((resolve) => {
              setTimeout(() => {
                const filtered = FRUITS.filter((f) =>
                  f.label.toLowerCase().includes(query.toLowerCase())
                );
                resolve(filtered);
              }, 500);
            })
          }
          placeholder="Type to search…"
          clearable
        />
      </Scenario>

      <Scenario title="Validation states">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Combobox
            label="Required"
            options={FRUITS}
            required
            validationState="error"
            errorMessage="Please select a fruit."
          />
          <Combobox
            label="Success"
            options={FRUITS}
            defaultValue={FRUITS[0]}
            validationState="success"
            successMessage="Great choice!"
          />
          <Combobox label="Disabled" options={FRUITS} disabled defaultValue={FRUITS[2]} />
        </div>
      </Scenario>
    </Section>
  );
}
