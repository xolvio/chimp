#!/bin/bash

echo "> Transpiling ES2015"
./node_modules/.bin/babel src --ignore spec --out-dir ./dist -q
echo "> Completed transpiling ES2015"
