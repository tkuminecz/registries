export default function(opts) {
	process.stdout.write(
		`usage: ${ opts.$0 } <command> [<args>]

Commands:
          add    Add a registry
         help    Display help information
    list / ls    List available registries
  remove / rm    Remove a registry
 use / switch    Switch active registry

`);
}
