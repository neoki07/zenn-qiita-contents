import { readFileSync, statSync, writeFileSync } from 'fs'
import yargs from 'yargs'
import { zennMarkdownToQiitaMarkdown } from './lib'
import { basename, join } from 'path'

const { inputPath, outputPath } = yargs
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
    describe: 'Path to output Qiita markdown',
    type: 'string',
    demandOption: true,
  })
  .help()
  .alias('help', 'h')
  .parseSync()

function main() {
  try {
    const inputContent = readFileSync(inputPath, 'utf8')

    const isDirectory = statSync(outputPath).isDirectory()
    const outputFilepath = isDirectory
      ? join(outputPath, basename(inputPath))
      : outputPath

    const outputContent = zennMarkdownToQiitaMarkdown(
      inputContent,
      outputFilepath,
    )

    writeFileSync(outputFilepath, outputContent, 'utf8')

    console.log(`Output written to ${outputFilepath}`)
  } catch (err) {
    console.error('Error processing:', err)
  }
}

main()
