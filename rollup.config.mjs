import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const basePlugins = ({ declaration }) => [
  peerDepsExternal(),
  resolve(),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    rootDir: 'src',
    declaration,
    declarationDir: declaration ? 'dist/cjs/types' : undefined,
  }),
  postcss({ modules: true, extract: false }),
];

export default [
  {
    input: 'src/index.ts',
    output: { file: 'dist/cjs/index.js', format: 'cjs', sourcemap: true },
    plugins: basePlugins({ declaration: true }),
    external: ['react', 'react-dom'],
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/esm/index.js', format: 'esm', sourcemap: true },
    plugins: basePlugins({ declaration: false }),
    external: ['react', 'react-dom'],
  },
  {
    input: 'dist/cjs/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/],
  },
];
