import { MultiSelect } from 'zenput';
import type { MultiSelectOption } from 'zenput';
import { Section, Scenario } from './_shell';

const SKILLS: MultiSelectOption[] = [
  { value: 'react', label: 'React' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'css', label: 'CSS' },
  { value: 'node', label: 'Node.js' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'testing', label: 'Testing' },
  { value: 'a11y', label: 'Accessibility' },
  { value: 'design', label: 'Design Systems' },
];

const FRAMEWORK_GROUPS: MultiSelectOption[] = [
  { value: 'react', label: 'React', group: 'Frontend' },
  { value: 'vue', label: 'Vue', group: 'Frontend' },
  { value: 'svelte', label: 'Svelte', group: 'Frontend' },
  { value: 'express', label: 'Express', group: 'Backend' },
  { value: 'fastify', label: 'Fastify', group: 'Backend' },
  { value: 'next', label: 'Next.js', group: 'Full Stack' },
  { value: 'remix', label: 'Remix', group: 'Full Stack' },
];

export function MultiSelectSection() {
  return (
    <Section
      id="multi-select"
      name="MultiSelect"
      description="Multi-value select with search, grouping, creatable entries, and async loading."
    >
      <Scenario title="Basic">
        <MultiSelect
          label="Skills"
          options={SKILLS}
          placeholder="Select skills…"
          clearable
        />
      </Scenario>

      <Scenario title="With default values">
        <MultiSelect
          label="Pre-selected skills"
          options={SKILLS}
          defaultValue={[SKILLS[0], SKILLS[1]]}
          clearable
        />
      </Scenario>

      <Scenario title="Grouped options">
        <MultiSelect
          label="Frameworks"
          options={FRAMEWORK_GROUPS}
          groupBy={(opt) => (opt as MultiSelectOption & { group: string }).group}
          placeholder="Select frameworks…"
          clearable
        />
      </Scenario>

      <Scenario title="Creatable (free-form entries)">
        <MultiSelect
          label="Tags"
          options={SKILLS}
          creatable
          placeholder="Select or type to create…"
          clearable
        />
      </Scenario>

      <Scenario title="Max tags">
        <MultiSelect
          label="Up to 3 skills"
          options={SKILLS}
          maxTags={3}
          clearable
          helperText="You can select at most 3 skills."
        />
      </Scenario>

      <Scenario title="Validation states">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <MultiSelect
            label="Required"
            options={SKILLS}
            required
            validationState="error"
            errorMessage="Please select at least one skill."
          />
          <MultiSelect
            label="Disabled"
            options={SKILLS}
            defaultValue={[SKILLS[0]]}
            disabled
          />
        </div>
      </Scenario>
    </Section>
  );
}
