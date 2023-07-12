import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { resolve } from "path";
import yargs from "yargs";
import matter from "gray-matter";
import yaml from "js-yaml";
import GitUrlParse from "git-url-parse";

const argv = yargs
  .command("* <in> [out]", "convert Zenn markdown to Qiita markdown")
  .positional("in", {
    describe: "Zenn markdown file to convert",
    type: "string",
    demandOption: true,
  })
  .positional("out", {
    describe: "File path to output Qiita markdown",
    type: "string",
    demandOption: false,
  })
  .help()
  .alias("help", "h")
  .parseSync();

const inputFile = resolve(argv.in);

function convertFrontmatter(inputData: string): string {
  let { data, content } = matter(inputData);

  // Remove unnecessary fields
  delete data.emoji;
  delete data.type;

  // Convert published to private (reversed)
  data.private = !data.published;
  delete data.published;

  // Convert topics to tags
  data.tags = data.topics;
  delete data.topics;

  // Add new fields
  if (argv.out && existsSync(argv.out)) {
    let existingData = matter(readFileSync(argv.out, "utf8")).data;
    data.updated_at = existingData.updated_at || null;
    data.id = existingData.id || null;
    data.organization_url_name = existingData.organization_url_name || null;
  } else {
    data.updated_at = null;
    data.id = null;
    data.organization_url_name = null;
  }

  let frontmatter = yaml.dump(data);
  return `---\n${frontmatter}---\n${content}`;
}

function getCurrentBranch() {
  return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
}

function getRemoteUrl() {
  return execSync("git config --get remote.origin.url").toString().trim();
}

function getRepoInfo() {
  const gitInfo = GitUrlParse(getRemoteUrl());
  return {
    owner: gitInfo.owner,
    repo: gitInfo.name,
    branch: getCurrentBranch(),
  };
}

function replaceImagePaths(content: string): string {
  const { owner, repo, branch } = getRepoInfo();
  const githubRawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;

  // Replace local image paths with remote GitHub URLs
  return content.replace(/!\[\]\((\/.*?)\)/g, `![](${githubRawUrl}$1)`);
}

function replaceMessageToNote(content: string): string {
  return content.replace(/:::message/g, ":::note");
}

function main() {
  try {
    const inputData = readFileSync(inputFile, "utf8");

    let outputData = convertFrontmatter(inputData);
    outputData = replaceImagePaths(outputData);
    outputData = replaceMessageToNote(outputData);

    if (argv.out) {
      const outputFile = resolve(argv.out);
      writeFileSync(outputFile, outputData, "utf8");
      console.log(`Output written to ${outputFile}`);
    } else {
      console.log(outputData);
    }
  } catch (err) {
    console.error("Error processing file:", err);
  }
}

main();
