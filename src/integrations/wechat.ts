import { type IntegrationError, type WeChatDraftResult } from '@/types/integration'

const WECHAT_API = 'https://api.weixin.qq.com/cgi-bin/draft'

function getWeChatToken() {
  const token = process.env.WECHAT_ACCESS_TOKEN
  if (!token) {
    const error: IntegrationError = new Error('Missing WeChat access token')
    error.status = 500
    error.code = 'WECHAT_TOKEN_MISSING'
    throw error
  }
  return token
}

function normalizeHtml(html: string) {
  return html.trim()
}

export function buildDraftPayload(html: string, title?: string) {
  const normalized = normalizeHtml(html)
  return {
    articles: [
      {
        title: title || 'NeuraPress Draft',
        author: 'NeuraPress',
        content: normalized,
        need_open_comment: 0,
        only_fans_can_comment: 0
      }
    ]
  }
}

export async function saveHtmlAsDraft(html: string, title?: string): Promise<WeChatDraftResult> {
  const token = getWeChatToken()
  const payload = buildDraftPayload(html, title)
  const response = await fetch(`${WECHAT_API}/add?access_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await response.json()
  if (!response.ok || data.errcode) {
    const error: IntegrationError = new Error(data.errmsg || 'Failed to save draft')
    error.status = response.status
    error.code = data.errcode
    throw error
  }

  return { mediaId: data.media_id }
}
