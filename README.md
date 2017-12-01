# Reference Mock Server

Reference mock server implemented using
[Node.js](https://nodejs.org/),
[express](https://github.com/expressjs/express), and
[swagger-express-middleware](https://github.com/BigstickCarpet/swagger-express-middleware).

For details on usage, see the readme for the
[TPP Reference Server](https://github.com/OpenBankingUK/tpp-reference-server#readme).

## To run

Mock server reads swagger file to generate endpoints.

The path or URI to the swagger file is passed to
the mock server on startup using an environment variable `SWAGGER`.

Install npm packages:

```sh
npm install
```

To run using .env file, make a local .env, and run using foreman:

```sh
cp .env.sample .env
npm run foreman
# [OKAY] Loaded ENV .env File as KEY=VALUE Format
# web.1 | log running on localhost:8001 ...
```

Or to set environment variables on the command line:

```sh
DEBUG=error,log \
  VERSION=v1.1 \
  SWAGGER=https://www.openbanking.org.uk/wpcore/wp-content/uploads/2017/09/account-info-1-1-0-swagger.json \
  PAYMENT_SWAGGER=https://www.openbanking.org.uk/wpcore/wp-content/uploads/2017/09/payment-initiation-1-1-0-swagger.json \
  PORT=8001 \
  OPENID_CONFIG_ENDPOINT_URL=http://localhost:$PORT/openid/config \
  OPENID_ASPSP_AUTH_HOST=http://localhost:$PORT \
  HOST=http://localhost:$PORT \
  npm start
# running on localhost:8001 ...
```

Set debug log levels using `DEBUG` env var.
Set API URI version number using `VERSION` env var.
Set API specification file using `SWAGGER` env var.

## ASPSP resource server mock data

Currently mock data is read off the file system.

For example, given the file
`./data/abcbank/alice/accounts.json` exists, then setting
request headers `x-fapi-financial-id: abcbank` and `Authorization: alice` when
GET requesting `/accounts` returns the JSON in that file.

```sh
curl -H "x-fapi-financial-id: abcbank" \
     -H "Authorization: alice" \
     -H "Accept: application/json" \
     http://localhost:8001/open-banking/v1.1/accounts

# {"Data":[{"AccountId":"22289","Currency"...

# Or if using [httpie](https://httpie.org/), e.g. brew install httpie
http --json http://localhost:8001/open-banking/v1.1/accounts \
     x-fapi-financial-id:abcbank \
     Authorization:alice

```

If a file matching the request does not exist, then 404 Not Found is returned.
For example, requesting an account number not on file:

```sh
curl -H "Authorization: alice" \
     -H "Accept: application/json" \
     -H "x-fapi-financial-id: abcbank" \
     http://localhost:8001/open-banking/v1.1/accounts/124

# Not Found

# Or if using [httpie](https://httpie.org/), e.g. brew install httpie
http --json http://localhost:8001/open-banking/v1.1/accounts/124 \
     x-fapi-financial-id:abcbank \
     Authorization:alice
```

## Deploy to heroku

To deploy to heroku for the first time from a Mac:

```sh
brew install heroku

heroku login

heroku create --region eu

heroku apps:rename <newname>

heroku config:set DEBUG=error,log

heroku config:set SWAGGER=swagger-uri

heroku config:set VERSION=<version-for-api-uri>

heroku config:set OPENID_CONFIG_ENDPOINT_URL=https://<heroku-host-domain>/openid/config

heroku config:set OPENID_ASPSP_AUTH_HOST=https://<heroku-host-domain>

heroku config:set HOST=https://<heroku-host-domain>

git push heroku master
```

To test (basic):
```sh
curl https://<newname>.herokuapp.com/health

# OK

# Or if using [httpie](https://httpie.org/), e.g. brew install httpie
http --json https://<newname>.herokuapp.com/health

```

To test (advanced):
```sh
curl -H "x-fapi-financial-id: abcbank" \
     -H "Authorization: alice" \
     -H "Accept: application/json" \
     https://<newname>.herokuapp.com/open-banking/v1.1/accounts

# {"Data":[{"AccountId":"22289","Currency"...

# Or if using [httpie](https://httpie.org/), e.g. brew install httpie
http --json https://<newname>.herokuapp.com/open-banking/v1.1/accounts \
     x-fapi-financial-id:abcbank \
     Authorization:alice

```
