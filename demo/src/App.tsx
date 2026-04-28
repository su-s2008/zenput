import { useState } from 'react';
import { ThemeProvider, extendTheme, type Theme, type ColorMode } from 'zenput';
import {
  TypographySection,
  LayoutSection,
  ButtonSection,
  BadgeSection,
  FieldSection,
  TextInputSection,
  TextAreaSection,
  NumberInputSection,
  PasswordInputSection,
  SelectInputSection,
  CheckboxSection,
  CheckboxGroupSection,
  RadioGroupSection,
  ToggleSection,
  DateTimeSection,
  PickersSection,
  FileInputSection,
  RangeInputSection,
  ColorInputSection,
  SearchInputSection,
  PhoneInputSection,
  OTPInputSection,
  AutoCompleteSection,
  MoneyInputSection,
  ComboboxSection,
  MultiSelectSection,
  DataTableSection,
  TabsSection,
  AccordionSection,
  BreadcrumbsSection,
  ActionsExtSection,
  FeedbackSection,
  ContentSection,
  DialogSection,
  DrawerSection,
  PopoverSection,
  TooltipSection,
  PortalSection,
  MenuSection,
  ToastSection,
  TokenBrowserSection,
  ThemingSection,
} from './sections';

type DensityScale = 'compact' | 'normal' | 'spacious';

const BASE_THEMES: Record<string, Theme> = {
  Default: {},
  /**
   * "Indigo" — uses the modern semantic token API (`semantic.brand*`) to
   * override the brand colour ramp. Legacy `primaryColor` / `focusRingColor`
   * are included so the 1.x form-input components also pick up the change.
   */
  Indigo: extendTheme(
    {
      semantic: {
        brand: '#6366f1',
        brandHover: '#4f46e5',
        brandActive: '#4338ca',
        brandSubtle: '#eef2ff',
        focusRing: '#6366f1',
        borderFocus: '#6366f1',
      },
    },
    // Legacy keys for form-input back-compat
    {
      primaryColor: '#6366f1',
      focusRingColor: '#6366f1',
      borderRadius: '8px',
    }
  ),
  Emerald: extendTheme(
    {
      semantic: {
        brand: '#10b981',
        brandHover: '#059669',
        brandActive: '#047857',
        brandSubtle: '#ecfdf5',
        focusRing: '#10b981',
        borderFocus: '#10b981',
      },
    },
    {
      primaryColor: '#10b981',
      focusRingColor: '#10b981',
      borderRadius: '4px',
      successColor: '#059669',
    }
  ),
  Rose: extendTheme(
    {
      semantic: {
        brand: '#f43f5e',
        brandHover: '#e11d48',
        brandActive: '#be123c',
        brandSubtle: '#fff1f2',
        focusRing: '#f43f5e',
        borderFocus: '#f43f5e',
      },
    },
    {
      primaryColor: '#f43f5e',
      focusRingColor: '#f43f5e',
      borderRadius: '12px',
      errorColor: '#e11d48',
    }
  ),
  /**
   * "Brand" — demonstrates `extendTheme()` + per-component token overrides
   * via `theme.components` (the modern design-system API).
   */
  Brand: extendTheme(
    {
      semantic: {
        brand: '#7c3aed',
        brandHover: '#6d28d9',
        brandActive: '#5b21b6',
        brandSubtle: '#f5f3ff',
        focusRing: '#7c3aed',
        borderFocus: '#7c3aed',
      },
      components: {
        button: {
          borderRadius: 'var(--zp-radius-full)',
        },
      },
    },
    { primaryColor: '#7c3aed', focusRingColor: '#7c3aed' }
  ),
  Dark: extendTheme(
    {
      mode: 'dark' as ColorMode,
      semantic: {
        brand: '#818cf8',
        brandHover: '#6366f1',
        brandActive: '#4f46e5',
        brandSubtle: '#1e1b4b',
        focusRing: '#818cf8',
        borderFocus: '#818cf8',
      },
    },
    {
      primaryColor: '#818cf8',
      bgColor: '#1e1e2e',
      textColor: '#cdd6f4',
      borderColor: '#45475a',
      placeholderColor: '#6c7086',
      disabledBg: '#313244',
      disabledText: '#585b70',
    }
  ),
  /**
   * "System" — follows the OS `prefers-color-scheme` preference via
   * `mode: 'system'`. The resolved mode (light / dark) is logged by
   * ThemeProvider in data-zp-theme on the wrapper element.
   */
  System: {
    mode: 'system' as ColorMode,
  },
  'High Contrast': {
    mode: 'highContrast' as ColorMode,
  },
};

