#!/bin/bash

set -ex
echo "Pulling meta-balena"

SCRIPT_PATH=meta-balena-common/recipes-containers/resin-supervisor/resin-supervisor.inc

if [ -z $TAG ]; then
	echo "A \$TAG variable is required with the new supervisor version"
	exit 1
fi
if [ -z $OLD_TAG ]; then
	echo "An \$OLD_TAG variable is required with the current supervisor version"
	exit 1
fi

read -p "Change-type? " CHANGE_TYPE

if [ ! -d /tmp/meta-balena ]; then
	git clone git@github.com:balena-os/meta-balena /tmp/meta-balena
else
	cd /tmp/meta-balena
	git reset --hard
fi

cd /tmp/meta-balena
echo "Checking out develop branch and syncing"
git reset --hard
git checkout development
git pull
git branch "supervisor-$TAG"
git checkout "supervisor-$TAG"

echo "Performing supervisor update"
sed -i "s/SUPERVISOR_TAG.*/SUPERVISOR_TAG ?= \"${TAG}\"/g" "${SCRIPT_PATH}"

echo "Commiting and pushing"
git add "${SCRIPT_PATH}"
git commit -s -F- <<EOF
balena-supervisor: Update to ${TAG}

Update balena-supervisor from ${OLD_TAG} to ${TAG}

Changelog-entry: Update balena-supervisor from ${OLD_TAG} to ${TAG}
Change-type: ${CHANGE_TYPE}
EOF

git push -u origin "supervisor-$TAG"

echo "Cleaning up"
rm -rf /tmp/meta-balena
