#!/bin/sh
set -e
cat site.b64.* | base64 -d > site.tar.gz
rm -rf public
mkdir -p public
tar -xzf site.tar.gz -C public
cp index.html public/index.html
cp script.js public/script.js
cp -R privacy terms public/