const NAV_GROUPS: Array<{ title: string; items: Array<{ id: string; name: string }> }> = [
  {
    title: 'Foundations',
    items: [
      { id: 'typography', name: 'Typography' },
      { id: 'layout', name: 'Layout' },
    ],
  },
  {
    title: 'Actions',
    items: [
      { id: 'button', name: 'Button' },
      { id: 'badge', name: 'Badge' },
      { id: 'actions-ext', name: 'Avatar / Tag / SegmentedControl' },
    ],
  },
  {
    title: 'Field',
    items: [{ id: 'field', name: 'Field' }],
  },
  {
    title: 'Form inputs',
    items: [
      { id: 'text-input', name: 'TextInput' },
      { id: 'text-area', name: 'TextArea' },
      { id: 'number-input', name: 'NumberInput' },
      { id: 'password-input', name: 'PasswordInput' },
      { id: 'select-input', name: 'SelectInput' },
      { id: 'checkbox', name: 'Checkbox' },
      { id: 'checkbox-group', name: 'CheckboxGroup' },
      { id: 'radio-group', name: 'RadioGroup' },
      { id: 'toggle', name: 'Toggle' },
      { id: 'date-time', name: 'DateInput & TimeInput' },
      { id: 'pickers', name: 'Pickers (Calendar / DatePicker / DateRange / TimePicker)' },
      { id: 'file-input', name: 'FileInput' },
      { id: 'range-input', name: 'RangeInput' },
      { id: 'color-input', name: 'ColorInput' },
      { id: 'search-input', name: 'SearchInput' },
      { id: 'phone-input', name: 'PhoneInput' },
      { id: 'otp-input', name: 'OTPInput' },
      { id: 'autocomplete', name: 'AutoComplete' },
      { id: 'money-input', name: 'MoneyInput' },
      { id: 'combobox', name: 'Combobox' },
      { id: 'multi-select', name: 'MultiSelect' },
    ],
  },
  {
    title: 'Data display',
    items: [
      { id: 'data-table', name: 'DataTable' },
      { id: 'content', name: 'Card / EmptyState / Pagination' },
    ],
  },
  {
    title: 'Feedback',
    items: [{ id: 'feedback', name: 'Spinner / Skeleton / ProgressBar / CircularProgress' }],
  },
  {
    title: 'Navigation',
    items: [
      { id: 'tabs', name: 'Tabs' },
      { id: 'accordion', name: 'Accordion' },
      { id: 'breadcrumbs', name: 'Breadcrumbs' },
    ],
  },
  {
    title: 'Overlay',
    items: [
      { id: 'dialog', name: 'Dialog' },
      { id: 'drawer', name: 'Drawer' },
      { id: 'popover', name: 'Popover' },
      { id: 'tooltip', name: 'Tooltip' },
      { id: 'portal', name: 'Portal' },
      { id: 'menu', name: 'Menu / ContextMenu' },
      { id: 'toast', name: 'Toast' },
    ],
  },
  {
    title: 'Tokens',
    items: [
      { id: 'token-browser', name: 'Token Browser' },
      { id: 'theming', name: 'Theming' },
    ],
  },
];

export function App() {
  const [themeName, setThemeName] = useState<keyof typeof BASE_THEMES>('Default');
  const [density, setDensity] = useState<DensityScale>('normal');

  const baseTheme = BASE_THEMES[themeName];
  const theme: Theme = density === 'normal' ? baseTheme : extendTheme(baseTheme, { density });

  return (
    <ThemeProvider theme={theme}>
      <div
        className="app-shell"
        style={{
          // Ensure the demo shell itself reacts to the active theme's surface/text
          background: baseTheme.bgColor ?? 'var(--zp-color-surface-canvas)',
          color: baseTheme.textColor ?? 'var(--zp-color-text-default)',
        }}
      >
        <header className="app-header">
          <div className="app-brand">
            <span className="app-brand-name">Zenput</span>
            <span className="app-brand-tag">Component gallery</span>
          </div>
          <div className="app-controls">
            <label className="app-control">
              Theme
              <select
                value={themeName}
                onChange={(e) => setThemeName(e.target.value as keyof typeof BASE_THEMES)}
              >
                {Object.keys(BASE_THEMES).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="app-control">
              Density
              <select
                value={density}
                onChange={(e) => setDensity(e.target.value as DensityScale)}
              >
                <option value="compact">Compact</option>
                <option value="normal">Normal</option>
                <option value="spacious">Spacious</option>
              </select>
            </label>
          </div>
        </header>

        <div className="app-body">
          <nav className="app-nav" aria-label="Component sections">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <h2>{group.title}</h2>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`}>{item.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <main className="app-main">
            <div className="intro">
              <h1>Zenput component gallery</h1>
              <p>
                Live examples for every Zenput component, organised by area. Each card below
                showcases a different scenario — sizes, variants, validation states, and edge
                cases. Use the theme switcher in the header to preview components under the
                different design-system palettes.
              </p>
            </div>

            <TypographySection />
            <LayoutSection />
            <ButtonSection />
            <BadgeSection />
            <ActionsExtSection />
            <FieldSection />
            <TextInputSection />
            <TextAreaSection />
            <NumberInputSection />
            <PasswordInputSection />
            <SelectInputSection />
            <CheckboxSection />
            <CheckboxGroupSection />
            <RadioGroupSection />
            <ToggleSection />
            <DateTimeSection />
            <PickersSection />
            <FileInputSection />
            <RangeInputSection />
            <ColorInputSection />
            <SearchInputSection />
            <PhoneInputSection />
            <OTPInputSection />
            <AutoCompleteSection />
            <MoneyInputSection />
            <ComboboxSection />
            <MultiSelectSection />
            <DataTableSection />
            <ContentSection />
            <FeedbackSection />
            <TabsSection />
            <AccordionSection />
            <BreadcrumbsSection />
            <DialogSection />
            <DrawerSection />
            <PopoverSection />
            <TooltipSection />
            <PortalSection />
            <MenuSection />
            <ToastSection />
            <TokenBrowserSection />
            <ThemingSection />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

