'use client';
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeProvider';
import { palette } from '../../tokens/colors';
import {
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
} from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { radii } from '../../tokens/radii';
import { shadows, borderWidths, elevation } from '../../tokens/shadows';
import { durations, easings } from '../../tokens/motion';
import { zIndex } from '../../tokens/zIndex';
import { breakpoints } from '../../tokens/breakpoints';
import { densityTokens } from '../../tokens/density';
import { recipes } from '../../tokens/recipes';
import { defaultComponentTokens } from '../../tokens/components';
import { typographyPresets } from '../../tokens/typographyPresets';
import { toKebabCase } from '../../tokens/index';
import styles from './TokenBrowser.module.css';

type TokenCategory =
  | 'colors'
  | 'palette'
  | 'typography'
  | 'typographyPresets'
  | 'spacing'
  | 'radii'
  | 'shadows'
  | 'motion'
  | 'zIndex'
  | 'breakpoints'
  | 'density'
  | 'recipes'
  | 'components';

interface TokenBrowserProps {
  /** Initially selected category */
  defaultCategory?: TokenCategory;
}

interface RecipeVariantSectionProps {
  readonly name: string;
  readonly copyContext: string;
  readonly variantStyles: Record<string, string>;
  readonly renderToken: (
    key: string,
    value: string | number,
    copyContext?: string
  ) => React.ReactNode;
}

function RecipeVariantSection({
  name,
  copyContext,
  variantStyles,
  renderToken,
}: RecipeVariantSectionProps): React.ReactElement {
  return (
    <div className={styles.variantSection}>
      <div className={styles.variantName}>{name}</div>
      <div className={styles.tokenGrid}>
        {Object.entries(variantStyles).map(([key, value]) =>
          renderToken(key, value, copyContext)
        )}
      </div>
    </div>
  );
}

/**
 * Token Browser component for exploring and documenting design tokens.
 * This is primarily intended for documentation and Storybook.
 */
