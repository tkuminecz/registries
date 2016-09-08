import inquirer from 'inquirer';
import { saveConfigFile } from '../lib';

export default function(opts, config) {
	return inquirer.prompt([
		{
			type: 'input',
			name: 'registryName',
			message: 'Registry name:'
		},
		{
			type: 'input',
			name: 'registryUrl',
			message: 'Registry URL:'
		}
	])
	.then(({ registryName, registryUrl }) => {
		config[registryName] = registryUrl;
		return saveConfigFile(config);
	});
}
