#!/bin/bash

cd $(dirname $0)
npm install
npx tsc
cp -r ./package.json ./layouts ./prisma ./config.toml ./README.md ./LICENSE ./APIREADME.md build/
