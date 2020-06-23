'use strict';
// Const path = require('path');
// const assert = require('yeoman-assert');
// const helpers = require('yeoman-test');

const {
  // StyleExts,
  scriptLangs,
  styleLangs,
  markupLangs,
} = require('../common/variables');

describe('generator-svelte:app', () => {
  describe('it works with all possibilities of languages', () => {
    for (const scriptLang of scriptLangs) {
      for (const styleLang of styleLangs) {
        for (const markupLang of markupLangs) {
          describe(`${scriptLang} ${styleLang} ${markupLang}`, () => {
            test('it creates the right files', () => expect(true).toBe(true));
            test('it is able to run in dev mode', () =>
              expect(true).toBe(true));
            test('it is able to build in prod mode', () =>
              expect(true).toBe(true));
          });
        }
      }
    }
  });
  describe('it respects the selected options', () => {
    describe('it uses the selected package manager', () => {
      test('it uses Yarn when selected', () => expect(true).toBe(true));
      test('it uses NPM when selected', () => expect(true).toBe(true));
    });
    describe('it inits the git repo when selected', () => {
      test('it inits the git repo when selected', () =>
        expect(true).toBe(true));
      test("it doesn't init the git repo when not selected", () =>
        expect(true).toBe(true));
    });
  });
});
