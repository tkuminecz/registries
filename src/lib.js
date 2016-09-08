import childProcess from 'child_process';
import jsonFile from 'jsonfile';
import Promise from 'bluebird';

function bail(...msgs) {
	process.stderr.write(...msgs);
	process.exit();
}

function getConfigFile() {
	return Promise.fromCallback(cb => jsonFile.readFile(`${ process.env.HOME }/.registries.npm.json`, cb));
}

function saveConfigFile(data) {
	return Promise.fromCallback(cb => jsonFile.writeFile(`${ process.env.HOME }/.registries.npm.json`, data, { spaces: 2 }, cb));
}

function getCurrentRegistry() {
	return Promise.fromCallback(cb => childProcess.exec('npm get registry', cb));
}

function setRegistry(registryUrl) {
	return Promise.fromCallback(cb => childProcess.exec(`npm set registry ${ registryUrl }`, cb));
}

function registryMatches(current, toCheck) {
	return current.indexOf(toCheck) !== -1;
}

function registryUrlToName(config, url) {
	return Object.keys(config)
		.filter(name => registryMatches(url, config[name]))
		.shift();
}

export { bail, getConfigFile, getCurrentRegistry, registryMatches, registryUrlToName, saveConfigFile, setRegistry };
