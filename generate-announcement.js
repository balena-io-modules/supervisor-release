#!/usr/bin/env node
const request = require('request');
const { stripIndent } = require('common-tags');

const usage = () => {
	return `
Usage:
	generate-announcement.js new-version old-version
	`;
};

const changelogAddress =
	'https://raw.githubusercontent.com/balena-io/balena-supervisor/master/CHANGELOG.md';

if (process.argv.length < 4) {
	console.log(usage());
	process.exit(1);
}

newVersion = process.argv[2].trim();
oldVersion = process.argv[3].trim();

let log;
if (process.env.DEBUG) {
	log = console.log;
} else {
	log = () => {};
}

(async () => {
	log('Requesting supervisor changelog');

	const changelog = await new Promise((resolve, reject) => {
		request(changelogAddress, (err, response, body) => {
			if (err) reject(err);
			resolve(body);
		});
	});

	let oldIdx = null;
	let newIdx = null;
	const lines = changelog.split('\n');
	lines.map((l, idx) => {
		const match = l.match(/## (v?\d+.\d+.\d+)/);
		if (match) {
			if (!match[1].startsWith('v')) {
				match[1] = 'v' + match[1];
			}
			if (match[1] === oldVersion) {
				oldIdx = idx;
			} else if (match[1] === newVersion) {
				newIdx = idx;
			}
		}
	});

	if (oldIdx == null) {
		console.log('Could not find version:', oldVersion);
		process.exit(1);
	}
	if (newIdx == null) {
		console.log('Could not find version:', newVersion);
		process.exit(1);
	}

	if (newIdx > oldIdx) {
		let tmp = oldIdx;
		oldIdx = newIdx;
		newIdx = tmp;
		tmp = oldVersion;
		oldVersion = newVersion;
		newVersion = tmp;
	}

	const changelogSlice = lines.slice(newIdx, oldIdx - 1).join('\n\t');
	log('Got changelog slice');

	console.log(
		`@team releasing supervisor version ${newVersion} (from ${oldVersion}) to the balena api as supervisor_release. #supervisor #release-notes

Notable:

Changelog:

	${changelogSlice}
	`,
	);
})();
