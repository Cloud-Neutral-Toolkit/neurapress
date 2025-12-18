import { NextResponse } from 'next/server'
import { commitMarkdownToGitHub, handleError } from '@/integrations/github'
import { type CommitInput } from '@/types/integration'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CommitInput
    if (!body?.path || !body?.content) {
      return NextResponse.json({ message: 'path and content are required' }, { status: 422 })
    }

    const result = await commitMarkdownToGitHub(body)
    return NextResponse.json(result)
  } catch (error) {
    return handleError(error)
  }
}
