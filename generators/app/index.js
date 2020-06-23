'use strict';
const Generator = require('yeoman-generator');
const ejs = require('ejs');
const chalk = require('chalk');
const yosay = require('yosay');
const urlize = require('urlize').urlize;

const {
  mimeTypes,
  styleExts,
  scriptLangs,
  styleLangs,
  markupLangs,
} = require('../../common/variables');

module.exports = class extends Generator {
  async prompting() {
    this.log(
      yosay(
        `Welcome to the beautiful ${chalk.red('generator-svelte')} generator!`,
      ),
    );

    const prompts = [
      {
        type: 'input',
        name: 'authorName',
        message: "What's your name ?",
        default: this.user.git.name(),
        store: true,
      },
      {
        type: 'input',
        name: 'authorEmail',
        message: "What's your email ?",
        default: this.user.git.email(),
        store: true,
      },
      {
        type: 'input',
        name: 'authorWebsite',
        message: "What's your website ?",
        store: true,
      },
      {
        type: 'input',
        name: 'title',
        message: "What's the title of your app ?",
        store: true,
      },
      {
        type: 'list',
        name: 'scriptLang',
        message:
          'In wich language do you want to write the scripts of your Svelte app ?',
        choices: scriptLangs,
        store: true,
      },
      {
        type: 'list',
        name: 'styleLang',
        message:
          'In wich language do you want to write the styles of your Svelte app ?',
        choices: styleLangs,
        store: true,
      },
      {
        type: 'list',
        name: 'markupLang',
        message:
          'In wich language do you want to write the markups of your Svelte app ?',
        choices: markupLangs,
        store: true,
      },
      {
        type: 'confirm',
        name: 'gitInit',
        message: 'Do you want to initialize a git repository ?',
        default: true,
        store: true,
      },
      {
        type: 'list',
        name: 'packageManager',
        message: 'Which package manager do you want to use ?',
        choices: ['NPM', 'Yarn'],
        default: 0,
        store: true,
      },
    ];

    const props = await this.prompt(prompts);
    const { authorName, authorEmail, authorWebsite } = props;

    this.composeWith(require.resolve('generator-license'), {
      name: authorName,
      email: authorEmail,
      website: authorWebsite,
      licensePrompt: 'Which license do you want to use?',
    });
    this.props = props;
  }

  writing() {
    // Setup variables
    const {
      styleLang,
      scriptLang,
      markupLang,
      title,
      authorName,
      authorEmail,
      authorWebsite,
    } = this.props;
    const styleExt = styleExts[styleLang];
    // Static files
    this.fs.copy(
      this.templatePath('gitignore'),
      this.destinationPath('.gitignore'),
    );
    this.fs.copy(
      this.templatePath('src/assets'),
      this.destinationPath('src/assets'),
    );
    this.fs.copy(
      this.templatePath('src/index.html'),
      this.destinationPath('src/index.html'),
    );
    this.fs.copy(
      this.templatePath('rollup.config.js'),
      this.destinationPath('rollup.config.js'),
    );
    // Main.js
    this.fs.write(
      this.destinationPath('src/main.js'),
      ejs.render(this.fs.read(this.templatePath('src/main.js')), {
        styleExt,
      }),
    );
    // Global Styles
    this.fs.write(this.destinationPath(`src/global.${styleExt}`), '');
    // Package.json
    this.fs.write(
      this.destinationPath('package.json'),
      ejs.render(this.fs.read(this.templatePath('_package.json')), {
        title: urlize(title),
        author: {
          name: authorName,
          email: authorEmail,
          website: authorWebsite,
        },
        usesTS: scriptLang === 'TypeScript',
        usesCoffeeScript: scriptLang === 'CoffeeScript',
        usesSASS: ['SCSS', 'SASS'].includes(styleLang),
        usesLESS: styleLang === 'LESS',
        usesSTYLUS: styleLang === 'STYLUS',
        usesPug: markupLang === 'PUG',
      }),
    );
    // App.svelte
    this.fs.write(
      this.destinationPath('src/App.svelte'),
      ejs.render(this.fs.read(this.templatePath('src/App.svelte')), {
        title: title,
        scriptLang: mimeTypes[scriptLang],
        styleLang: mimeTypes[styleLang],
        usesPug: markupLang === 'PUG',
      }),
    );
    // Svelte.config.js
    this.fs.write(
      this.destinationPath('svelte.config.js'),
      ejs.render(this.fs.read(this.templatePath('svelte.config.js')), {
        usesJS: scriptLang === 'JavaScript',
      }),
    );
  }

  install() {
    const usesYarn = this.props.packageManager === 'Yarn';
    this.installDependencies({
      yarn: usesYarn,
      npm: !usesYarn,
      bower: false,
    });
  }

  end() {
    if (this.props.gitInit) {
      this.spawnCommandSync('git', ['init']);
      this.spawnCommandSync('git', ['add', '.']);
    }

    this.log(
      chalk.bold(
        chalk.green('Project has been generated ! ') +
          chalk.white('Thank you for using ') +
          chalk.red('generator-svelte'),
      ),
    );
  }
};
