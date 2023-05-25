#!/bin/bash

echo -e "\033[32m::\033[0m Generating uof-status..."
cd $(dirname $0)
yarn
if test "$?" -eq 127 ; then
  echo -e "\033[32m::\033[0m yarn not found, falling back to npm..."
  echo -e "\033[33m::\033[0m WARN: this may lead to problem"
  npm install
fi
npx tsc
cp -r ./package.json config.sample.toml ./prisma ./README.md ./LICENSE ./APIREADME.md yarn.lock build/
cp -r ./src/layouts build/src/layouts
cp ./dotenv_example build/.env.sample
if [ -x "$(command -v zip)" ]
then
  echo -e "\033[32m::\033[0m Packaging"
  cp -r build/ build/uof-status/
  rm -f build/uof-status/.DS_Store
  cd build/
  zip -9r ../uof-status.zip -xi uof-status/
  rm -rf uof-status/
else
  echo -e "\033[32m::\033[0m \`zip\` not found, skipped packaging"
fi
