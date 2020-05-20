#!/usr/bin/env node
// Deploy a supervisor image as a supervisor_release in the balena API
//
// Environment variables:
// This program deploys for all device types, or only device types where the architecture matches $ARCH, if specified.
// It deploys to the API specified by $API_ENDPOINT and using a provided $API_TOKEN or $API_KEY
// (if both are set, API_TOKEN is preferred).
// The tag to deploy must be passed as $TAG.
//
const { PinejsClientRequest } = require('pinejs-client-request');
const Promise = require('bluebird');
const _ = require('lodash');
const url = require('url');

const apiEndpoint = process.env.API_ENDPOINT;
const apikey = process.env.API_KEY;
const arch = process.env.ARCH;
const tag = process.env.TAG;
const apiToken = process.env.API_TOKEN;

if (_.isEmpty(apikey) && _.isEmpty(apiToken)) {
	console.error('Skipping deploy due to empty API_KEY and API_TOKEN');
	process.exit(0);
}

if (_.isEmpty(apiEndpoint)) {
	console.error('Please set a valid $API_ENDPOINT');
	process.exit(1);
}

if (_.isEmpty(tag)) {
	console.error('Please set a $TAG to deploy');
	process.exit(1);
}

const supportedArchitectures = ['amd64', 'rpi', 'aarch64', 'i386', 'armv7hf'];
if (!_.isEmpty(arch) && !_.includes(supportedArchitectures, arch)) {
	console.error('Invalid architecture ' + arch);
	process.exit(1);
}
const archs = _.isEmpty(arch) ? supportedArchitectures : [arch];

const requestOpts = {
	gzip: true,
	timeout: 30000,
};

if (!_.isEmpty(apiToken)) {
	requestOpts.headers = {
		Authorization: 'Bearer ' + apiToken,
	};
}

const apiEndpointWithPrefix = url.resolve(apiEndpoint, '/v5/');
const balenaApi = new PinejsClientRequest({
	apiPrefix: apiEndpointWithPrefix,
	passthrough: requestOpts,
});

balenaApi
	._request(
		_.extend(
			{
				url: apiEndpoint + '/config/device-types',
				method: 'GET',
			},
			balenaApi.passthrough,
		),
	)
	.then((deviceTypes) => {
		// This is a critical step so we better do it serially
		return Promise.mapSeries(deviceTypes, (deviceType) => {
			if (archs.indexOf(deviceType.arch) >= 0) {
				const options = {};
				let arch = deviceType.arch;
				if (_.isEmpty(apiToken)) {
					options.apikey = apikey;
				}
				console.log(`Deploying ${tag} for ${deviceType.slug}`);
				return balenaApi.post({
					resource: 'supervisor_release',
					body: {
						image_name: `balena/${arch}-supervisor`,
						supervisor_version: tag,
						device_type: deviceType.slug,
						is_public: true,
					},
					options,
				});
			}
		});
	})
	.then(() => {
		process.exit(0);
	})
	.catch((err) => {
		console.error(
			`Error when deploying the supervisor to ${apiEndpoint}`,
			err,
			err.stack,
		);
		process.exit(1);
	});
