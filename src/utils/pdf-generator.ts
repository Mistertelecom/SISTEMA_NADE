import jsPDF from 'jspdf'

interface IOccurrence {
  _id: string
  student?: {
    name: string
    class: string
    enrollmentNumber: string
  }
  type: string
  description: string
  date: string
  time: string
  location: string
  solicitante: string
  envolvidos: string[]
  motivos: string[]
  acoes: string[]
  conclusao: string
  observacoes: string
  reportedBy: {
    name: string
  }
  createdAt: string
}

export async function generateOccurrencePDF(occurrence: IOccurrence): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Configurações otimizadas para uma página
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  const lineHeight = 4
  let yPosition = margin

  // Formatação de data
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  // Cabeçalho compacto
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.text('SECRETARIA DE EDUCAÇÃO E CULTURA', pageWidth/2, yPosition, { align: 'center' })
  yPosition += 5
  
  pdf.setFontSize(10)
  pdf.text('Núcleo de Apoio Disciplinar Escolar - NADE', pageWidth/2, yPosition, { align: 'center' })
  yPosition += 4
  
  pdf.setFontSize(9)
  pdf.text('Relatório de atendimento', pageWidth/2, yPosition, { align: 'center' })
  yPosition += 8

  // Linha horizontal
  pdf.setLineWidth(0.3)
  pdf.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 5

  // Informações básicas em linha
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('LOCAL:', margin, yPosition)
  pdf.setFont('helvetica', 'normal')
  pdf.text(occurrence.location || '', margin + 15, yPosition)
  
  pdf.setFont('helvetica', 'bold')
  pdf.text('DATA:', pageWidth/3, yPosition)
  pdf.setFont('helvetica', 'normal')
  pdf.text(formatDate(occurrence.date), pageWidth/3 + 15, yPosition)

  pdf.setFont('helvetica', 'bold')
  pdf.text('HORA:', 2*pageWidth/3, yPosition)
  pdf.setFont('helvetica', 'normal')
  pdf.text(occurrence.time || '', 2*pageWidth/3 + 15, yPosition)
  
  yPosition += 8

  // Solicitante compacto
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('SOLICITANTE(S):', margin, yPosition)
  pdf.setFont('helvetica', 'normal')
  const solicitanteText = occurrence.solicitante || ''
  if (solicitanteText.length > 0) {
    const lines = pdf.splitTextToSize(solicitanteText, pageWidth - 2*margin - 35)
    pdf.text(lines, margin + 35, yPosition)
    yPosition += Math.min(lines.length * 4, 8) // Limitar altura
  } else {
    yPosition += 4
  }
  yPosition += 3

  // Envolvidos compacto
  pdf.setFont('helvetica', 'bold')
  pdf.text('ENVOLVIDO(S):', margin, yPosition)
  pdf.setFont('helvetica', 'normal')
  const envolvidos = occurrence.envolvidos?.filter(e => e.trim()).join(', ') || ''
  if (envolvidos.length > 0) {
    const lines = pdf.splitTextToSize(envolvidos, pageWidth - 2*margin - 35)
    pdf.text(lines, margin + 35, yPosition)
    yPosition += Math.min(lines.length * 4, 8) // Limitar altura
  } else {
    yPosition += 4
  }
  yPosition += 5

  // Motivos otimizados em grid compacto
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('MOTIVO(S):', margin, yPosition)
  yPosition += 5

  const motivos = [
    'Indisciplina', 'Bullying', 'Palestra', 'Uso de fato', 'Porte de drogas',
    'Porte de objeto que causa perigo', 'Dano', 'Transporte escolar',
    'Reunião pedagógica', 'Uso da internet para discriminar ou medo/ameaças',
    'Ameaça', 'Aconselhamento', 'Treinamento', 'Lesão corporal',
    'Análise estrutural', 'Visita rotineira', 'Outro'
  ]

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(6.5)
  
  // Grid 3x6 otimizado
  const colWidth = (pageWidth - 2*margin) / 3
  const itemsPerRow = 3
  const rowsPerSection = 6
  
  motivos.forEach((motivo, index) => {
    const row = Math.floor(index / itemsPerRow)
    const col = index % itemsPerRow
    const xPos = margin + (col * colWidth)
    const yPos = yPosition + (row * 3.5)
    
    const isChecked = occurrence.motivos?.includes(motivo) ? '[X]' : '[ ]'
    
    // Truncar texto longo se necessário
    let displayText = motivo
    if (motivo.length > 35) {
      displayText = motivo.substring(0, 32) + '...'
    }
    
    pdf.text(`${isChecked} ${displayText}`, xPos, yPos)
  })
  
  yPosition += rowsPerSection * 3.5 + 5

  // Ações compactas
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('AÇÃO ADOTADA:', margin, yPosition)
  yPosition += 4
  
  const acoes = ['Aconselhamento', 'Advertência', 'Suspensão', 'Transferência', 'Outro']
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  
  // 2 colunas para ações
  acoes.forEach((acao, index) => {
    const row = Math.floor(index / 2)
    const col = index % 2
    const xPos = margin + (col * (pageWidth - 2*margin) / 2)
    const yPos = yPosition + (row * 3.5)
    
    const isChecked = occurrence.acoes?.includes(acao) ? '[X]' : '[ ]'
    pdf.text(`${isChecked} ${acao}`, xPos, yPos)
  })
  
  yPosition += Math.ceil(acoes.length / 2) * 3.5 + 5

  // Conclusão compacta
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('CONCLUSÃO:', margin, yPosition)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  const conclusaoText = occurrence.conclusao || ''
  if (conclusaoText.length > 0) {
    const lines = pdf.splitTextToSize(conclusaoText, pageWidth - 2*margin)
    pdf.text(lines, margin, yPosition + 4)
    yPosition += Math.min(lines.length * 3.5, 14) + 4 // Limitar altura
  } else {
    yPosition += 4
  }
  yPosition += 5

  // Observações compactas
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('OBSERVAÇÕES:', margin, yPosition)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  const observacoesText = occurrence.observacoes || ''
  if (observacoesText.length > 0) {
    const lines = pdf.splitTextToSize(observacoesText, pageWidth - 2*margin)
    pdf.text(lines, margin, yPosition + 4)
    yPosition += Math.min(lines.length * 3.5, 14) + 4 // Limitar altura
  } else {
    yPosition += 4
  }
  yPosition += 8

  // Assinaturas compactas em linha
  const remainingSpace = pageHeight - margin - yPosition
  if (remainingSpace > 25) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.text('ASSINATURAS:', margin, yPosition)
    yPosition += 6

    const signatures = ['Solicitante(s)', 'Envolvido(s)', 'Representante(s) NADE']
    const signatureWidth = (pageWidth - 2*margin) / 3
    
    signatures.forEach((signature, index) => {
      const xPos = margin + (index * signatureWidth)
      
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(7)
      pdf.text(`${signature}:`, xPos, yPosition)
      
      // Linha para assinatura
      pdf.setLineWidth(0.2)
      pdf.line(xPos, yPosition + 8, xPos + signatureWidth - 5, yPosition + 8)
    })
  }

  // Gerar nome do arquivo
  const studentName = occurrence.student?.name?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Ocorrencia'
  const date = new Date().toISOString().split('T')[0]
  const fileName = `Relatorio_NADE_${studentName}_${date}.pdf`

  // Salvar PDF
  try {
    pdf.save(fileName)
  } catch {
    // Fallback: download como blob
    const pdfBlob = pdf.output('blob')
    const url = URL.createObjectURL(pdfBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateReportsPDF(occurrences: any[]): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15
  const lineHeight = 6
  let yPosition = margin

  const checkNewPage = (additionalHeight: number = lineHeight) => {
    if (yPosition + additionalHeight > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
    }
  }

  // Cabeçalho do relatório
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(16)
  pdf.text('RELATÓRIO GERAL DE OCORRÊNCIAS - NADE', pageWidth/2 - 70, yPosition)
  yPosition += 15

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, yPosition)
  yPosition += 10

  pdf.text(`Total de ocorrências: ${occurrences.length}`, margin, yPosition)
  yPosition += 15

  // Linha horizontal
  pdf.setLineWidth(0.5)
  pdf.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  // Listar ocorrências
  occurrences.forEach((occurrence, index) => {
    checkNewPage(40)
    
    // Cabeçalho da ocorrência
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text(`${index + 1}. ${occurrence.student?.name || 'Nome não informado'}`, margin, yPosition)
    yPosition += lineHeight

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    
    // Informações básicas
    const info = [
      `Turma: ${occurrence.student?.class || 'N/A'}`,
      `Tipo: ${occurrence.type || 'N/A'}`,
      `Data: ${new Date(occurrence.date).toLocaleDateString('pt-BR')}`,
      `Local: ${occurrence.location || 'N/A'}`
    ]

    info.forEach(item => {
      pdf.text(item, margin + 5, yPosition)
      yPosition += lineHeight
    })

    // Descrição
    if (occurrence.description) {
      pdf.text('Descrição:', margin + 5, yPosition)
      yPosition += lineHeight
      const lines = pdf.splitTextToSize(occurrence.description, pageWidth - 2*margin - 10)
      pdf.text(lines, margin + 10, yPosition)
      yPosition += lines.length * lineHeight
    }

    yPosition += 10
  })

  // Salvar
  const fileName = `Relatorio_Geral_NADE_${new Date().toISOString().split('T')[0]}.pdf`
  
  try {
    pdf.save(fileName)
  } catch {
    const pdfBlob = pdf.output('blob')
    const url = URL.createObjectURL(pdfBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}