import yargs = require('yargs');
import { translateFile } from '../lib';
import { PythonVisitor } from '../lib/python';
import { IdentityVisitor } from '../lib/visitor';

async function main() {
  const argv = yargs
    .usage('$0 <file>')
    .option('python', { alias: 'p', })
    .help()
    .version(require('../package.json').version)
    .argv;

  const file = argv._[0];

  let visitor;
  if (argv.python) { visitor = new PythonVisitor(); }
  if (!visitor) { visitor = new IdentityVisitor(); }
  const tree = translateFile(file, visitor);
  console.log(tree.toString());
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});