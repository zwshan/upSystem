#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONDA_ENV_PREFIX="${ROOT_DIR}/.conda/upsystem"
FRONTEND_DIR="${ROOT_DIR}/frontend"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
BACKEND_PORT="${BACKEND_PORT:-8000}"

FRONTEND_PID=""
BACKEND_PID=""

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "[ERROR] Missing command: $cmd"
    exit 1
  fi
}

port_in_use() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi

  if command -v nc >/dev/null 2>&1; then
    nc -z 127.0.0.1 "${port}" >/dev/null 2>&1
    return $?
  fi

  return 1
}

ensure_conda_env() {
  if [[ -x "${CONDA_ENV_PREFIX}/bin/python" ]]; then
    echo "[INFO] Conda env exists: ${CONDA_ENV_PREFIX}"
    return
  fi

  echo "[INFO] Creating conda env at ${CONDA_ENV_PREFIX} ..."
  conda env create -p "${CONDA_ENV_PREFIX}" -f "${ROOT_DIR}/environment.yml"
}

ensure_frontend_deps() {
  if [[ -d "${FRONTEND_DIR}/node_modules" ]]; then
    echo "[INFO] Frontend dependencies already installed."
    return
  fi

  echo "[INFO] Installing frontend dependencies ..."
  (
    cd "${FRONTEND_DIR}"
    npm install
  )
}

wait_for_http() {
  local name="$1"
  local url="$2"
  local retries=60

  for _ in $(seq 1 "${retries}"); do
    if curl -fsS "${url}" >/dev/null 2>&1; then
      echo "[INFO] ${name} is ready: ${url}"
      return
    fi
    sleep 1
  done

  echo "[WARN] ${name} did not become ready in time: ${url}"
}

cleanup() {
  set +e
  echo
  echo "[INFO] Stopping services ..."

  if [[ -n "${FRONTEND_PID}" ]] && kill -0 "${FRONTEND_PID}" >/dev/null 2>&1; then
    kill "${FRONTEND_PID}" >/dev/null 2>&1
  fi

  if [[ -n "${BACKEND_PID}" ]] && kill -0 "${BACKEND_PID}" >/dev/null 2>&1; then
    kill "${BACKEND_PID}" >/dev/null 2>&1
  fi

  wait >/dev/null 2>&1
  echo "[INFO] Done."
}

main() {
  require_cmd conda
  require_cmd npm
  require_cmd curl

  if port_in_use "${FRONTEND_PORT}"; then
    echo "[ERROR] Frontend port is already in use: ${FRONTEND_PORT}"
    exit 1
  fi

  if port_in_use "${BACKEND_PORT}"; then
    echo "[ERROR] Backend port is already in use: ${BACKEND_PORT}"
    exit 1
  fi

  ensure_conda_env
  ensure_frontend_deps

  trap cleanup INT TERM EXIT

  echo "[INFO] Starting backend on http://127.0.0.1:${BACKEND_PORT} ..."
  (
    cd "${BACKEND_DIR}"
    conda run --no-capture-output -p "${CONDA_ENV_PREFIX}" \
      uvicorn main:app --reload --host 127.0.0.1 --port "${BACKEND_PORT}"
  ) &
  BACKEND_PID=$!

  echo "[INFO] Starting frontend on http://127.0.0.1:${FRONTEND_PORT} ..."
  (
    cd "${FRONTEND_DIR}"
    npm run dev -- --host 127.0.0.1 --port "${FRONTEND_PORT}"
  ) &
  FRONTEND_PID=$!

  wait_for_http "Backend" "http://127.0.0.1:${BACKEND_PORT}/api/v1/health"
  wait_for_http "Frontend" "http://127.0.0.1:${FRONTEND_PORT}"

  echo "[INFO] Services are running."
  echo "[INFO] Frontend: http://127.0.0.1:${FRONTEND_PORT}"
  echo "[INFO] Backend:  http://127.0.0.1:${BACKEND_PORT}/docs"
  echo "[INFO] Press Ctrl+C to stop both."

  wait
}

main "$@"
