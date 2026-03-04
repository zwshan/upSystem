#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

export NO_PROXY="127.0.0.1,localhost,::1"
export no_proxy="127.0.0.1,localhost,::1"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/local.sh dev    # 初始化并启动本地服务
  ./scripts/local.sh test   # 初始化并执行 typecheck + 单元测试 + e2e
EOF
}

bootstrap() {
  if [ ! -d "node_modules" ]; then
    npm install
  fi
  npm run prisma:generate
  npm run prisma:push
}

MODE="${1:-dev}"

case "$MODE" in
  dev)
    bootstrap
    echo "服务启动后访问: http://localhost:3000"
    npm run dev
    ;;
  test)
    bootstrap
    npm run typecheck
    npm run test
    npm run e2e -- tests/e2e/happy-path.spec.ts
    ;;
  *)
    usage
    exit 1
    ;;
esac
