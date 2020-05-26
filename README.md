# Supervisor release utilities

## Scripts

* generate-announcement.js: Given two version strings, generate an announcement
	and changelog information for this release.
* deploy-to-api.js: Given a `$API_ENDPOINT`, `$API_TOKEN` and `$TAG` deploy the
	supervisor_release resources to the api.
* deploy-to-balenacloud.sh: Given a `$API_ENDPOINT`, `$API_TOKEN` and `$TAG` deploy the
	release to balenaCloud as an app. **Note:** this requires a token for the `balena_os` user

## Coming soon

* Automated meta-balena updates
* One-command releases
