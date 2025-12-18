import { NextResponse } from 'next/server'
import { type CommitInput, type CommitResult, type GitHubFileRequest, type GitHubFileResponse, type IntegrationError } from '@/types/integration'

const DEFAULT_BRANCH = process.env.GITHUB_DEFAULT_BRANCH || 'main'
const OWNER = process.env.GITHUB_OWNER
const REPO = process.env.GITHUB_REPO

function getGitHubToken() {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    const error: IntegrationError = new Error('Missing GitHub token')
    error.status = 500
    error.code = 'GITHUB_TOKEN_MISSING'
    throw error
  }
  return token
}

function ensureRepoConfig(owner?: string, repo?: string) {
  const resolvedOwner = owner || OWNER
  const resolvedRepo = repo || REPO
  if (!resolvedOwner || !resolvedRepo) {
    const error: IntegrationError = new Error('Missing GitHub repo config')
    error.status = 500
    error.code = 'GITHUB_REPO_MISSING'
    throw error
  }
  return { owner: resolvedOwner, repo: resolvedRepo }
}

function buildHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json'
  }
}

async function fetchGitHub<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const error: IntegrationError = new Error(body.message || 'GitHub request failed')
    error.status = response.status
    error.code = body.message
    throw error
  }
  return response.json() as Promise<T>
}

export async function fetchMarkdownFile({ owner, repo, path, ref }: GitHubFileRequest): Promise<GitHubFileResponse> {
  const token = getGitHubToken()
  const { owner: resolvedOwner, repo: resolvedRepo } = ensureRepoConfig(owner, repo)
  const url = `https://api.github.com/repos/${resolvedOwner}/${resolvedRepo}/contents/${encodeURIComponent(path)}${ref ? `?ref=${ref}` : ''}`

  const data = await fetchGitHub<{ content: string; sha: string; path: string; encoding: string; name: string; }> (url, {
    headers: buildHeaders(token)
  })

  if (data.encoding !== 'base64') {
    const error: IntegrationError = new Error('Unsupported encoding')
    error.status = 422
    throw error
  }

  const buffer = Buffer.from(data.content, 'base64')
  return {
    content: buffer.toString('utf-8'),
    sha: data.sha,
    path: data.path,
    branch: ref || DEFAULT_BRANCH
  }
}

export async function commitMarkdownToGitHub({ path, content, message, branch, expectedSha }: CommitInput): Promise<CommitResult> {
  const token = getGitHubToken()
  const { owner, repo } = ensureRepoConfig()
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`

  const headers = buildHeaders(token)
  let latestSha: string | undefined = expectedSha

  // Always fetch latest sha to support optimistic locking and file creation
  try {
    const current = await fetchGitHub<{ sha: string }>(`${apiUrl}${branch ? `?ref=${branch}` : ''}`, {
      headers
    })
    latestSha = current.sha
  } catch (error: unknown) {
    const err = error as IntegrationError
    if (err.status === 404) {
      latestSha = undefined
    } else if (err.status === 401 || err.status === 403) {
      throw err
    }
  }

  if (expectedSha && latestSha && expectedSha !== latestSha) {
    const conflict: IntegrationError = new Error('GitHub sha conflict')
    conflict.status = 409
    conflict.code = 'SHA_MISMATCH'
    throw conflict
  }

  const body = {
    message: message || `Update ${path}`,
    content: Buffer.from(content).toString('base64'),
    sha: latestSha,
    branch: branch || DEFAULT_BRANCH
  }

  const result = await fetchGitHub<{ commit: { sha: string }; content: { sha: string; path: string } }>(apiUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body)
  })

  return {
    commitSha: result.commit.sha,
    fileSha: result.content.sha,
    path: result.content.path
  }
}

export function handleError(error: unknown) {
  const err = error as IntegrationError
  const status = err.status || 500
  const message = err.message || 'Unknown error'
  return NextResponse.json({ message, code: err.code }, { status })
}

export function buildWeChatMarkdownPath(title?: string) {
  const now = new Date()
  const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`
  const normalizedTitle = title?.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '') || 'wechat-article'
  return `${datePath}/${normalizedTitle}.md`
}
