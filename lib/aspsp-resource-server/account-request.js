// const log = require('debug')('log');
const uuidv4 = require('uuid/v4'); // Used for AccountRequestIDs

const accountRequestHelper = (() => {
  const accountRequestStore = {}; // TODO - Persist

  const makeLinks = (accountRequestId) => {
    const links = {
      Links: {
        Self: `/account-requests/${accountRequestId}`,
      },
    };
    return links;
  };

  const makeMeta = () => {
    const meta = {
      Meta: {
        TotalPages: 1,
      },
    };
    return meta;
  };

  const makeRisk = () => {
    const risk = {
      Risk: {},
    };
    return risk;
  };

  const getAccessToken = () => process.env.ACCESS_TOKEN || ''; // Hard Coded

  const checkAuthorization = (creds) => {
    let status = true;
    // TODO - MORE Checks in real life
    const { authorization } = creds;
    const allow = authorization === `Bearer ${getAccessToken()}`;
    if (!allow) status = false;
    return status;
  };

  const makeAccountRequestId = () => uuidv4(); // return 'spoof-account-request-id';

  const getCachedAccountRequest = accountRequestId =>
    accountRequestStore[accountRequestId] || false;

  const deleteCachedAccountRequest = (accountRequestId) => {
    const accountRequest = accountRequestStore[accountRequestId] || false;
    delete accountRequestStore[accountRequestId];
    return !!accountRequest;
  };

  const setCachedAccountRequest = (accountRequestId, accountRequest) => {
    accountRequestStore[accountRequestId] = accountRequest;
  };

  const buildGetResponse = (accountRequestId) => {
    const response = getCachedAccountRequest(accountRequestId);
    if (!response) return false;
    response.Data.Status = 'Authorised'; // SPOOF
    return response;
  };

  const buildPostResponse = (accountRequestId, requestData) => {
    const d = new Date();
    const creation = `${d.toISOString().slice(0, -5)}+00:00`;
    d.setFullYear(d.getFullYear() + 1);
    const expiration = `${d.toISOString().slice(0, -5)}+00:00`; // Assume one year's time

    const reqData = requestData || {
      ExpirationDateTime: expiration, // Spoof
      TransactionFromDateTime: null,
      TransactionToDateTime: null,
      Permissions: [],
    };

    const data = {
      AccountRequestId: accountRequestId,
      Status: 'AwaitingAuthorisation', // Spoof
      CreationDateTime: creation,
      ExpirationDateTime: reqData.ExpirationDateTime,
      TransactionFromDateTime: reqData.TransactionFromDateTime,
      TransactionToDateTime: reqData.TransactionToDateTime,
      Permissions: reqData.Permissions,
    };

    /* Authorised AwaitingAuthorisation Rejected Revoked  */
    const resp = Object.assign({ Data: data }, makeRisk(), makeLinks(accountRequestId), makeMeta());
    // console.log(resp);
    return resp;
  };

  return {
    checkAuthorization,
    makeAccountRequestId,
    getCachedAccountRequest,
    setCachedAccountRequest,
    buildGetResponse,
    buildPostResponse,
    deleteCachedAccountRequest,
  };
})();

exports.accountRequestHelper = accountRequestHelper;
