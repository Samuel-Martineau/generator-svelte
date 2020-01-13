'use strict';
const Generator = require('yeoman-generator');
const latestVersion = require('latest-version');
const chalk = require('chalk');
const yosay = require('yosay');

const fs = require('fs');

module.exports = class extends Generator {
  async prompting() {
    this.log(
      yosay(
        `Welcome to the exceptional ${chalk.red(
          'generator-svelte',
        )} generator!`,
      ),
    );

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: "What's your name ?",
        default: this.user.git.name(),
        store: true,
      },
      {
        type: 'input',
        name: 'email',
        message: "What's your email ?",
        default: this.user.git.email(),
        store: true,
      },
      {
        type: 'input',
        name: 'website',
        message: "What's your website ?",
        store: true,
      },
      {
        type: 'input',
        name: 'title',
        message: "What's the title of your app ?",
      },
      {
        type: 'list',
        name: 'scriptLanguage',
        message:
          'In wich language do you want to write the scripts of your Svelte app ?',
        choices: ['JavaScript', 'TypeScript', 'CoffeeScript'],
        store: true,
      },
      {
        type: 'list',
        name: 'styleLanguage',
        message:
          'In wich language do you want to write the styles of your Svelte app ?',
        choices: ['CSS', 'SCSS', 'SASS', 'LESS', 'STYLUS'],
        store: true,
      },
      {
        type: 'list',
        name: 'markupLanguage',
        message:
          'In wich language do you want to write the markups of your Svelte app ?',
        choices: ['HTML', 'PUG'],
        store: true,
      },
      {
        type: 'confirm',
        name: 'gitInit',
        message: 'Do you want to initialize a git repository ?',
        default: true,
        store: true,
      },
    ];

    const props = await this.prompt(prompts);
    const { email, website, name } = props;

    this.composeWith(require.resolve('generator-license'), {
      name,
      email,
      website,
      licensePrompt: 'Which license do you want to use?',
    });
    this.props = props;
  }

  async writing() {
    const {
      title,
      email,
      website,
      name,
      styleLanguage,
      scriptLanguage,
      markupLanguage,
    } = this.props;

    try {
      fs.mkdirSync(this.destinationPath('public'));
    } catch {}

    this.fs.copy(this.templatePath('**/*'), this.destinationRoot());
    this.fs.copy(this.templatePath('**/.*'), this.destinationRoot());

    let otherDevDependencies = [];

    switch (styleLanguage) {
      case 'SCSS' || 'SASS':
        otherDevDependencies.push('node-sass');
        break;
      case 'STYLUS':
        otherDevDependencies.push('stylus');
        break;
      case 'LESS':
        otherDevDependencies.push('less');
        break;
      default:
        break;
    }

    switch (scriptLanguage) {
      case 'TypeScript':
        otherDevDependencies.push('typescript');
        break;
      case 'CoffeeScript':
        otherDevDependencies.push('coffeescript');
        break;
      default:
        break;
    }

    if (markupLanguage === 'PUG') otherDevDependencies.push('pug');

    otherDevDependencies = await Promise.all(
      otherDevDependencies.map(async d => [d, await latestVersion(d)]),
    );

    const pkgJson = this.fs.readJSON(this.destinationPath('package.json'));
    pkgJson.name = title.toLowerCase().replace(/ /g, '-');
    pkgJson.author = {
      email,
      url: website,
      name,
    };
    pkgJson.devDependencies = {
      ...pkgJson.devDependencies,
      ...Object.fromEntries(otherDevDependencies),
    };
    this.fs.writeJSON(this.destinationPath('package.json'), pkgJson);

    let appSvelte = this.fs.read(this.destinationPath('src/App.svelte'));
    const scriptL =
      scriptLanguage === 'CoffeeScript'
        ? 'text/coffeescript'
        : scriptLanguage.toLowerCase();
    const styleL =
      styleLanguage === 'STYLUS' ? 'text/stylus' : styleLanguage.toLowerCase();
    appSvelte = appSvelte.replace('STYLE_LANGUAGE', styleL);
    appSvelte = appSvelte.replace('SCRIPT_LANGUAGE', scriptL);
    let markup;
    if (markupLanguage === 'PUG')
      markup = `<template lang="pug">
      h1 Hello World
    </template>`;
    else markup = '<h1>Hello World</h1>';
    appSvelte = appSvelte.replace('<!-- MARKUP -->', markup);
    this.fs.write(this.destinationPath('src/App.svelte'), appSvelte);

    let styleExt = styleLanguage.toLowerCase();
    if (styleLanguage === 'STYLUS') styleExt = 'styl';
    this.fs.move(
      this.destinationPath('src/global.style'),
      this.destinationPath('src/global.' + styleExt),
    );
    this.fs.write(
      this.destinationPath('src/main.js'),
      this.fs
        .read(this.destinationPath('src/main.js'))
        .replace('.style', '.' + styleExt),
    );

    this.fs.write(
      this.destinationPath('src/index.html'),
      this.fs
        .read(this.destinationPath('src/index.html'))
        .replace('<!-- Title -->', title),
    );
  }

  install() {
    this.installDependencies({ bower: false, npm: true });
  }

  end() {
    if (this.props.gitInit) {
      this.spawnCommandSync('git', ['init']);
      this.spawnCommandSync('git', ['add', '.']);
    }

    this.log(
      chalk.bold(
        chalk.green('Project has been generated ! ') +
          chalk.white('Thank you for using "generator-svelte"'),
      ),
    );
  }
};
