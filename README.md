## Developer Guide:

* Install Main dependencies
```
npm i
```

* Install Chimp Dependencies
```
cd chimp
npm i
```

* Install Test Project Dependencies
```
cd test-project
npm i
```

* Transpile the chimp files to the `dist` dir:
```
npm run transpile
```
NOTE: you can also use `npm run watch` and keep this window open to continually transpile files in the Chimp dir.


* Link Chimp to the `dist` folder:
```
cd dist
npm link
```

* Link the test project to the newly linked Chimp:
```
cd test-project
npm link chimp
```

* Run the tests:
```
cd test-project
npm test
```

* For Debugging:
`/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --user-data-dir=~/chrome_profile http://localhost:9222`

* Publish / Install
npm publish --tag next
npm install chimp@next
