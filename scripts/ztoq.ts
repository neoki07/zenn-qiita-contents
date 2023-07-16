import { readFileSync, statSync, watchFile, writeFileSync } from 'fs'
import yargs from 'yargs'
import { zennMarkdownToQiitaMarkdown } from './lib'
import { basename, join } from 'path'

const { inputPath, outputPath, watch } = yargs
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
  .option('watch', {
    describe: 'Watch for changes in the input file',
    alias: 'w',
    type: 'boolean',
    default: false,
  })
  .help()
  .alias('help', 'h')
  .parseSync()

function convertAndWrite(inputPath: string, outputPath: string) {
  const inputContent = readFileSync(inputPath, 'utf8')
  const outputContent = zennMarkdownToQiitaMarkdown(inputContent, outputPath)
  writeFileSync(outputPath, outputContent, 'utf8')
}

function main() {
  try {
    const isDirectory = statSync(outputPath).isDirectory()
    const outputFilepath = isDirectory
      ? join(outputPath, basename(inputPath))
      : outputPath

    convertAndWrite(inputPath, outputFilepath)
    console.log(`Output written to ${outputFilepath}`)

    if (watch) {
      console.log('Watching for changes...')
      watchFile(inputPath, { persistent: true, interval: 1000 }, () => {
        console.log('Input file changed. Converting and writing output...')
        convertAndWrite(inputPath, outputFilepath)
        console.log(`Output written to ${outputFilepath}`)
      })
    }
  } catch (err) {
    console.error('Error processing:', err)
  }
}

main()
