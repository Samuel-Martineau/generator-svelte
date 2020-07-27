const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const execa = require('execa');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');

const {
  styleExts,
  scriptLangs,
  styleLangs,
  markupLangs,
  mimeTypes,
} = require('../common/variables');

describe('generator-svelte:app', function() {
  this.timeout(0);
  const basePrompts = {
    authorName: 'Test Author',
    authorEmail: 'test-email@example.com',
    authorWebsite: 'example.com',
    title: 'Test App',
    license: 'UNLICENSED',
    scriptLang: 'JavaScript',
    styleLang: 'CSS',
    markupLang: 'HTML',
    packageManager: 'NPM',
    gitInit: false,
  };
  describe('it works with all possibilities of languages', function() {
    for (const scriptLang of scriptLangs) {
      for (const styleLang of styleLangs) {
        for (const markupLang of markupLangs) {
          describe(`${scriptLang} ${styleLang} ${markupLang}`, function() {
            before(async function() {
              await helpers
                .run(path.join(__dirname, '../generators/app'))
                .withPrompts({
                  ...basePrompts,
                  scriptLang,
                  styleLang,
                  markupLang,
                });
            });
            it('it creates the right files', () =>
              assert.file([
                '.gitignore',
                'package.json',
                'svelte.config.js',
                'rollup.config.js',
                'src/assets/favicon.png',
                'src/index.html',
                scriptLang === 'TypeScript' ? 'src/main.ts' : 'src/main.js',
                'src/App.svelte',
                `src/global.${styleExts[styleLang]}`,
                ...(scriptLang === 'TypeScript'
                  ? ['tsconfig.json', '.vscode/extensions.json']
                  : []),
              ]));
            it('it creates the correct App.svelte file', function() {
              assert.fileContent(
                'src/App.svelte',
                ejs.render(
                  fs
                    .readFileSync(
                      path.join(
                        __dirname,
                        '../generators/app/templates/src/App.svelte',
                      ),
                    )
                    .toString(),
                  {
                    title: basePrompts.title,
                    scriptLang: mimeTypes[scriptLang],
                    styleLang: mimeTypes[styleLang],
                    usesPug: markupLang === 'PUG',
                  },
                ),
              );
            });
          });
        }
      }
    }
  });
  describe('it respects the selected options', function() {
    describe('it uses the selected package manager', function() {
      it('it uses Yarn when selected', async function() {
        await helpers
          .run(path.join(__dirname, '../generators/app'))
          .withOptions({
            'skip-install': false,
          })
          .withPrompts({
            ...basePrompts,
            packageManager: 'Yarn',
          });
        assert.file('yarn.lock');
        assert.noFile('package-lock.json');
      });
      it('it uses NPM when selected', async function() {
        await helpers
          .run(path.join(__dirname, '../generators/app'))
          .withOptions({
            'skip-install': false,
          })
          .withPrompts({
            ...basePrompts,
            packageManager: 'NPM',
          });
        assert.file('package-lock.json');
        assert.noFile('yarn.lock');
      });
    });
    describe('it inits the git repo when selected', function() {
      it('it inits the git repo when selected', async function() {
        await helpers
          .run(path.join(__dirname, '../generators/app'))
          .withPrompts({
            ...basePrompts,
            gitInit: true,
          });
        assert.file('.git');
      });
      it("it doesn't init the git repo when not selected", async function() {
        await helpers
          .run(path.join(__dirname, '../generators/app'))
          .withPrompts({
            ...basePrompts,
            gitInit: false,
          });
        assert.noFile('.git');
      });
    });
  });
  describe('it is able to build the app', function() {
    it('with NPM', async function() {
      await helpers
        .run(path.join(__dirname, '../generators/app'))
        .withOptions({
          'skip-install': false,
        })
        .withPrompts({
          ...basePrompts,
          packageManager: 'NPM',
        });

      let isError = false;

      try {
        execa.sync('npm', ['run', 'build']);
      } catch (error) {
        isError = true;
        console.log(error);
      }

      assert.equal(isError, false);
    });
    it('with Yarn', async function() {
      await helpers
        .run(path.join(__dirname, '../generators/app'))
        .withOptions({
          'skip-install': false,
        })
        .withPrompts({
          ...basePrompts,
          packageManager: 'Yarn',
        });

      let isError = false;

      try {
        execa.sync('yarn', ['build']);
      } catch (error) {
        isError = true;
        console.log(error);
      }

      assert.equal(isError, false);
    });
  });
});
