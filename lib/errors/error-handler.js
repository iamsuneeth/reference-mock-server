const log = require('debug')('log');

const errorType = (err) => {
  const ret = (!!err && !!err.constructor && !!err.constructor.name) ? err.constructor.name : 'Error';
  return ret;
};

const handler = (err, req, res, next) => { // eslint-disable-line
  const errClassName = errorType(err);
  switch (errClassName) {
    case 'ValidationException':
      res.status(400).send(err.message);
      break;
    case 'RedirectionException': {
      const entries = Object.entries(err.queryParams);
      const query = entries
        .map((q) => {
          const ret = `${q[0]}=${q[1]}`;
          return ret;
        })
        .reduce((comb, p) => {
          const ret = `${comb}&${p}`;
          return ret;
        });
      res.redirect(302, `${err.redirectionUrl}?${query}`);
      break;
    }
    default:
      res.redirect(500, 'Unknown server error');
  }
};

const logger = (err, req, res, next) => {
  log(`${errorType(err)} => ${err.stack}`);
  next(err);
};

module.exports = {
  handler,
  logger,
};
