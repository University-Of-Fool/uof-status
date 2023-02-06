#!/bin/bash

cd $(dirname $0)
npm install
npx tsc
cp -r ./package.json ./layouts ./prisma ./config.toml ./README.md ./LICENSE ./APIREADME.md build/
# without using -i option for Darwin and *BSD
sed -e's|"node build/app"|"node app"|' build/package.json > build/package.json
