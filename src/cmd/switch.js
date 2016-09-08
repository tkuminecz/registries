import chalk from 'chalk';
import inquirer from 'inquirer';
import { bail, getCurrentRegistry, logInfo, registryUrlToName, setRegistry } from '../lib';
import { has, map, toPairs } from 'lodash';

export default function(opts, config) {
	const mergedConfig = Object.assign({}, config.default, config.custom);

	return getCurrentRegistry()
		.then((currentRegistryUrl) => {

			const currentRegistryName = registryUrlToName(mergedConfig, currentRegistryUrl);

			// switch registries non-interactively
			if (opts._.length > 0) {
				const regName = opts._.shift();
				if (currentRegistryName === regName) {
					logInfo(chalk.blue(`already using registry ${ regName }\n`));
					return;
				}
				else {
					if (!has(mergedConfig, regName)) {
						bail(`registry ${ regName } not found\n`)
					}

					const registryUrl = mergedConfig[regName];
					logInfo(chalk.blue(`setting registry to ${ regName } ` + chalk.dim(`(${ registryUrl })`) + '...'));
					return setRegistry(registryUrl)
						.tap(() => logInfo(chalk.blue('done\n')));
				}
			}

			let activeIndex = -1;

			const pairs = toPairs(mergedConfig),
				choices = map(pairs, ([ name, value ], i) => {
					const isActive = (name === currentRegistryName);

					if (isActive) {
						activeIndex = i;
					}

					return {
						name: (isActive ? `${ name }*` : name) + chalk.dim(` (${ value })`),
						value: { name, url: value }
					};
				});

			return inquirer.prompt([{
				type: 'list',
				name: 'registry',
				message: 'use which registry?',
				default: activeIndex,
				choices
			}])
			.then(({ registry }) => {
				logInfo(`setting registry to ${ registry.name } ` + chalk.dim(`(${ registry.url })...`));
				return setRegistry(registry.url)
					.tap(() => process.stdout.write('done\n'));
			});
		});
}
