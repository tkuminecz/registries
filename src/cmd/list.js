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
	while (str.length < len) {
		str = str + char;
	}

	return str;
}


export default function(opts, config) {
	const keys = Object.keys(config).sort();
	if (keys.length === 0) {
		bail(chalk.yellow(`No registries found.\n`));
	}

	return getCurrentRegistry()
		.then((currentRegistry) => {
			const nameMaxLen = getMaxLen(keys);

			keys.forEach((registryName) => {
				const registryUrl = config[registryName],
					match = registryMatches(currentRegistry, registryUrl) ? chalk.blue('* ') : '  ';

				process.stdout.write(match + chalk.cyan(pad(registryName, nameMaxLen)) + chalk.dim.white(`  ${ registryUrl }\n`));
			});
		});
}
