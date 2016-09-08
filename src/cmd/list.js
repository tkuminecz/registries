import { bail, getCurrentRegistry, registryMatches } from '../lib';
import chalk from 'chalk';

function getMaxLen(strs) {
	let max = -Infinity;
	strs.forEach((str) => {
		if (str.length > max) {
			max = str.length;
		}
	});
	return max;
}

function pad(str, len, char = ' ') {
	let pad = '';
	while (str.length + pad.length < len) {
		pad = pad + char;
	}

	return pad;
}





export default function(opts, config) {
	const mergedConfig = Object.assign({}, config.default, config.custom);
	const keys = Object.keys(mergedConfig).sort();
	if (keys.length === 0) {
		bail(chalk.yellow(`No registries found.\n`));
	}

	return getCurrentRegistry()
		.then((currentRegistry) => {
			const nameMaxLen = getMaxLen(Object.keys(mergedConfig));

			Object.keys(config.default).forEach((registryName) => {
				const registryUrl = mergedConfig[registryName],
					match = registryMatches(currentRegistry, registryUrl) ? chalk.blue('* ') : '  ';

				process.stdout.write(match + chalk.underline.cyan(registryName) + pad(registryName, nameMaxLen) + chalk.dim.white(`   ${ registryUrl }\n`));
			});

			Object.keys(config.custom).forEach((registryName) => {
				const registryUrl = mergedConfig[registryName],
					match = registryMatches(currentRegistry, registryUrl) ? chalk.blue('* ') : '  ';

				process.stdout.write(match + chalk.cyan(registryName) + pad(registryName, nameMaxLen) + chalk.dim.white(`   ${ registryUrl }\n`));
			});
		});
}
