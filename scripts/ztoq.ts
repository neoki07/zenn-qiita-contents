import { readFileSync, writeFileSync } from 'fs'
import yargs from 'yargs'
import { zennMarkdownToQiitaMarkdown } from './lib'

const argv = yargs
  .command(
    '* <inputPath> [outputPath]',
    'convert Zenn markdown to Qiita markdown',
  )
  .positional('inputPath', {
    describe: 'Zenn markdown filepath to convert',
    type: 'string',
    demandOption: true,
  })
  .positional('outputPath', {
    describe: 'Filepath to output Qiita markdown',
    type: 'string',
    demandOption: false,
  })
  .help()
  .alias('help', 'h')
  .parseSync()

const { inputPath, outputPath } = argv

function main() {
  try {
    const inputContent = readFileSync(inputPath, 'utf8')
    const outputContent = zennMarkdownToQiitaMarkdown(inputContent, outputPath)

    if (outputPath) {
      writeFileSync(outputPath, outputContent, 'utf8')
      console.log(`Output written to ${outputPath}`)
    } else {
      console.log(outputContent)
    }
  } catch (err) {
    console.error('Error processing:', err)
  }
}

main()
