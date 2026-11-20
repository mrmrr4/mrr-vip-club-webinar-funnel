#!/bin/sh
set -e
cat site.b64.* | base64 -d > site.tar.gz
rm -rf public
mkdir -p public
tar -xzf site.tar.gz -C public
cp meta-pixel.js public/meta-pixel.js
cp booked.html public/booked.html
cp favicon.svg public/favicon.svg
cp masterclass-schedule.css public/masterclass-schedule.css
cp masterclass-schedule.js public/masterclass-schedule.js
sed -i 's#</head>#<link rel="icon" type="image/svg+xml" href="/favicon.svg" /><link rel="stylesheet" href="/masterclass-schedule.css" /><script src="/meta-pixel.js"></script></head>#' public/index.html
sed -i 's#</body>#<script src="/masterclass-schedule.js"></script></body>#' public/index.html
sed -i 's#</head>#<link rel="icon" type="image/svg+xml" href="/favicon.svg" /></head>#' public/booked.html
