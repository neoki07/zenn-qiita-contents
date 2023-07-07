import { readFileSync} from 'fs';
import { resolve } from 'path';
import yargs from 'yargs';

const argv = yargs
  .command('* <in>', 'convert Zenn markdown to Qiita markdown')
  .positional('in', {
    describe: 'Zenn markdown file to convert',
    type: 'string',
    demandOption: true,
  })
  .option('out', {
    alias: 'o',
    type: 'string',
    description: 'Output file path',
  })
  .help()
  .alias('help', 'h')
  .parseSync();

const inputFile = resolve(argv.in);

function replaceMessageToNote(content: string): string {
  return content.replace(/:::message/g, ':::note');
};

function ztoq() {
  try {
    let inputData = readFileSync(inputFile, 'utf8');
    console.log(replaceMessageToNote(inputData))
  } catch (err) {
    console.error('Error processing file:', err);
  }
};

ztoq();
