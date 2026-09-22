#!/usr/bin/env bash
# 建置並把 dist/ 推到 gh-pages 分支（GitHub Pages 的來源分支）。
set -euo pipefail
cd "$(dirname "$0")/.."

REMOTE_URL="$(git remote get-url origin)"
SOURCE_COMMIT="$(git rev-parse --short HEAD)"

npm run build
touch dist/.nojekyll

cd dist
git init -q -b gh-pages
git add -A
git commit -q -m "deploy: ${SOURCE_COMMIT}"
git push -q --force "$REMOTE_URL" gh-pages
mv .git "$(mktemp -d)/"

echo "已部署 ${SOURCE_COMMIT}：https://nightzhe.github.io/FudiHouse/（約 1 分鐘後生效）"