export function TokenBrowser({ defaultCategory = 'colors' }: TokenBrowserProps) {
  const [category, setCategory] = useState<TokenCategory>(defaultCategory);
  const [copied, setCopied] = useState<string | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { semantic, mode, density, cssVars, components: themeComponents } = useTheme();

  // Merge theme.components overrides on top of the defaults so the Component
  // Tokens panel reflects the resolved values exposed by ThemeProvider.
  const resolvedComponentTokens = useMemo(() => {
    const overridesByName = themeComponents as Record<
      string,
      Record<string, string | number> | undefined
    >;
    const merged: Record<string, Record<string, string | number>> = {};
    for (const [name, tokens] of Object.entries(defaultComponentTokens)) {
      merged[name] = { ...tokens, ...(overridesByName[name] || {}) };
    }
    return merged;
  }, [themeComponents]);

  const handleCopy = useCallback((id: string, textToCopy: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(id);
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }
      // clearTimeout above ensures only one timer is active at a time, so
      // setCopied(null) always clears the most recently copied entry.
      copyTimerRef.current = setTimeout(() => {
        copyTimerRef.current = null;
        setCopied(null);
      }, 1500);
    });
  }, []);

  // Clear pending copy timer on unmount to prevent state updates on
  // unmounted components.
  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
        copyTimerRef.current = null;
      }
    };
  }, []);

  const categories: Array<{ id: TokenCategory; label: string }> = [
    { id: 'colors', label: 'Semantic Colors' },
    { id: 'palette', label: 'Color Palette' },
    { id: 'typography', label: 'Typography' },
    { id: 'typographyPresets', label: 'Typography Presets' },
    { id: 'spacing', label: 'Spacing' },
    { id: 'radii', label: 'Border Radius' },
    { id: 'shadows', label: 'Shadows & Elevation' },
    { id: 'motion', label: 'Motion' },
    { id: 'zIndex', label: 'Z-Index' },
    { id: 'breakpoints', label: 'Breakpoints' },
    { id: 'density', label: 'Density' },
    { id: 'recipes', label: 'Recipes' },
    { id: 'components', label: 'Component Tokens' },
  ];

  const renderColorSwatch = (name: string, value: string) => {
    const cssVarName = `--zp-color-${toKebabCase(name)}`;
    const id = `${category}:${name}`;
    return (
      <button
        key={name}
        type="button"
        className={styles.tokenItem}
        title={`Click to copy: ${cssVarName}`}
        aria-label={`Copy ${cssVarName} to clipboard`}
        onClick={() => handleCopy(id, cssVarName)}
      >
        <div className={styles.colorSwatch} style={{ backgroundColor: value }} />
        <div className={styles.tokenDetails}>
          <div className={styles.tokenName}>{name}</div>
          <div className={styles.tokenValue}>{value}</div>
          {copied === id && (
            <div className={styles.tokenValue} aria-live="polite">Copied!</div>
          )}
        </div>
      </button>
    );
  };

  const renderToken = (name: string, value: string | number, copyContext?: string) => {
    const textToCopy = String(value);
    const normalizedContext = copyContext ? toKebabCase(copyContext.replace(/\s+/g, '-')) : undefined;
    const id = [category, normalizedContext, name].filter(Boolean).join(':');
    const labelName = copyContext ? `${copyContext} ${name}` : name;
    return (
      <button
        key={name}
        type="button"
        className={styles.tokenItem}
        title={`Click to copy: ${textToCopy}`}
        aria-label={`Copy ${labelName} to clipboard`}
        onClick={() => handleCopy(id, textToCopy)}
      >
        <div className={styles.tokenDetails}>
          <div className={styles.tokenName}>{name}</div>
          <div className={styles.tokenValue}>{textToCopy}</div>
          {copied === id && (
            <div className={styles.tokenValue} aria-live="polite">Copied!</div>
          )}
        </div>
      </button>
    );
  };

  const renderContent = () => {
    switch (category) {
      case 'colors':
        return (
          <div className={styles.tokenGrid}>
            {Object.entries(semantic).map(([key, value]) => renderColorSwatch(key, value))}
          </div>
        );

      case 'palette':
        return (
          <div>
            {Object.entries(palette).map(([rampName, ramp]) => (
              <div key={rampName} className={styles.paletteSection}>
                <h3 className={styles.paletteTitle}>{rampName}</h3>
                <div className={styles.tokenGrid}>
                  {Object.entries(ramp).map(([step, value]) =>
                    renderColorSwatch(`${rampName}-${step}`, value)
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'typography':
        return (
          <div>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Font Families</h3>
              <div className={styles.tokenGrid}>
                {Object.entries(fontFamilies).map(([key, value]) =>
                  renderToken(key, value, 'Font Families')
                )}
              </div>
            </div>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Font Sizes</h3>
              <div className={styles.tokenGrid}>
                {Object.entries(fontSizes).map(([key, value]) =>
                  renderToken(key, value, 'Font Sizes')
                )}
              </div>
            </div>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Font Weights</h3>
              <div className={styles.tokenGrid}>
                {Object.entries(fontWeights).map(([key, value]) =>
                  renderToken(key, value, 'Font Weights')
                )}
              </div>
            </div>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Line Heights</h3>
              <div className={styles.tokenGrid}>
                {Object.entries(lineHeights).map(([key, value]) =>
                  renderToken(key, value, 'Line Heights')
                )}
              </div>
            </div>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Letter Spacings</h3>
              <div className={styles.tokenGrid}>
                {Object.entries(letterSpacings).map(([key, value]) =>
                  renderToken(key, value, 'Letter Spacings')
                )}
              </div>
            </div>
          </div>
        );

      case 'typographyPresets':
        return (
          <div>
            {Object.entries(typographyPresets).map(([presetName, preset]) => (
              <div key={presetName} className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  {presetName}{' '}
                  <span className={styles.tokenValue}>.zp-text-{presetName}</span>
                </h3>
                <div
                  className={styles.tokenGrid}
                  style={{
                    fontFamily: preset.fontFamily,
                    fontSize: preset.fontSize,
                    fontWeight: preset.fontWeight,
                    lineHeight: preset.lineHeight,
                    letterSpacing: preset.letterSpacing,
                    paddingBottom: '0.5rem',
                  }}
                >
                  <div className={styles.tokenItem}>
                    <div className={styles.tokenDetails}>
                      <div className={styles.tokenName}>The quick brown fox</div>
                    </div>
                  </div>
                </div>
                <div className={styles.tokenGrid}>
                  {Object.entries(preset).map(([prop, value]) =>
                    renderToken(prop, value, presetName)
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'spacing':
        return (
          <div className={styles.tokenGrid}>
            {Object.entries(spacing).map(([key, value]) => (
              <div key={key} className={styles.tokenItem}>
                <div
                  className={styles.spacingVisual}
                  style={{ width: value, height: value, backgroundColor: 'var(--zp-color-brand)' }}
                />
                <div className={styles.tokenDetails}>
                  <div className={styles.tokenName}>{key}</div>
                  <div className={styles.tokenValue}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'radii':
        return (
          <div className={styles.tokenGrid}>
            {Object.entries(radii).map(([key, value]) => (
              <div key={key} className={styles.tokenItem}>
                <div
                  className={styles.radiusVisual}
                  style={{ borderRadius: value, backgroundColor: 'var(--zp-color-brand)' }}
                />
                <div className={styles.tokenDetails}>
                  <div className={styles.tokenName}>{key}</div>
                  <div className={styles.tokenValue}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'shadows':
        return (
          <div>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Shadows</h3>
              <div className={styles.tokenGrid}>
                {Object.entries(shadows).map(([key, value]) => (
                  <div key={key} className={styles.tokenItem}>
                    <div className={styles.shadowVisual} style={{ boxShadow: value }} />
                    <div className={styles.tokenDetails}>
                      <div className={styles.tokenName}>{key}</div>
                      <div className={styles.tokenValue}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Elevation</h3>
              <div className={styles.tokenGrid}>
                {Object.entries(elevation).map(([key, value]) =>
                  renderToken(key, value, 'Elevation')
                )}
              </div>
            </div>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Border Widths</h3>
              <div className={styles.tokenGrid}>
                {Object.entries(borderWidths).map(([key, value]) =>
                  renderToken(key, value, 'Border Widths')
                )}
              </div>
            </div>
          </div>
        );

      case 'motion':
        return (
          <div>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Durations</h3>
              <div className={styles.tokenGrid}>
                {Object.entries(durations).map(([key, value]) =>
                  renderToken(key, value, 'Durations')
                )}
              </div>
            </div>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Easings</h3>
              <div className={styles.tokenGrid}>
                {Object.entries(easings).map(([key, value]) =>
                  renderToken(key, value, 'Easings')
                )}
              </div>
            </div>
          </div>
        );

      case 'zIndex':
        return (
          <div className={styles.tokenGrid}>
            {Object.entries(zIndex).map(([key, value]) => renderToken(key, value))}
          </div>
        );

      case 'breakpoints':
        return (
          <div className={styles.tokenGrid}>
            {Object.entries(breakpoints).map(([key, value]) => renderToken(key, value))}
          </div>
        );

      case 'density':
        return (
          <div>
            {Object.entries(densityTokens).map(([densityKey, densityValues]) => (
              <div key={densityKey} className={styles.section}>
                <h3 className={styles.sectionTitle}>{densityKey}</h3>
                <div className={styles.tokenGrid}>
                  {Object.entries(densityValues).map(([key, value]) =>
                    renderToken(key, String(value), densityKey)
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'recipes':
        return (
          <div>
            {Object.entries(recipes).map(([recipeName, recipe]) => (
              <div key={recipeName} className={styles.section}>
                <h3 className={styles.sectionTitle}>{recipeName}</h3>
                {recipe.base && (
                  <div className={styles.subsection}>
                    <h4 className={styles.subsectionTitle}>Base</h4>
                    <div className={styles.tokenGrid}>
                      {Object.entries(recipe.base).map(([key, value]) =>
                        renderToken(key, value, `${recipeName} Base`)
                      )}
                    </div>
                  </div>
                )}
                {recipe.variants && (
                  <div className={styles.subsection}>
                    <h4 className={styles.subsectionTitle}>Variants</h4>
                    {Object.entries(recipe.variants).map(([variantName, variantStyles]) => (
                      <RecipeVariantSection
                        key={variantName}
                        name={variantName}
                        copyContext={`${recipeName} ${variantName}`}
                        variantStyles={variantStyles}
                        renderToken={renderToken}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'components':
        return (
          <div>
            {Object.entries(resolvedComponentTokens).map(([componentName, tokens]) => (
              <div key={componentName} className={styles.section}>
                <h3 className={styles.sectionTitle}>{componentName}</h3>
                <div className={styles.tokenGrid}>
                  {Object.entries(tokens).map(([key, value]) =>
                    renderToken(key, String(value), componentName)
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Design Tokens Browser</h2>
        <div className={styles.info}>
          <span>Mode: {mode}</span>
          <span>Density: {density}</span>
          <span>Variables: {Object.keys(cssVars).length}</span>
        </div>
      </div>

      <div className={styles.layout}>
        <nav className={styles.sidebar}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              aria-pressed={category === cat.id}
              className={`${styles.categoryButton} ${category === cat.id ? styles.active : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </nav>

        <main className={styles.content}>{renderContent()}</main>
      </div>
    </div>
  );
}
