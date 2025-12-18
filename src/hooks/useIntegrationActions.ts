import { useCallback } from 'react'
import { type CommitResult, type GitHubFileResponse, type WeChatDraftResult } from '@/types/integration'

interface IntegrationActionsOptions {
  getMarkdown: () => string
  getPreviewHtml?: () => string | undefined
}

export function useIntegrationActions({ getMarkdown, getPreviewHtml }: IntegrationActionsOptions) {
  const loadFromGitHub = useCallback(async (path: string): Promise<GitHubFileResponse> => {
    const res = await fetch(`/api/github/file?path=${encodeURIComponent(path)}`, { method: 'GET' })
    if (!res.ok) {
      throw new Error('Failed to load file from GitHub')
    }
    return res.json()
  }, [])

  const commitEditorMarkdown = useCallback(async (options: { path: string; sha?: string; message?: string; branch?: string }): Promise<CommitResult> => {
    const content = getMarkdown()
    const res = await fetch('/api/github/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...options, content, expectedSha: options.sha })
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message || 'Commit failed')
    }
    return res.json()
  }, [getMarkdown])

  const importWeChatMarkdown = useCallback(async (markdown: string, title?: string, commitMessage?: string): Promise<CommitResult> => {
    const res = await fetch('/api/wechat/import-to-github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown, title, commitMessage })
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message || 'Import failed')
    }
    return res.json()
  }, [])

  const savePreviewAsDraft = useCallback(async (title?: string): Promise<WeChatDraftResult> => {
    const html = getPreviewHtml?.()
    if (!html) {
      throw new Error('Preview HTML is empty')
    }

    const res = await fetch('/api/wechat/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html, title })
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message || 'Save draft failed')
    }
    return res.json()
  }, [getPreviewHtml])

  return {
    loadFromGitHub,
    commitEditorMarkdown,
    importWeChatMarkdown,
    savePreviewAsDraft
  }
}
