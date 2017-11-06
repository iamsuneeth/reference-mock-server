module.exports = class ValidationException extends Error {
  constructor(...params) {
    super(...params);

    Error.captureStackTrace(this, ValidationException);
  }
};
