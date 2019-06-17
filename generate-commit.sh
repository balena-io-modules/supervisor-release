#!/bin/bash

set -ex
echo "Pulling meta-balena"

if [ -z $TAG ]; then
	echo "A \$TAG variable is required with the new supervisor version"
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
sed -i "s/SUPERVISOR_TAG.*/SUPERVISOR_TAG ?= \"${TAG}\"/g" meta-resin-common/recipes-containers/resin-supervisor/resin-supervisor.inc

echo "Commiting and pushing"
git add meta-resin-common/recipes-containers/resin-supervisor/resin-supervisor.inc
git commit -s -F- <<EOF
balena-supervisor: Update to ${TAG}

Changelog-entry: Update balena-supervisor to ${TAG}
Change-type: ${CHANGE_TYPE}
EOF

git push -u origin "supervisor-$TAG"

echo "Cleaning up"
rm -rf /tmp/meta-balena
