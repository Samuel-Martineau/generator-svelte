import fs from 'fs';
import path from 'path';

import buble from '@rollup/plugin-buble';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { minify } from 'html-minifier';
import copy from 'rollup-plugin-copy';
import livereload from 'rollup-plugin-livereload';
import postcss from 'rollup-plugin-postcss';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';

const svelteConfig = require('./svelte.config');

const production = !process.env.ROLLUP_WATCH;

const minifyHtml = (input, output, options) => ({
  generateBundle() {
    fs.writeFileSync(
      output,
      minify(fs.readFileSync(input).toString(), options),
    );
  },
});

export default {
  input: path.join(__dirname, 'src', 'main.js'),
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: path.join(__dirname, 'public', 'bundle.js'),
  },
  plugins: [
    svelte({
      dev: !production,
      css: (css) => {
        css.write(path.join(__dirname, 'public', 'bundle.css'));
      },
      ...svelteConfig,
    }),
    resolve({
      browser: true,
      dedupe: (importee) =>
        importee === 'svelte' || importee.startsWith('svelte/'),
    }),
    fs.writeFileSync(path.join(__dirname, 'public', 'bundle2.css'), ''),
    postcss({
      extract: path.join(__dirname, 'public', 'bundle2.css'),
      minimize: production,
    }),
    copy({
      targets: [
        {
          src: path.join(__dirname, 'src', 'assets', '*'),
          dest: path.join(__dirname, 'public', 'assets'),
        },
      ],
    }),
    commonjs(),
    !production &&
      copy({
        targets: [
          {
            src: path.join(__dirname, 'src', 'index.html'),
            dest: path.join(__dirname, 'public'),
          },
        ],
      }),
    !production && livereload(path.join(__dirname, 'public')),
    production &&
      minifyHtml(
        path.join(__dirname, 'src', 'index.html'),
        path.join(__dirname, 'public', 'index.html'),
        {
          collapseWhitespace: true,
          collapseInlineTagWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
          minifyURLs: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true,
        },
      ),
    production && buble(),
    production && terser(),
  ],
  watch: {
    clearScreen: true,
  },
};
