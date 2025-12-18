import { NextResponse } from 'next/server'
import { buildWeChatMarkdownPath, commitMarkdownToGitHub, handleError } from '@/integrations/github'
import { type WeChatImportRequest } from '@/types/integration'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WeChatImportRequest
    if (!body?.markdown) {
      return NextResponse.json({ message: 'markdown is required' }, { status: 422 })
    }

    const path = buildWeChatMarkdownPath(body.title)
    const result = await commitMarkdownToGitHub({
      path,
      content: body.markdown,
      message: body.commitMessage || `Import WeChat: ${body.title || path}`,
      branch: body.branch
    })

    return NextResponse.json(result)
  } catch (error) {
    return handleError(error)
  }
}
