import inquirer from 'inquirer';
import { bail, OFFICIAL_NAME, getConfigFile, logInfo, OFFICIAL_REGISTRY, saveConfigFile } from '../lib';
import Promise from 'bluebird';

export default function({ force = true }) {
	let doInit;

	return getConfigFile()
		.catch(() => {
			if (!force) {
				doInit = inquirer.prompt([{
					type: 'confirm',
					name: 'doInit',
					message: 'no config file found. initialize?'
				}]);
			}
			else {
				doInit = Promise.resolve({ doInit: true });
			}

			return doInit.then(({ doInit }) => {
				if (!doInit) {
					return;
				}

				return saveConfigFile({
					default: {
						[OFFICIAL_NAME]: OFFICIAL_REGISTRY
					},
					custom: {}
				})
					.tap(() => logInfo('initialized registries config\n'));
			});
		})
		.then(() => bail('registries already initialized\n'));
}
