// See https://openbanking.atlassian.net/wiki/spaces/WOR/pages/5785171/Account+and+Transaction+API+Specification+-+v1.1.0#AccountandTransactionAPISpecification-v1.1.0-Request
const { accountRequestHelper } = require('./account-request.js');

const accountRequests = (() => {
  const post = (req, res) => {
    let accountRequestId;
    let accountRequest;
    const authorization = req.headers['authorization']; // eslint-disable-line
    const interactionId = req.headers['x-fapi-interaction-id'] || '';
    const authorized = accountRequestHelper.checkAuthorization({ authorization });
    if (!authorized) {
      res.sendStatus(401);
    } else {
      accountRequestId = accountRequestHelper.makeAccountRequestId();
      accountRequest = accountRequestHelper.buildPostResponse(accountRequestId, req.body.Data);
      accountRequestHelper.setCachedAccountRequest(accountRequestId, accountRequest);
      res.status(201)
        .header('Content-Type', 'application/json')
        .header('x-fapi-interaction-id', interactionId)
        .json(accountRequest);
    }
  };

  const get = (req, res) => {
    const authorization = req.headers['authorization']; // eslint-disable-line
    const authorized = accountRequestHelper.checkAuthorization({ authorization });
    const interactionId = req.headers['x-fapi-interaction-id'] || '';
    const accountRequestId = req.params.id;
    const accountRequest = accountRequestHelper.getCachedAccountRequest(accountRequestId);
    if (!authorized) {
      res.sendStatus(401);
    }
    if (authorized && accountRequest) {
      res.status(200)
        .header('Content-Type', 'application/json')
        .header('x-fapi-interaction-id', interactionId)
        .json(accountRequest);
    } else {
      // request a resource URL with an resource Id that does not exist,
      // the ASPSP must respond with a 400 (Bad Request)
      res.sendStatus(400);
    }
  };

  const del = (req, res) => {
    const authorization = req.headers['authorization']; // eslint-disable-line
    const authorized = accountRequestHelper.checkAuthorization({ authorization });
    const interactionId = req.headers['x-fapi-interaction-id'] || '';
    const accountRequestId = req.params.id;
    accountRequestHelper.deleteCachedAccountRequest(accountRequestId);
    if (!authorized) {
      res.sendStatus(401);
    } else {
      // W3 suggests idempotency - https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html
      res.status(204)
        .header('x-fapi-interaction-id', interactionId)
        .send();
    }
  };

  const put = (req, res) => {
    const authorization = req.headers['authorization']; // eslint-disable-line
    const authorized = accountRequestHelper.checkAuthorization({ authorization });
    if (!authorized) {
      res.sendStatus(401);
    } else {
      const interactionId = req.headers['x-fapi-interaction-id'] || '';
      const accountRequestId = req.params.id;
      accountRequestHelper.updateAccountRequestToAuthorised(accountRequestId);
      res.status(204)
        .header('x-fapi-interaction-id', interactionId)
        .send();
    }
  };

  const accountRequestMiddleware = (req, res, next) => {
    if (req.path.indexOf('/open-banking/v1.1/account-requests') === -1) {
      next();
    } else {
      // Hand off to Account Request Handler
      switch (req.method) {
        case 'POST':
          post(req, res);
          break;

        case 'GET':
          get(req, res);
          break;

        case 'DELETE':
          del(req, res);
          break;

        case 'PUT':
          put(req, res);
          break;

        default:
          res.sendStatus(400);
          break;
      }
    }
  };

  return {
    get,
    post,
    del,
    put,
    accountRequestMiddleware,
  };
})();

exports.accountRequests = accountRequests;
