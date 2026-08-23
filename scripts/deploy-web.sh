#!/usr/bin/env bash
# Build Expo static web export and deploy it to Vercel production
set -euo pipefail
cd "$(dirname "$0")/.."

npx expo export --platform web

rm -rf .vercel/output
mkdir -p .vercel/output/static
cp -r dist/. .vercel/output/static/
rm -rf .vercel/output/static/.vercel .vercel/output/static/.env.local
rm -f .vercel/output/static/vercel.json

cat > .vercel/output/config.json <<'EOF'
{
  "version": 3,
  "routes": [
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "/index.html" }
  ]
}
EOF

vercel deploy --prebuilt --prod --yes
