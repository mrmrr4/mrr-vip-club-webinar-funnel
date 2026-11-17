#!/bin/sh
set -e
cat site.b64.* | base64 -d > site.tar.gz
rm -rf public
mkdir -p public
tar -xzf site.tar.gz -C public
cp meta-pixel.js public/meta-pixel.js
cp booked.html public/booked.html
sed -i 's#</head>#<script src="/meta-pixel.js"></script></head>#' public/index.html
