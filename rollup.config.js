import babel from 'rollup-plugin-babel';
import cli from 'rollup-plugin-cli';

export default {
	entry: 'src/main.js',
	format: 'cjs',
	plugins: [ babel(), cli() ],
	dest: 'dist/bin/registries.js'
}
