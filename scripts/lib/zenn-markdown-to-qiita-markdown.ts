import { convertFrontmatter } from './convert-frontmatter'
import { replaceImagePaths } from './replace-image-paths'
import { replaceMessageToNote } from './replace-message-to-note'

export function zennMarkdownToQiitaMarkdown(
  inputContent: string,
  outputPath?: string,
): string {
  const pipeline = [
    convertFrontmatter(outputPath),
    replaceImagePaths,
    replaceMessageToNote,
  ]

  let output = inputContent
  for (const fn of pipeline) {
    output = fn(output)
  }
  return output
}
