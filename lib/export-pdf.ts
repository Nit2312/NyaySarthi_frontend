import jsPDF from 'jspdf'

export type PdfMessage = { role: 'user' | 'ai'; content: string; created_at?: string }

export function downloadChatPDF(title: string, messages: PdfMessage[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 36 // 0.5 inch
  const marginY = 48 // top/bottom
  const contentWidth = pageWidth - marginX * 2
  let y = marginY

  const addPageIfNeeded = (advance: number) => {
    if (y + advance > pageHeight - marginY) {
      doc.addPage()
      y = marginY
    }
  }

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  const titleText = title || 'Chat'
  const titleWidth = doc.getTextWidth(titleText)
  doc.text(titleText, marginX + (contentWidth - titleWidth) / 2, y)
  y += 24

  doc.setDrawColor(200)
  doc.line(marginX, y, pageWidth - marginX, y)
  y += 18

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)

  messages.forEach((m) => {
    const role = m.role.toUpperCase()
    const roleBg = m.role === 'user' ? [235, 242, 255] : [242, 242, 242]
    const text = m.content || ''

    // Role badge
    addPageIfNeeded(22)
    doc.setFillColor(roleBg[0], roleBg[1], roleBg[2])
    doc.roundedRect(marginX, y - 14, 64, 20, 4, 4, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(50)
    doc.text(role, marginX + 8, y)

    // Message text (wrapped)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(20)
    const wrapped = doc.splitTextToSize(text, contentWidth)
    const needed = wrapped.length * 16 + 8
    addPageIfNeeded(needed)
    doc.text(wrapped, marginX, y + 18)
    y += needed

    // Spacing between messages
    y += 8
  })

  doc.save(`${(title || 'chat').replace(/\s+/g, '_')}.pdf`)
}
