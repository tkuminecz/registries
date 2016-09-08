import chalk from 'chalk';
import inquirer from 'inquirer';
import { getCurrentRegistry, registryUrlToName, setRegistry } from '../lib';

export default function(opts, config) {

	return getCurrentRegistry()
		.then((currentRegistryUrl) => {
			const currentRegistryName = registryUrlToName(config, currentRegistryUrl);
			return inquirer.prompt([{
				type: 'list',
				name: 'registryName',
				message: 'Switch to which registry?',
				default: currentRegistryName,
				choices: Object.keys(config)
			}])
			.then(({ registryName }) => {
				const registryUrl = config[registryName];
				process.stdout.write(chalk.blue('∆ ') + chalk.cyan(`setting registry to ${ registryUrl }...`));
				return setRegistry(registryUrl)
					.tap(() => process.stdout.write(chalk.cyan('done\n')));
			});
		});
}
