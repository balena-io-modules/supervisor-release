# Supervisor release utilities

## Scripts

* generate-announcement.js: Given two version strings, generate an announcement
	and changelog information for this release.
* deploy-to-balenacloud.sh: Given a `$API_ENDPOINT`, `$API_TOKEN` and `$TAG` deploy the
	release to balenaCloud as an app. **Note:** this requires a token for the `balena_os` user

```sh
for ARCH in aarch64 amd64 rpi i386 armv7hf; do BALENARC_BALENA_URL=balena-staging.com TAG=v12.2.11 ARCH=$ARCH ./deploy-to-balenacloud.sh; done
```

## Coming soon

* Automated meta-balena updates
* One-command releases
