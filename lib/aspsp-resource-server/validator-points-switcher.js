const log = require('debug')('log');

const validatorPointsSwitcher = (inputValidator, outputValidator) => {
  log(' In validatorPointsSwitcher Instantiation');

  const alteredInputValidator = '';

  // log(' typeof inputValidator is ');
  // log(typeof inputValidator[0]);
  // log(inputValidator[0]);
  // log(' typeof outputValidator is ');
  // log(typeof outputValidator);

  // const alteredInputValidator = (req, res, next) => {
  //   if (req.path.indexOf('/account-requests') !== -1) {
  //     log(' account request - NOT doing INPUT validation ');
  //     return next();
  //   } else {
  //     log(' DOING input validation');
  //     return inputValidator(req, res, next);
  //   }
  // };

  const alteredOutputValidator = (req, res, next) => {
    if (req.path.indexOf('/account-requests') !== -1) {
      log(' account request - NOT doing OUTPUT validation ');
      return next();
    }
    log(' DOING input validation');
    return outputValidator(req, res, next);
  };

  return {
    alteredInputValidator,
    alteredOutputValidator,
  };
};

exports.validatorPointsSwitcher = validatorPointsSwitcher;
