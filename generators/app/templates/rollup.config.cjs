const { babel } = require('@rollup/plugin-babel')
const commonjs = require('@rollup/plugin-commonjs')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const fs = require('fs')
const { minify } =require('html-minifier') ;
const mkdirp = require('mkdirp')
const path = require('path')
const copy = require('rollup-plugin-cpy')
const del = require('rollup-plugin-delete')
const livereload = require('rollup-plugin-livereload')
const postcss = require('rollup-plugin-postcss')
const serve = require('rollup-plugin-serve')
const svelte = require('rollup-plugin-svelte')
const { terser } =require( 'rollup-plugin-terser');
<% if (usesTS) { %>
const typescript = require('@rollup/plugin-typescript')
<% } %>

const svelteConfig = require('./svelte.config');

const production = !process.env.ROLLUP_WATCH;

const srcDir = path.join(__dirname, 'src');
const publicDir = path.join(__dirname, 'public');

const mkdir = (path) => ({
  generateBundle() {
    mkdirp.sync(path);
  }
});

const minifyHtml = (input, output, options) => ({
  generateBundle() {
    fs.writeFileSync(
      output,
      minify(fs.readFileSync(input).toString(), options),
    );
  },
});

module.exports= {
  input: path.join(srcDir, 'main.<%= scriptExt %>'),
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: path.join(publicDir, 'bundle.js'),
  },
  plugins: [
    mkdir(publicDir),
    mkdir(path.join(publicDir, 'assets')),
    del({
      targets: path.join(publicDir, '*'),
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
    nodeResolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),
    <% if (usesTS) { %>
    typescript({ sourceMap: !production }),
    <% } %>
    copy({
      files: [path.join(srcDir, 'assets', '*')],
      dest: path.join(publicDir, 'assets'),
    }),
    !production &&
      copy({
        files: [path.join(srcDir, 'index.html')],
        dest: publicDir,
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
