export function replaceMessageToNote(inputContent: string): string {
  return inputContent.replace(/:::message/g, ":::note");
}
