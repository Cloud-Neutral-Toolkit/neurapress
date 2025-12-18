import { NextResponse } from 'next/server'
import { saveHtmlAsDraft } from '@/integrations/wechat'
import { handleError } from '@/integrations/github'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { html?: string; title?: string }
    if (!body?.html) {
      return NextResponse.json({ message: 'html is required' }, { status: 422 })
    }

    const result = await saveHtmlAsDraft(body.html, body.title)
    return NextResponse.json(result)
  } catch (error) {
    return handleError(error)
  }
}
