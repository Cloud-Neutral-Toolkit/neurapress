import { NextResponse } from 'next/server'
import { fetchMarkdownFile, handleError } from '@/integrations/github'
import { type GitHubFileRequest } from '@/types/integration'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const owner = searchParams.get('owner') || undefined
    const repo = searchParams.get('repo') || undefined
    const ref = searchParams.get('ref') || undefined

    if (!path) {
      return NextResponse.json({ message: 'path is required' }, { status: 422 })
    }

    const payload: GitHubFileRequest = { path, owner, repo, ref }
    const data = await fetchMarkdownFile(payload)
    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}
