/**
 * A VERY Basic Authorization server which compares client_id and client_secret
 * (hard coded - see .env.sample file for values) to what is expected.
 * If credentials match then an auth token is returned.
 */
const log = require('debug')('log');

const ONE_HOUR = 3600;

const getCreds = () => {
  const clientId = process.env.CLIENT_ID || 'dsjkfhwervnewkjrnvewryvnewjrhvnewhrvnewjkrhvnewjkrhvnewhrnv';
  const clientSecret = process.env.CLIENT_SECRET || 'wervewhnrvjewhnrvjkehwrnvehjrwnvwehjrnvwekhjrnvwekjrhvenwjkrhvwn';
  return {
    clientId,
    clientSecret,
  };
};

/**
 * Stupidly simple function to make access token
 */
const makeAccessToken = () => process.env.ACCESS_TOKEN || '';

const authFromCreds = (id, secret) => {
  const auth = Buffer.from(`${id}:${secret}`).toString('base64');
  return auth;
};

/**
 * @description Very simple auth function to check the grant type and credentials
 * @param grantType
 * @param authorization
 */
const checkAuth = (grantType, Authorization) => {
  const creds = getCreds();
  const auth = authFromCreds(creds.clientId, creds.clientSecret);
  return ((auth === Authorization) && (grantType === 'client_credentials'));
};

const createToken = (req, res) => {
  const params = req.body;
  // const grant_type = params.grant_type;
  const { scope, grant_type } = params;
  const authorization = req.headers['authorization'];  // eslint-disable-line
  if (checkAuth(grant_type, authorization)) {
    const accessToken = makeAccessToken();
    res.json({
      access_token: accessToken,
      expires_in: ONE_HOUR,
      token_type: 'bearer',
      scope,
    });
  } else {
    log('Auth Fail ');
    res.sendStatus(401);
  }
};

exports.createToken = createToken;
