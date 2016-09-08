import chalk from 'chalk';
import childProcess from 'child_process';
import jsonFile from 'jsonfile';
import Promise from 'bluebird';

export const OFFICIAL_NAME = 'npm';
export const OFFICIAL_REGISTRY = 'http://registry.npmjs.org';

export function getConfigFile() {
	return Promise.fromCallback(cb => jsonFile.readFile(`${ process.env.HOME }/.registries.npm.json`, cb));
}

export function saveConfigFile(data) {
	return Promise.fromCallback(cb => jsonFile.writeFile(`${ process.env.HOME }/.registries.npm.json`, data, { spaces: 2 }, cb));
}

export function getCurrentRegistry() {
	return Promise.fromCallback(cb => childProcess.exec('npm get registry', cb));
}

export function setRegistry(registryUrl) {
	return Promise.fromCallback(cb => childProcess.exec(`npm set registry ${ registryUrl }`, cb));
}

export function registryMatches(current, toCheck) {
	return current.indexOf(toCheck) !== -1;
}

export function registryUrlToName(config, url) {
	return Object.keys(config)
		.filter(name => registryMatches(url, config[name]))
		.shift();
}

export function logInfo(...msgs) {
	msgs.forEach(msg => process.stdout.write(msg));
}

export function logError(...msgs) {
	msgs.forEach(msg => process.stderr.write(msg));
}

export function bail(...msgs) {
	logError(chalk.bold.red('fatal: '), ...msgs);
	process.exit(1);
}
