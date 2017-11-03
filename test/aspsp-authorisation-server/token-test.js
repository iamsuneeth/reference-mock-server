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
    return request(app)
      .post('/token')
      .set('Accept', 'application/json')
      .set('authorization', authCredentials)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(body);
  };

  it('returns 401 when credentials invalid', async () => {
    const invalidCredentials = credentials('bad-id', 'bad-secret');
    const res = await requestToken(invalidCredentials);
    assert.equal(res.status, 401);
  });

  it('returns 401 when credentials blank', async () => {
    const res = await requestToken(null);
    assert.equal(res.status, 401);
  });

  it('returns 400 when grant_type missing', async () => {
    const res = await requestToken(validCredentials, { scope: 'accounts' });
    assert.equal(res.status, 400);
  });

  it('returns 400 when scope missing', async () => {
    const res = await requestToken(validCredentials, { grant_type: 'client_credentials' });
    assert.equal(res.status, 400);
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
});
