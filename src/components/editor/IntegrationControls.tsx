"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Github, Link2, Upload, FileSymlink, CheckCircle2 } from 'lucide-react'

interface IntegrationControlsProps {
  githubPath?: string
  githubSha?: string
  lastCommitSha?: string
  wechatDraftId?: string
  busyAction?: string | null
  onLoadFromGitHub: () => void
  onCommitToGitHub: () => void
  onImportWeChatMarkdown: () => void
  onSaveDraft: () => void
}

export function IntegrationControls({
  githubPath,
  githubSha,
  lastCommitSha,
  wechatDraftId,
  busyAction,
  onLoadFromGitHub,
  onCommitToGitHub,
  onImportWeChatMarkdown,
  onSaveDraft
}: IntegrationControlsProps) {
  return (
    <div className="border-b bg-muted/40 p-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Github className="h-4 w-4" />
          <span className="font-medium text-foreground">集成管道</span>
        </div>
        {githubPath && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Link2 className="h-3 w-3" />
            {githubPath}
          </Badge>
        )}
        {githubSha && (
          <Badge variant="outline" className="flex items-center gap-1">
            <FileSymlink className="h-3 w-3" />
            sha: {githubSha.slice(0, 7)}
          </Badge>
        )}
        {lastCommitSha && (
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            commit: {lastCommitSha.slice(0, 7)}
          </Badge>
        )}
        {wechatDraftId && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Upload className="h-3 w-3 text-emerald-600" />
            draft: {wechatDraftId}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onLoadFromGitHub}
          disabled={busyAction === 'load'}
        >
          读取 GitHub
        </Button>
        <Button
          size="sm"
          onClick={onCommitToGitHub}
          disabled={busyAction === 'commit'}
        >
          Commit to GitHub
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onImportWeChatMarkdown}
          disabled={busyAction === 'import'}
        >
          微信导入并提交
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onSaveDraft}
          disabled={busyAction === 'draft'}
        >
          保存为微信草稿
        </Button>
      </div>
    </div>
  )
}
