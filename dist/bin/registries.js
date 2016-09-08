#!/usr/bin/env node
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var childProcess = _interopDefault(require('child_process'));
var jsonFile = _interopDefault(require('jsonfile'));
var Promise = _interopDefault(require('bluebird'));
var inquirer = _interopDefault(require('inquirer'));
var yargs = _interopDefault(require('yargs'));
var chalk = _interopDefault(require('chalk'));

function bail() {
	var _process$stderr;

	(_process$stderr = process.stderr).write.apply(_process$stderr, arguments);
	process.exit();
}

function getConfigFile() {
	return Promise.fromCallback(function (cb) {
		return jsonFile.readFile(process.env.HOME + '/.registries.npm.json', cb);
	});
}

function saveConfigFile(data) {
	return Promise.fromCallback(function (cb) {
		return jsonFile.writeFile(process.env.HOME + '/.registries.npm.json', data, { spaces: 2 }, cb);
	});
}

function getCurrentRegistry() {
	return Promise.fromCallback(function (cb) {
		return childProcess.exec('npm get registry', cb);
	});
}

function setRegistry(registryUrl) {
	return Promise.fromCallback(function (cb) {
		return childProcess.exec('npm set registry ' + registryUrl, cb);
	});
}

function registryMatches(current, toCheck) {
	return current.indexOf(toCheck) !== -1;
}

function registryUrlToName(config, url) {
	return Object.keys(config).filter(function (name) {
		return registryMatches(url, config[name]);
	}).shift();
}

function addCmd (opts, config) {
	return inquirer.prompt([{
		type: 'input',
		name: 'registryName',
		message: 'Registry name:'
	}, {
		type: 'input',
		name: 'registryUrl',
		message: 'Registry URL:'
	}]).then(function (_ref) {
		var registryName = _ref.registryName;
		var registryUrl = _ref.registryUrl;

		config[registryName] = registryUrl;
		return saveConfigFile(config);
	});
}

function getMaxLen(strs) {
	var max = -Infinity;
	strs.forEach(function (str) {
		if (str.length > max) {
			max = str.length;
		}
	});
	return max;
}

function pad(str, len) {
	var char = arguments.length <= 2 || arguments[2] === undefined ? ' ' : arguments[2];

	while (str.length < len) {
		str = str + char;
	}

	return str;
}

function listCmd (opts, config) {
	var keys = Object.keys(config).sort();
	if (keys.length === 0) {
		bail(chalk.yellow('No registries found.\n'));
	}

	return getCurrentRegistry().then(function (currentRegistry) {
		var nameMaxLen = getMaxLen(keys);

		keys.forEach(function (registryName) {
			var registryUrl = config[registryName],
			    match = registryMatches(currentRegistry, registryUrl) ? chalk.blue('* ') : '  ';

			process.stdout.write(match + chalk.cyan(pad(registryName, nameMaxLen)) + chalk.dim.white('  ' + registryUrl + '\n'));
		});
	});
}

function switchCmd (opts, config) {

	return getCurrentRegistry().then(function (currentRegistryUrl) {
		var currentRegistryName = registryUrlToName(config, currentRegistryUrl);
		return inquirer.prompt([{
			type: 'list',
			name: 'registryName',
			message: 'Switch to which registry?',
			default: currentRegistryName,
			choices: Object.keys(config)
		}]).then(function (_ref) {
			var registryName = _ref.registryName;

			var registryUrl = config[registryName];
			process.stdout.write(chalk.blue('∆ ') + chalk.cyan('setting registry to ' + registryUrl + '...'));
			return setRegistry(registryUrl).tap(function () {
				return process.stdout.write(chalk.cyan('done\n'));
			});
		});
	});
}

var OFFICIAL_REGISTRY = 'http://registry.npmjs.org';
var COMMAND_MAP = {
	add: addCmd,
	list: listCmd,
	ls: listCmd,
	switch: switchCmd
};

var argv = yargs.argv;
var plainArgs = argv._;
var cmd = plainArgs.shift() || 'list';
function handleMissingConfig() {
	inquirer.prompt([{
		type: 'confirm',
		name: 'doInit',
		message: 'No .registries.npm.json file found. Initialize?'
	}]).then(function (_ref) {
		var doInit = _ref.doInit;

		if (!doInit) {
			return;
		}

		process.stdout.write('∆ initializing config...');

		return saveConfigFile({}).tap(function () {
			return process.stdout.write('done\n');
		});
	});
}

function handleExistingConfig(config) {
	return COMMAND_MAP[cmd](argv, Object.assign(config, { official: OFFICIAL_REGISTRY }));
}

getConfigFile().catch(function () {
	return handleMissingConfig();
}).then(function (config) {
	return handleExistingConfig(config);
}).catch(function (err) {
	return console.error(err);
});