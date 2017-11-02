/* eslint import/no-extraneous-dependencies: off */
const assert = require('assert');
const sinon = require('sinon');
const swagger = require('../../lib/aspsp-resource-server/swagger');
const fs = require('fs');

const sandbox = sinon.createSandbox();
const nock = require('nock');

describe('fetchSwagger', () => {
  const uri = 'https://example.com/path';

  describe('when SWAGGER env contains URI', () => {
    before(() => {
      sandbox.restore();
      process.env.SWAGGER = uri;
    });

    nock(/example\.com/)
      .get('/path')
      .reply(200, {});

    it('does HTTP GET of URI', async () => {
      const file = await swagger.fetchSwagger();
      assert.equal(file, './swagger.json');
    });
  });

  describe('when SWAGGER env does not contain URI', () => {
    const file = './path/swagger.json';

    before(() => {
      sandbox.restore();
      process.env.SWAGGER = file;
      try {
        sandbox.stub(fs, 'existsSync').returns(true);
      } catch (e) {
        // ignore, due to error raised when running npm run test:watch
      }
    });

    after(() => {
      process.env.SWAGGER = null;
    });

    it('checks env is a file that exists', async () => {
      const result = await swagger.fetchSwagger();
      assert(result, file);
      assert(fs.existsSync.calledWithMatch(file));
    });
  });
});
