Cucumber:
```shell
./node_modules/.bin/cucumberjs --compiler js:babel-core/register tests
```

Mocha:
```shell
./node_modules/.bin/mocha --compilers js:babel-core/register tests/mocha.spec.js
```

Jest:
```shell
./node_modules/.bin/jest tests/jest.spec.js
```
