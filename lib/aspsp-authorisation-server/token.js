/**
 * A VERY Basic Authorization server which compares client_id and client_secret
 * (hard coded - see .env.sample file for values) to what is expected.
 * If credentials match then an auth token is returned.
 */
const log = require('debug')('log');

const ONE_HOUR = 3600;

const clientCredentials = () => ({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

/**
 * Stupidly simple function to make access token
 */
const makeAccessToken = () => process.env.ACCESS_TOKEN || '';

/*
 * Use Basic Authentication Scheme: https://tools.ietf.org/html/rfc2617#section-2
 */
const credentials = (id, secret) => {
  const basicCredentials = Buffer.from(`${id}:${secret}`).toString('base64');
  return `Basic ${basicCredentials}`;
};

/**
 * @description Very simple auth function to check the grant type and credentials
 * @param grantType
 * @param authorization
 */
const authenticate = (grantType, authorization) => {
  const { clientId, clientSecret } = clientCredentials();
  const expectedCredentials = credentials(clientId, clientSecret);
  const authenticated = (authorization === expectedCredentials)
    && (grantType === 'client_credentials');
  return authenticated;
};

const createToken = (req, res) => {
  const scope = req.body.scope; // eslint-disable-line
  const grantType = req.body.grant_type;
  const authorization = req.headers['authorization'];  // eslint-disable-line
  if (!scope) {
    log('scope missing from request body');
    return res.sendStatus(400);
  }
  if (!grantType) {
    log('grant_type missing from request body');
    return res.sendStatus(400);
  }
  if (!authorization) {
    log('authorization missing from request headers');
    return res.sendStatus(401);
  }
  if (authenticate(grantType, authorization)) {
    const accessToken = makeAccessToken();
    return res.json({
      access_token: accessToken,
      expires_in: ONE_HOUR,
      token_type: 'bearer',
      scope,
    });
  }
  log('authentication failed');
  return res.sendStatus(401);
};

exports.createToken = createToken;
