import type { StorybookConfig } from '@storybook/react-webpack5';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  webpackFinal: async (config) => {
    config.module = config.module ?? { rules: [] };
    config.module.rules = config.module.rules ?? [];

    // Storybook's default CSS rule doesn't enable CSS Modules, which makes
    // `import styles from './Foo.module.css'` resolve to an object without
    // the generated class-name locals. Exclude `*.module.css` from any
    // existing CSS rule and register a dedicated CSS Modules rule so that
    // component styles expose their class mappings at runtime.
    const cssModuleTest = /\.module\.css$/;
    const matchesPlainCss = (test: unknown): test is RegExp =>
      test instanceof RegExp && test.test('foo.css');

    const excludeCssModulesFromRule = (rule: unknown): void => {
      if (!rule || typeof rule !== 'object') return;
      const r = rule as { test?: unknown; exclude?: unknown; oneOf?: unknown[] };
      if (matchesPlainCss(r.test)) {
        const existing = r.exclude;
        if (Array.isArray(existing)) {
          r.exclude = [...existing, cssModuleTest];
        } else if (existing) {
          r.exclude = [existing, cssModuleTest];
        } else {
          r.exclude = cssModuleTest;
        }
      }
      if (Array.isArray(r.oneOf)) {
        r.oneOf.forEach(excludeCssModulesFromRule);
      }
    };

    config.module.rules.forEach(excludeCssModulesFromRule);

    config.module.rules.push({
      test: cssModuleTest,
      use: [
        require.resolve('style-loader'),
        {
          loader: require.resolve('css-loader'),
          options: {
            modules: {
              localIdentName: '[name]__[local]--[hash:base64:5]',
            },
          },
        },
      ],
    });

    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              [
                require.resolve('@babel/preset-env'),
                { targets: { browsers: ['last 2 versions'] } },
              ],
              [require.resolve('@babel/preset-react'), { runtime: 'automatic' }],
              require.resolve('@babel/preset-typescript'),
            ],
          },
        },
      ],
      exclude: /node_modules/,
    });

    config.resolve = config.resolve ?? {};
    config.resolve.extensions = [...(config.resolve.extensions ?? []), '.ts', '.tsx'];

    return config;
  },
};

export default config;
