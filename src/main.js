import { bail, getConfigFile } from './lib';
import { isFunction } from 'lodash';
import util from 'util';
import yargs from 'yargs';

import addCmd from './cmd/add';
import helpCmd from './cmd/help';
import initCmd from './cmd/init';
import listCmd from './cmd/list';
import removeCmd from './cmd/remove';
import switchCmd from './cmd/switch';

const COMMAND_MAP = {
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
	},
	argv = yargs.argv,
	plainArgs = argv._,
	cmd = plainArgs.shift() || 'help';

// start app
getConfigFile()
	.catch(() => {
		if (cmd === 'init') {
			return;
		}

		return initCmd(Object.assign(argv, { force: false }))
			.then(() => process.exit());
	})
	.then((config) => {
		let cmdFn = COMMAND_MAP[cmd];
		if (!isFunction(cmdFn)) {
			cmdFn = helpCmd;
		}
		return cmdFn(argv, config);
	})
	.catch(err => bail(util.inspect(err), '\n'));
