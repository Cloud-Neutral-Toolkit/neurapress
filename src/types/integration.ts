export interface GitHubFileRequest {
  owner?: string
  repo?: string
  path: string
  ref?: string
}

export interface GitHubFileResponse {
  content: string
  sha: string
  path: string
  branch?: string
}

export interface CommitInput {
  path: string
  content: string
  message?: string
  branch?: string
  expectedSha?: string
}

export interface CommitResult {
  commitSha: string
  fileSha: string
  path: string
}

export interface WeChatDraftResult {
  mediaId: string
}

export interface WeChatImportRequest {
  markdown: string
  title?: string
  commitMessage?: string
  branch?: string
}

export interface IntegrationError extends Error {
  status?: number
  code?: string
}
