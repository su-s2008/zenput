import { Breadcrumbs } from 'zenput';
import { Section, Scenario } from './_shell';

export function BreadcrumbsSection() {
  return (
    <Section
      id="breadcrumbs"
      name="Breadcrumbs"
      description="WAI-ARIA breadcrumb navigation communicating the current page location within a hierarchy."
    >
      <Scenario title="Basic">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '#' },
            { label: 'Products', href: '#' },
            { label: 'Laptops', href: '#' },
            { label: 'MacBook Pro 16"' },
          ]}
        />
      </Scenario>

      <Scenario title="Custom separator">
        <Breadcrumbs
          separator="›"
          items={[
            { label: 'Dashboard', href: '#' },
            { label: 'Settings', href: '#' },
            { label: 'Profile' },
          ]}
        />
      </Scenario>

      <Scenario title="Custom separator — chevron">
        <Breadcrumbs
          separator=">"
          items={[
            { label: 'Home', href: '#' },
            { label: 'Docs', href: '#' },
            { label: 'Components', href: '#' },
            { label: 'Breadcrumbs' },
          ]}
        />
      </Scenario>

      <Scenario title="Two-level path">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '#' },
            { label: 'Current page' },
          ]}
        />
      </Scenario>

      <Scenario title="Root only (single item)">
        <Breadcrumbs items={[{ label: 'Home' }]} />
      </Scenario>

      <Scenario title="Long path">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '#' },
            { label: 'Organisation', href: '#' },
            { label: 'Team', href: '#' },
            { label: 'Projects', href: '#' },
            { label: 'Q4 2025', href: '#' },
            { label: 'Design System', href: '#' },
            { label: 'Components' },
          ]}
        />
      </Scenario>
    </Section>
  );
}
