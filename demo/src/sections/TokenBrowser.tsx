import { TokenBrowser } from 'zenput';
import { Section } from './_shell';

export function TokenBrowserSection() {
  return (
    <Section
      id="token-browser"
      name="Token Browser"
      description="Browse all Zenput design tokens — semantic colours, spacing, typography, radii, shadows, motion, z-index, density, recipes, and per-component token overrides."
    >
      <TokenBrowser />
    </Section>
  );
}
