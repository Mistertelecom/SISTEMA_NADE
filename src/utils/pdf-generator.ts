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

  // Configurações
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15
  const lineHeight = 6
  let yPosition = margin

  // Função para adicionar texto com quebra automática
  const addText = (text: string, x: number, fontSize: number = 10, maxWidth?: number) => {
    pdf.setFontSize(fontSize)
    if (maxWidth) {
      const lines = pdf.splitTextToSize(text, maxWidth)
      pdf.text(lines, x, yPosition)
      yPosition += lines.length * lineHeight
    } else {
      pdf.text(text, x, yPosition)
      yPosition += lineHeight
    }
  }

  // Função para adicionar nova página se necessário
  const checkNewPage = (additionalHeight: number = lineHeight) => {
    if (yPosition + additionalHeight > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
    }
  }

  // Cabeçalho
  pdf.setFont('helvetica', 'bold')
  addText('SECRETARIA DE EDUCAÇÃO E CULTURA', pageWidth/2 - 60, 14)
  addText('Núcleo de Apoio Disciplinar Escolar - NADE', pageWidth/2 - 70, 12)
  addText('Relatório de atendimento', pageWidth/2 - 35, 11)
  
  yPosition += 10

  // Linha horizontal
  pdf.setLineWidth(0.5)
  pdf.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  // Formatação de data
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  // Informações básicas
  pdf.setFont('helvetica', 'bold')
  addText('LOCAL:', margin, 10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(occurrence.location || '', margin + 15, yPosition - lineHeight)
  
  pdf.setFont('helvetica', 'bold')
  pdf.text('DATA:', pageWidth/2, yPosition - lineHeight)
  pdf.setFont('helvetica', 'normal')
  pdf.text(formatDate(occurrence.date), pageWidth/2 + 15, yPosition - lineHeight)

  pdf.setFont('helvetica', 'bold')
  pdf.text('HORA:', pageWidth - 60, yPosition - lineHeight)
  pdf.setFont('helvetica', 'normal')
  pdf.text(occurrence.time || '', pageWidth - 40, yPosition - lineHeight)
  
  yPosition += 5

  // Solicitante
  checkNewPage(20)
  pdf.setFont('helvetica', 'bold')
  addText('SOLICITANTE(S):', margin, 10)
  pdf.setFont('helvetica', 'normal')
  addText(occurrence.solicitante || '', margin, 9, pageWidth - 2*margin)
  yPosition += 5

  // Envolvidos
  checkNewPage(20)
  pdf.setFont('helvetica', 'bold')
  addText('ENVOLVIDO(S):', margin, 10)
  pdf.setFont('helvetica', 'normal')
  const envolvidos = occurrence.envolvidos?.filter(e => e.trim()).join(', ') || ''
  addText(envolvidos, margin, 9, pageWidth - 2*margin)
  yPosition += 5

  // Motivos
  checkNewPage(40)
  pdf.setFont('helvetica', 'bold')
  addText('MOTIVO(S):', margin, 10)
  
  const motivos = [
    'Indisciplina', 'Bullying', 'Palestra', 'Uso de fato', 'Porte de drogas',
    'Porte de objeto que causa perigo', 'Dano', 'Transporte escolar',
    'Reunião pedagógica', 'Uso da internet para discriminar ou medo/ameaças',
    'Ameaça', 'Aconselhamento', 'Treinamento', 'Lesão corporal',
    'Análise estrutural', 'Visita rotineira', 'Outro'
  ]

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  
  let xPos = margin
  const itemsPerRow = 3
  
  motivos.forEach((motivo, index) => {
    checkNewPage()
    const isChecked = occurrence.motivos?.includes(motivo) ? '[X]' : '[ ]'
    pdf.text(`${isChecked} ${motivo}`, xPos, yPosition)
    
    xPos += 60
    if ((index + 1) % itemsPerRow === 0) {
      yPosition += lineHeight
      xPos = margin
    }
  })
  
  if (motivos.length % itemsPerRow !== 0) {
    yPosition += lineHeight
  }
  yPosition += 5

  // Ações
  checkNewPage(30)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  addText('AÇÃO ADOTADA:', margin, 10)
  
  const acoes = ['Aconselhamento', 'Advertência', 'Suspensão', 'Transferência', 'Outro']
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  
  xPos = margin
  acoes.forEach((acao, index) => {
    const isChecked = occurrence.acoes?.includes(acao) ? '[X]' : '[ ]'
    pdf.text(`${isChecked} ${acao}`, xPos, yPosition)
    xPos += 70
    if ((index + 1) % 2 === 0) {
      yPosition += lineHeight
      xPos = margin
    }
  })
  
  if (acoes.length % 2 !== 0) {
    yPosition += lineHeight
  }
  yPosition += 10

  // Conclusão
  checkNewPage(30)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  addText('CONCLUSÃO:', margin, 10)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  addText(occurrence.conclusao || '', margin, 9, pageWidth - 2*margin)
  yPosition += 10

  // Observações
  checkNewPage(30)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  addText('OBSERVAÇÕES:', margin, 10)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  addText(occurrence.observacoes || '', margin, 9, pageWidth - 2*margin)
  yPosition += 15

  // Assinaturas
  checkNewPage(60)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  addText('ASSINATURAS:', margin, 10)
  yPosition += 10

  // Linhas de assinatura
  const signatures = ['Solicitante(s)', 'Envolvido(s)', 'Representante(s) NADE']
  
  signatures.forEach(signature => {
    checkNewPage(20)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    addText(`${signature}:`, margin, 9)
    yPosition += 5
    
    // Linha para assinatura
    pdf.setLineWidth(0.3)
    pdf.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 15
  })

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