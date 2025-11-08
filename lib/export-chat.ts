export function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function toMarkdown(title: string, msgs: Array<{ role: string; content: string; created_at?: string }>) {
  const header = `# ${title || 'Chat'}\n\n`
  const body = msgs
    .map((m) => `**${m.role.toUpperCase()}**\n\n${m.content}\n\n---\n`)
    .join('\n')
  return header + body
}

export function downloadMarkdown(filename: string, md: string) {
  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
