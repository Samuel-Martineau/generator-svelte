const sveltePreprocess = require('svelte-preprocess');

module.exports = {
  preprocess: sveltePreprocess({
    <% if (usesJS) { %>
    babel: {
      presets: [
        [
          '@babel/preset-env',
          {
            loose: true,
            modules: false,
            targets: {
              esmodules: true,
            },
          },
        ],
      ],
    },
    <% } %>
  }),
};
