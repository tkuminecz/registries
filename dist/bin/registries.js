#!/usr/bin/env node
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var chalk = _interopDefault(require('chalk'));
var childProcess = _interopDefault(require('child_process'));
var jsonFile = _interopDefault(require('jsonfile'));
var Promise$1 = _interopDefault(require('bluebird'));
var lodash = require('lodash');
var util = _interopDefault(require('util'));
var yargs = _interopDefault(require('yargs'));
var inquirer = _interopDefault(require('inquirer'));

var OFFICIAL_NAME = 'npm';
var OFFICIAL_REGISTRY = 'http://registry.npmjs.org';

function getConfigFile() {
	return Promise$1.fromCallback(function (cb) {
		return jsonFile.readFile(process.env.HOME + '/.registries.npm.json', cb);
	});
}

function saveConfigFile(data) {
	return Promise$1.fromCallback(function (cb) {
		return jsonFile.writeFile(process.env.HOME + '/.registries.npm.json', data, { spaces: 2 }, cb);
	});
}

function getCurrentRegistry() {
	return Promise$1.fromCallback(function (cb) {
		return childProcess.exec('npm get registry', cb);
	});
}

function setRegistry(registryUrl) {
	return Promise$1.fromCallback(function (cb) {
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

function logInfo() {
	for (var _len = arguments.length, msgs = Array(_len), _key = 0; _key < _len; _key++) {
		msgs[_key] = arguments[_key];
	}

	msgs.forEach(function (msg) {
		return process.stdout.write(msg);
	});
}

function logError() {
	for (var _len2 = arguments.length, msgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
		msgs[_key2] = arguments[_key2];
	}

	msgs.forEach(function (msg) {
		return process.stderr.write(msg);
	});
}

function bail() {
	for (var _len3 = arguments.length, msgs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
		msgs[_key3] = arguments[_key3];
	}

	logError.apply(undefined, [chalk.bold.red('fatal: ')].concat(msgs));
	process.exit(1);
}

function addCmd (opts, config) {
	return inquirer.prompt([{
		type: 'input',
		name: 'registryName',
		message: 'registry name:'
	}, {
		type: 'input',
		name: 'registryUrl',
		message: 'registry url:'
	}]).then(function (_ref) {
		var registryName = _ref.registryName;
		var registryUrl = _ref.registryUrl;

		config.custom[registryName] = registryUrl;
		return saveConfigFile(config);
	});
}

function helpCmd (opts) {
  process.stdout.write("usage: " + opts.$0 + " <command> [<args>]\n\nCommands:\n          add    Add a registry\n         help    Display help information\n    list / ls    List available registries\n  remove / rm    Remove a registry\n use / switch    Switch active registry\n\n");
}

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

function initCmd (_ref) {
	var _ref$force = _ref.force;
	var force = _ref$force === undefined ? true : _ref$force;

	var doInit = void 0;

	return getConfigFile().catch(function () {
		if (!force) {
			doInit = inquirer.prompt([{
				type: 'confirm',
				name: 'doInit',
				message: 'no config file found. initialize?'
			}]);
		} else {
			doInit = Promise$1.resolve({ doInit: true });
		}

		return doInit.then(function (_ref2) {
			var doInit = _ref2.doInit;

			if (!doInit) {
				return;
			}

			return saveConfigFile({
				default: defineProperty({}, OFFICIAL_NAME, OFFICIAL_REGISTRY),
				custom: {}
			}).tap(function () {
				return logInfo('initialized registries config\n');
			});
		});
	}).then(function () {
		return bail('registries already initialized\n');
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

	var pad = '';
	while (str.length + pad.length < len) {
		pad = pad + char;
	}

	return pad;
}

function listCmd (opts, config) {
	var mergedConfig = Object.assign({}, config.default, config.custom);
	var keys = Object.keys(mergedConfig).sort();
	if (keys.length === 0) {
		bail(chalk.yellow('No registries found.\n'));
	}

	return getCurrentRegistry().then(function (currentRegistry) {
		var nameMaxLen = getMaxLen(Object.keys(mergedConfig));

		Object.keys(config.default).forEach(function (registryName) {
			var registryUrl = mergedConfig[registryName],
			    match = registryMatches(currentRegistry, registryUrl) ? chalk.blue('* ') : '  ';

			process.stdout.write(match + chalk.underline.cyan(registryName) + pad(registryName, nameMaxLen) + chalk.dim.white('   ' + registryUrl + '\n'));
		});

		Object.keys(config.custom).forEach(function (registryName) {
			var registryUrl = mergedConfig[registryName],
			    match = registryMatches(currentRegistry, registryUrl) ? chalk.blue('* ') : '  ';

			process.stdout.write(match + chalk.cyan(registryName) + pad(registryName, nameMaxLen) + chalk.dim.white('   ' + registryUrl + '\n'));
		});
	});
}

function promptDelete(message, config, currentRegistryName) {
	var choices = lodash.map(lodash.toPairs(config), function (_ref) {
		var _ref2 = slicedToArray(_ref, 2);

		var name = _ref2[0];
		var value = _ref2[1];

		return {
			name: (name === currentRegistryName ? name + '*' : name) + chalk.dim(' ' + value),
			value: value
		};
	});

	return inquirer.prompt([{
		type: 'list',
		name: 'registryToDelete',
		message: message,
		choices: choices
	}]).then(function (_ref3) {
		var registryToDelete = _ref3.registryToDelete;
		return registryToDelete;
	});
}

function removeCmd (opts, config) {
	if (Object.keys(config.custom).length === 0) {
		bail('no custom configs to delete\n');
	}

	var mergedConfig = Object.assign({}, config.custom);
	return getCurrentRegistry().then(function (currentRegistryUrl) {
		var currentRegistryName = registryUrlToName(mergedConfig, currentRegistryUrl);

		return function keepPrompting(msg) {
			return promptDelete(msg, mergedConfig, currentRegistryName).then(function (registryToDeleteUrl) {
				var registryToDelete = registryUrlToName(mergedConfig, registryToDeleteUrl);

				if (registryToDelete === currentRegistryName) {
					return keepPrompting('cannot delete active registry. choose again:');
				}

				return registryToDelete;
			});
		}('delete which registry?');
	}).then(function (registryToDelete) {
		var newConfig = _extends({}, config);

		delete newConfig.custom[registryToDelete];

		return saveConfigFile(newConfig).tap(function () {
			return logInfo('deleted registry ' + registryToDelete + '\n');
		});
	});
}

function switchCmd (opts, config) {
	var mergedConfig = Object.assign({}, config.default, config.custom);

	return getCurrentRegistry().then(function (currentRegistryUrl) {

		var currentRegistryName = registryUrlToName(mergedConfig, currentRegistryUrl);

		// switch registries non-interactively
		if (opts._.length > 0) {
			var regName = opts._.shift();
			if (currentRegistryName === regName) {
				logInfo(chalk.blue('already using registry ' + regName + '\n'));
				return;
			} else {
				if (!lodash.has(mergedConfig, regName)) {
					bail('registry ' + regName + ' not found\n');
				}

				var registryUrl = mergedConfig[regName];
				logInfo(chalk.blue('setting registry to ' + regName + ' ' + chalk.dim('(' + registryUrl + ')') + '...'));
				return setRegistry(registryUrl).tap(function () {
					return logInfo(chalk.blue('done\n'));
				});
			}
		}

		var activeIndex = -1;

		var pairs = lodash.toPairs(mergedConfig),
		    choices = lodash.map(pairs, function (_ref, i) {
			var _ref2 = slicedToArray(_ref, 2);

			var name = _ref2[0];
			var value = _ref2[1];

			var isActive = name === currentRegistryName;

			if (isActive) {
				activeIndex = i;
			}

			return {
				name: (isActive ? name + '*' : name) + chalk.dim(' (' + value + ')'),
				value: { name: name, url: value }
			};
		});

		return inquirer.prompt([{
			type: 'list',
			name: 'registry',
			message: 'use which registry?',
			default: activeIndex,
			choices: choices
		}]).then(function (_ref3) {
			var registry = _ref3.registry;

			logInfo('setting registry to ' + registry.name + ' ' + chalk.dim('(' + registry.url + ')...'));
			return setRegistry(registry.url).tap(function () {
				return process.stdout.write('done\n');
			});
		});
	});
}

var COMMAND_MAP = {
	add: addCmd,
	help: helpCmd,
	init: initCmd,
	list: listCmd,
	ls: listCmd,
	del: removeCmd,
	rm: removeCmd,
	remove: removeCmd,
	use: switchCmd,
	switch: switchCmd
};
var argv = yargs.argv;
var plainArgs = argv._;
var cmd = plainArgs.shift() || 'help';
// start app
getConfigFile().catch(function () {
	if (cmd === 'init') {
		return;
	}

	return initCmd(Object.assign(argv, { force: false })).then(function () {
		return process.exit();
	});
}).then(function (config) {
	var cmdFn = COMMAND_MAP[cmd];
	if (!lodash.isFunction(cmdFn)) {
		cmdFn = helpCmd;
	}
	return cmdFn(argv, config);
}).catch(function (err) {
	return bail(util.inspect(err), '\n');
});