const assert = require('assert');
const request = require('supertest'); // eslint-disable-line
const httpMocks = require('node-mocks-http');

const proxyquire = require('proxyquire');
const env = require('env-var');

describe('/authorize endpoint test', () => {
  const state = '123456';
  const aspspCallbackRedirectionUrl = 'http://example.com/aaa-bank-url';
  const authorsationCode = 'ABCD123456789';

  const refQuery = {
    redirect_uri: aspspCallbackRedirectionUrl,
    state,
    client_id: 'ABC',
    response_type: 'code',
    request: 'jwttoken',
    scope: 'openid accounts',
  };

  process.env.AUTHORISATION_CODE = authorsationCode;
  const { authorise } = (proxyquire('../../lib/aspsp-authorisation-server/authorise', {
    'env-var': env.mock({
      AUTHORISATION_CODE: authorsationCode,
    }),
  }));

  const createRequest = (opts = {}) => {
    const query = Object.assign({}, refQuery, opts);
    return httpMocks.createRequest({
      method: 'GET',
      url: '/aaa-bank/authorize',
      query,
    });
  };

  const assertRedirectionSuccessful = (res) => {
    assert.equal(res.statusCode, 302);
    const location = res._getRedirectUrl();  //eslint-disable-line
    assert.ok(location);
    assert.ok(location.startsWith(aspspCallbackRedirectionUrl));
    assert.ok(location.includes(`code=${authorsationCode}`));
    assert.ok(location.includes(`state=${state}`));
  };

  afterEach(() => {
    process.env.HEADLESS_CONSENT = 'false';
  });

  describe('consent approval page', () => {
    it('should display when approval required and query params are valid', () => {
      const req = createRequest();
      const res = httpMocks.createResponse();
      authorise(req, res);
      assert.equal(res.statusCode, 200);
      assert.ok(res._getData().includes('Welcome to the bank')); //eslint-disable-line
    });

    it('should be bypassed for headless consent and query params are valid', () => {
      process.env.HEADLESS_CONSENT = 'true';
      const req = createRequest();
      const res = httpMocks.createResponse();
      authorise(req, res);
      assertRedirectionSuccessful(res);
    });
  });

  describe('approved consent', () => {
    it('should redirect for account flow when query params are valid', () => {
      const req = createRequest({ scope: 'openid accounts', approve: 1 });
      const res = httpMocks.createResponse();
      authorise(req, res);
      assertRedirectionSuccessful(res);
    });

    it('should redirect for payment flow when query params are valid', () => {
      const req = createRequest({ scope: 'openid payments', approve: 1 });
      const res = httpMocks.createResponse();
      authorise(req, res);
      assertRedirectionSuccessful(res);
    });
  });

  describe('consent not approved', () => {
    it('should throw an exception ', async () => {
      const req = createRequest({ scope: 'openid payments', cancel: 1 });
      const res = httpMocks.createResponse();
      try {
        await authorise(req, res);
        assert.fail(new Error('Authorise should have failed.'));
      } catch (e) {
        assert.equal(e.message, 'Redirection due to access_denied');
      }
    });
  });
});
