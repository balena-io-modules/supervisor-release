#!/bin/bash
set -e

BALENAOS_ACCOUNT="balena_os"
if [ -z "${API_TOKEN}" ]; then
    echo "[ERROR] API_TOKEN env variable required, exiting"
    exit 1
fi

echo "[INFO] Logging into ${BALENARC_BALENA_URL} as ${BALENAOS_ACCOUNT}"
export BALENARC_BALENA_URL=${BALENARC_BALENA_URL}
if [[ "$(balena whoami | awk '/USERNAME/{print $2}')" != "${BALENAOS_ACCOUNT}" ]]; then
    balena login --token "${API_TOKEN}"
fi

echo "[INFO] Pushing ${TAG} to ${BALENAOS_ACCOUNT}/${ARCH}-supervisor"
_releaseID=$(balena deploy "${BALENAOS_ACCOUNT}/${ARCH}-supervisor" "balena/${ARCH}-supervisor:${TAG}" | sed -n 's/.*Release: //p')

balena tag set version "${TAG}" --release "${_releaseID}"
curl -XPATCH -H "Content-type: application/json" -H "Authorization: Bearer ${API_TOKEN}" \
    "https://api.${BALENARC_BALENA_URL}/v6/release?\$filter=commit%20eq%20'${_releaseID}'" -d "{\"release_version\": \"${TAG}\"}"
