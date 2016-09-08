import chalk from 'chalk';
import inquirer from 'inquirer';
import { map, toPairs } from 'lodash';
import { bail, getCurrentRegistry, logInfo, registryUrlToName, saveConfigFile } from '../lib';

function promptDelete(message, config, currentRegistryName) {
	const choices = map( toPairs(config), ([ name, value ]) => {
		return {
			name: ((name === currentRegistryName) ? `${ name }*` : name) + chalk.dim(` ${ value }`),
			value
		};
	});

	return inquirer.prompt([{
		type: 'list',
		name: 'registryToDelete',
		message,
		choices
	}])
		.then(({ registryToDelete }) => registryToDelete);
}

export default function(opts, config) {
	if (Object.keys(config.custom).length === 0) {
		bail('no custom configs to delete\n');
	}

	const mergedConfig = Object.assign({}, config.custom);
	return getCurrentRegistry()
		.then((currentRegistryUrl) => {
			const currentRegistryName = registryUrlToName(mergedConfig, currentRegistryUrl);

			return (function keepPrompting(msg) {
				return promptDelete(msg, mergedConfig, currentRegistryName)
					.then((registryToDeleteUrl) => {
						const registryToDelete = registryUrlToName(mergedConfig, registryToDeleteUrl);

						if (registryToDelete === currentRegistryName) {
							return keepPrompting('cannot delete active registry. choose again:');
						}

						return registryToDelete;
					});
			})('delete which registry?');
		})
		.then((registryToDelete) => {
			const newConfig = { ...config };

			delete newConfig.custom[registryToDelete];

			return saveConfigFile(newConfig)
				.tap(() => logInfo(`deleted registry ${ registryToDelete }\n`));
		});
}
