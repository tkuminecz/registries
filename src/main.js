import { getConfigFile, saveConfigFile } from './lib';
import inquirer from 'inquirer';
import yargs from 'yargs';

import addCmd from './cmd/add';
import listCmd from './cmd/list';
import switchCmd from './cmd/switch';

const OFFICIAL = Symbol('official'),
	OFFICIAL_REGISTRY = 'http://registry.npmjs.org';

const COMMAND_MAP = {
	add: addCmd,
	list: listCmd,
	ls: listCmd,
	switch: switchCmd
};

const argv = yargs.argv,
	plainArgs = argv._,
	cmd = plainArgs.shift() || 'list';

function handleMissingConfig() {
	inquirer.prompt([{
		type: 'confirm',
		name: 'doInit',
		message: 'No .registries.npm.json file found. Initialize?'
	}])
		.then(({ doInit }) => {
			if (!doInit) {
				return;
			}

			process.stdout.write('∆ initializing config...');

			return saveConfigFile({})
				.tap(() => process.stdout.write('done\n'));
		});
}

function handleExistingConfig(config) {
	return COMMAND_MAP[cmd](argv, Object.assign(config, { official: OFFICIAL_REGISTRY }));
}



getConfigFile()
	.catch(() => handleMissingConfig())
	.then(config => handleExistingConfig(config))
	.catch(err => console.error(err));
