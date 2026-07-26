import { initLayout, escapeHtml } from '../shared/layout.js'

initLayout()

const FALLBACK_URL = 'https://github.com/wuwafly3/bigeye/issues/new'

const form = document.getElementById('submit-form')
const typeEl = document.getElementById('f-type')
const moduleEl = document.getElementById('f-module')
const titleEl = document.getElementById('f-title')
const contentEl = document.getElementById('f-content')
const contactEl = document.getElementById('f-contact')
const websiteEl = document.getElementById('f-website')
const submitBtn = document.getElementById('f-submit')
const statusEl = document.getElementById('f-status')
const countEl = document.getElementById('f-count')

contentEl.addEventListener('input', () => {
  countEl.textContent = contentEl.value.length
})

function setStatus(kind, html) {
  statusEl.className = 'form-status' + (kind ? ' form-status-' + kind : '')
  statusEl.innerHTML = html
}

form.addEventListener('submit', async e => {
  e.preventDefault()

  const title = titleEl.value.trim()
  const content = contentEl.value.trim()
  if (!title || !content) {
    setStatus('error', '标题与内容为必填项。')
    ;(title ? contentEl : titleEl).focus()
    return
  }

  submitBtn.disabled = true
  setStatus('', '正在提交…')

  try {
    const resp = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: typeEl.value,
        module: moduleEl.value,
        title,
        content,
        contact: contactEl.value.trim(),
        website: websiteEl.value
      })
    })
    const data = await resp.json().catch(() => ({}))

    if (resp.ok && data.ok) {
      form.reset()
      countEl.textContent = '0'
      setStatus('ok', data.url
        ? `已提交，感谢补充！可在 <a href="${escapeHtml(data.url)}" target="_blank" rel="noopener">这里</a> 跟踪处理进度。`
        : '已提交，感谢补充！')
      return
    }

    if (resp.status === 429) {
      setStatus('error', '提交太频繁了，请一小时后再试。')
    } else if (resp.status === 503) {
      setStatus('error', `站点尚未配置投稿接口。可以直接到 GitHub <a href="${FALLBACK_URL}" target="_blank" rel="noopener">提交 Issue</a>。`)
    } else {
      setStatus('error', `提交失败，请稍后重试；或直接到 GitHub <a href="${FALLBACK_URL}" target="_blank" rel="noopener">提交 Issue</a>。`)
    }
  } catch (err) {
    setStatus('error', `网络异常，提交未送达。可以直接到 GitHub <a href="${FALLBACK_URL}" target="_blank" rel="noopener">提交 Issue</a>。`)
  } finally {
    submitBtn.disabled = false
  }
})
