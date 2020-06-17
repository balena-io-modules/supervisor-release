#!/bin/bash
set -e

BALENAOS_ACCOUNT="balena_os"

echo "[INFO] Logging into ${API_ENDPOINT} as ${BALENAOS_ACCOUNT}"
export BALENARC_BALENA_URL=${BALENARC_BALENA_URL}
balena login --token "${API_TOKEN}"

echo "[INFO] Pushing ${TAG} to ${BALENAOS_ACCOUNT}/${ARCH}-supervisor"
_releaseID=$(balena deploy "${BALENAOS_ACCOUNT}/${ARCH}-supervisor" "balena/${ARCH}-supervisor:${TAG}" | sed -n 's/.*Release: //p')

balena tag set version "${TAG}" --release "${_releaseID}"
