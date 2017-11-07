/*
Purpose of this:
There is a problem with the swagger-tools validation
it incorrectly throws an error on input validation when `consumes` is set to
application/json; charset=utf-8
and
request content-type is set to
application/json; charset=utf-8

There is another problem whereby the format date-time elements in the payload
ALSO fail validation

So this utility bypasses all the input validation

at the moment only a single path is avoided - function could be extended to include multiple paths
This is all a hack just to get this working quickly
CSG
*/

const avoidPath = '/account-requests';

const validatorPointsSwitcher = (inputValidatorArray, outputValidator) => {
  const alteredInputValidator = inputValidatorArray.map(fn => (req, res, next) => {
    if (req.path.indexOf(avoidPath) === -1) {
      return fn.call({}, req, res, next); // USE the existing middleware function
    }
    return next(); // Skip the middleware
  });

  const alteredOutputValidator = (req, res, next) => {
    if (req.path.indexOf(avoidPath) === -1) {
      return outputValidator(req, res, next);
    }
    return next();
  };

  return {
    alteredInputValidator,
    alteredOutputValidator,
  };
};

exports.validatorPointsSwitcher = validatorPointsSwitcher;
