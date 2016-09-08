import inquirer from 'inquirer';
import { saveConfigFile } from '../lib';

export default function(opts, config) {
	return inquirer.prompt([
		{
			type: 'input',
			name: 'registryName',
			message: 'registry name:'
		},
		{
			type: 'input',
			name: 'registryUrl',
			message: 'registry url:'
		}
	])
	.then(({ registryName, registryUrl }) => {
		config.custom[registryName] = registryUrl;
		return saveConfigFile(config);
	});
}
