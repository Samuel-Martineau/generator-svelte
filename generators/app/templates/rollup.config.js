import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import fs from 'fs';
import { minify } from 'html-minifier';
import path from 'path';
import cleaner from 'rollup-plugin-cleaner';
import copy from 'rollup-plugin-copy';
import livereload from 'rollup-plugin-livereload';
import postcss from 'rollup-plugin-postcss';
import serve from 'rollup-plugin-serve';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
<% if (usesTS) { %>
  import typescript from '@rollup/plugin-typescript';
<% } %>

const svelteConfig = require('./svelte.config');

const production = !process.env.ROLLUP_WATCH;

const srcDir = path.join(__dirname, 'src');
const publicDir = path.join(__dirname, 'public');

const minifyHtml = (input, output, options) => ({
  generateBundle() {
    fs.writeFileSync(
      output,
      minify(fs.readFileSync(input).toString(), options),
    );
  },
});

export default {
  input: path.join(srcDir, 'main.<%= scriptExt %>'),
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: path.join(publicDir, 'bundle.js'),
  },
  plugins: [
    cleaner({
      targets: [publicDir],
    }),
    svelte({
      dev: !production,
      emitCss: true,
      ...svelteConfig,
    }),
    postcss({
      plugins: [require('autoprefixer')],
      extract: path.join(publicDir, 'bundle.css'),
      minimize: production,
    }),
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),
    <% if (usesTS) { %>
    typescript({ sourceMap: !production }),
    <% } %>
    copy({
      targets: [
        {
          src: path.join(srcDir, 'assets', '*'),
          dest: path.join(publicDir, 'assets'),
        },
      ],
    }),
    !production &&
      copy({
        targets: [
          {
            src: path.join(srcDir, 'index.html'),
            dest: publicDir,
          },
        ],
      }),
    !production &&
      serve({
        open: true,
        verbose: true,
        contentBase: 'public',
        host: 'localhost',
      }),
    !production &&
      livereload({
        watch: 'public',
        verbose: true,
        delay: 500,
      }),
    production &&
      minifyHtml(
        path.join(srcDir, 'index.html'),
        path.join(publicDir, 'index.html'),
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
    production &&
      babel({
        babelHelpers: 'bundled',
        exclude: ['node_modules/@babel/**'],
        presets: ['@babel/preset-env'],
      }),
    production && terser(),
  ],
  watch: {
    clearScreen: true,
  },
};
