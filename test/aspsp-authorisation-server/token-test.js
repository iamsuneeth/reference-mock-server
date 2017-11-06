const assert = require('assert');
const request = require('supertest'); // eslint-disable-line
const { app } = require('../../lib/app');
const { credentials } = require('../../lib/aspsp-authorisation-server/token');

describe('createToken', () => {
  const accessToken = 'test-access-token';
  let validCredentials;

  before(() => {
    process.env.CLIENT_ID = 'test-id';
    process.env.CLIENT_SECRET = 'test-secret';
    process.env.ACCESS_TOKEN = accessToken;
    validCredentials = credentials(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
  });

  after(() => {
    process.env.CLIENT_ID = null;
    process.env.CLIENT_SECRET = null;
  });

  const requestToken = (authCredentials, data) => {
    const body = data || {
      scope: 'accounts',
      grant_type: 'client_credentials',
    };
    let requestObj = request(app)
      .post('/token')
      .set('Accept', 'application/json');
    if (authCredentials) {
      requestObj = requestObj.set('authorization', authCredentials);
    }
    return requestObj
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(body);
  };

  it('returns 401 when credentials invalid', async () => {
    const invalidCredentials = credentials('bad-id', 'bad-secret');
    const res = await requestToken(invalidCredentials);
    assert.equal(res.status, 401);
  });

  it('returns 400 when credentials not send', async () => {
    const res = await requestToken(null);
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, {
      error: 'invalid_client',
      error_description: 'authorization missing from request headers',
    });
  });

  it('returns 400 when grant_type missing', async () => {
    const res = await requestToken(validCredentials, { scope: 'accounts' });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, {
      error: 'invalid_request',
      error_description: 'grant_type missing from request body',
    });
  });

  it('returns 400 when scope missing', async () => {
    const res = await requestToken(validCredentials, { grant_type: 'client_credentials' });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, {
      error: 'invalid_request',
      error_description: 'scope missing from request body',
    });
  });

  it('returns access token payload when credentials valid', async () => {
    const res = await requestToken(validCredentials);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      access_token: accessToken,
      expires_in: 3600,
      scope: 'accounts',
      token_type: 'bearer',
    });
  });

  it('sets Content-Type to application/json;charset=UTF-8', async () => {
    const res = await requestToken(validCredentials);
    assert.ok(res.headers['content-type']);
    assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');
  });

  it('sets no-store in Cache-Control header', async () => {
    const res = await requestToken(validCredentials);
    assert.ok(res.headers['cache-control']);
    assert.equal(res.headers['cache-control'], 'no-store');
  });

  it('sets no-store in Pragma header', async () => {
    const res = await requestToken(validCredentials);
    assert.ok(res.headers.pragma);
    assert.equal(res.headers.pragma, 'no-store');
  });
});
