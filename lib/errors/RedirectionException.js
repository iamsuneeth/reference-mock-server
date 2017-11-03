
module.exports = class RedirectionException extends Error {
  constructor(redirectionUrl, queryParams = {}, ...params) {
    super(...params);

    Error.captureStackTrace(this, RedirectionException);
    this.redirectionUrl = redirectionUrl;
    this.queryParams = queryParams;
  }
};
