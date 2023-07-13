import { execSync } from 'child_process'
import GitUrlParse from 'git-url-parse'

interface RepoInfo {
  owner: string
  repo: string
  branch: string
}

function getCurrentBranch() {
  return execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
}

function getRemoteUrl() {
  return execSync('git config --get remote.origin.url').toString().trim()
}

function getRepoInfo(): RepoInfo {
  const gitInfo = GitUrlParse(getRemoteUrl())
  return {
    owner: gitInfo.owner,
    repo: gitInfo.name,
    branch: getCurrentBranch(),
  }
}

export function replaceImagePaths(inputContent: string): string {
  const { owner, repo, branch } = getRepoInfo()
  const githubRawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`

  // Replace local image paths with remote GitHub URLs
  return inputContent.replace(/!\[\]\((\/.*?)\)/g, `![](${githubRawUrl}$1)`)
}
