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

  // Configurações para ocupar página toda
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 8
  const lineHeight = 3.8
  let yPosition = margin

  // Formatação de data
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  // Adicionar logo no canto superior esquerdo (comentado temporariamente para evitar erros)
  // A logo será adicionada futuramente quando implementarmos carregamento seguro de imagens
  // try {
  //   const logoUrl = '/PREFEITURA.png'
  //   pdf.addImage(logoUrl, 'PNG', margin, yPosition, 18, 18)
  // } catch (error) {
  //   console.log('Logo não encontrada, continuando sem ela')
  // }
  
  // Placeholder visual para logo
  pdf.setDrawColor(200)
  pdf.setLineWidth(0.5)
  pdf.rect(margin, yPosition, 18, 18)

  // Cabeçalho ajustado com logo
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.text('PREFEITURA MUNICIPAL DE FREITAS', pageWidth/2, yPosition + 4, { align: 'center' })
  
  pdf.setFontSize(12)
  pdf.text('SECRETARIA DE EDUCAÇÃO E CULTURA', pageWidth/2, yPosition + 9, { align: 'center' })
  
  pdf.setFontSize(11)
  pdf.text('Núcleo de Apoio Disciplinar Escolar - NADE', pageWidth/2, yPosition + 14, { align: 'center' })
  
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text('RELATÓRIO DE ATENDIMENTO', pageWidth/2, yPosition + 19, { align: 'center' })
  
  yPosition += 25

  // Linha horizontal mais espessa
  pdf.setLineWidth(0.5)
  pdf.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 6

  // Caixa de informações básicas
  pdf.setDrawColor(0)
  pdf.setLineWidth(0.3)
  pdf.rect(margin, yPosition, pageWidth - 2*margin, 18)
  
  // Informações básicas em linha dentro da caixa
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text('LOCAL:', margin + 2, yPosition + 4)
  pdf.setFont('helvetica', 'normal')
  pdf.text(occurrence.location || '', margin + 18, yPosition + 4)
  
  pdf.setFont('helvetica', 'bold')
  pdf.text('DATA:', margin + 2, yPosition + 9)
  pdf.setFont('helvetica', 'normal')
  pdf.text(formatDate(occurrence.date), margin + 18, yPosition + 9)

  pdf.setFont('helvetica', 'bold')
  pdf.text('HORA:', margin + 2, yPosition + 14)
  pdf.setFont('helvetica', 'normal')
  pdf.text(occurrence.time || '', margin + 18, yPosition + 14)

  // Estudante info no lado direito da caixa
  if (occurrence.student?.name) {
    pdf.setFont('helvetica', 'bold')
    pdf.text('ESTUDANTE:', pageWidth/2 + 5, yPosition + 4)
    pdf.setFont('helvetica', 'normal')
    pdf.text(occurrence.student.name, pageWidth/2 + 25, yPosition + 4)
    
    if (occurrence.student.class) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('TURMA:', pageWidth/2 + 5, yPosition + 9)
      pdf.setFont('helvetica', 'normal')
      pdf.text(occurrence.student.class, pageWidth/2 + 25, yPosition + 9)
    }
    
    if (occurrence.student.enrollmentNumber) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('MATRÍCULA:', pageWidth/2 + 5, yPosition + 14)
      pdf.setFont('helvetica', 'normal')
      pdf.text(occurrence.student.enrollmentNumber, pageWidth/2 + 25, yPosition + 14)
    }
  }
  
  yPosition += 22

  // Solicitante com caixa
  pdf.rect(margin, yPosition, pageWidth - 2*margin, 12)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text('SOLICITANTE(S):', margin + 2, yPosition + 4)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  const solicitanteText = occurrence.solicitante || ''
  if (solicitanteText.length > 0) {
    const lines = pdf.splitTextToSize(solicitanteText, pageWidth - 2*margin - 40)
    pdf.text(lines, margin + 35, yPosition + 4)
  }
  yPosition += 15

  // Envolvidos com caixa
  pdf.rect(margin, yPosition, pageWidth - 2*margin, 12)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text('ENVOLVIDO(S):', margin + 2, yPosition + 4)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  const envolvidos = occurrence.envolvidos?.filter(e => e.trim()).join(', ') || ''
  if (envolvidos.length > 0) {
    const lines = pdf.splitTextToSize(envolvidos, pageWidth - 2*margin - 35)
    pdf.text(lines, margin + 30, yPosition + 4)
  }
  yPosition += 15

  // Motivos com caixa grande
  const motivosHeight = 45
  pdf.rect(margin, yPosition, pageWidth - 2*margin, motivosHeight)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text('MOTIVO(S):', margin + 2, yPosition + 5)
  
  const motivos = [
    'Indisciplina', 'Bullying', 'Palestra', 'Uso de fato', 'Porte de drogas',
    'Porte de objeto que causa perigo', 'Dano', 'Transporte escolar',
    'Reunião pedagógica', 'Uso da internet para discriminar ou medo/ameaças',
    'Ameaça', 'Aconselhamento', 'Treinamento', 'Lesão corporal',
    'Análise estrutural', 'Visita rotineira', 'Outro'
  ]

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  
  // Grid 3x6 dentro da caixa
  const colWidth = (pageWidth - 2*margin - 4) / 3
  const itemsPerRow = 3
  
  motivos.forEach((motivo, index) => {
    const row = Math.floor(index / itemsPerRow)
    const col = index % itemsPerRow
    const xPos = margin + 3 + (col * colWidth)
    const yPos = yPosition + 9 + (row * 6.5)
    
    const isChecked = occurrence.motivos?.includes(motivo) ? '☑' : '☐'
    
    // Truncar texto longo se necessário
    let displayText = motivo
    if (motivo.length > 32) {
      displayText = motivo.substring(0, 29) + '...'
    }
    
    pdf.text(`${isChecked} ${displayText}`, xPos, yPos)
  })
  
  yPosition += motivosHeight + 3

  // Ações com caixa
  const acoesHeight = 20
  pdf.rect(margin, yPosition, pageWidth - 2*margin, acoesHeight)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text('AÇÃO ADOTADA:', margin + 2, yPosition + 5)
  
  const acoes = ['Aconselhamento', 'Advertência', 'Suspensão', 'Transferência', 'Outro']
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  
  // 3 colunas para ações
  acoes.forEach((acao, index) => {
    const col = index % 3
    const row = Math.floor(index / 3)
    const xPos = margin + 3 + (col * ((pageWidth - 2*margin - 6) / 3))
    const yPos = yPosition + 10 + (row * 7)
    
    const isChecked = occurrence.acoes?.includes(acao) ? '☑' : '☐'
    pdf.text(`${isChecked} ${acao}`, xPos, yPos)
  })
  
  yPosition += acoesHeight + 3

  // Conclusão com caixa expandida
  const conclusaoHeight = 25
  pdf.rect(margin, yPosition, pageWidth - 2*margin, conclusaoHeight)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text('CONCLUSÃO:', margin + 2, yPosition + 5)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  const conclusaoText = occurrence.conclusao || ''
  if (conclusaoText.length > 0) {
    const lines = pdf.splitTextToSize(conclusaoText, pageWidth - 2*margin - 6)
    pdf.text(lines, margin + 3, yPosition + 10)
  }
  yPosition += conclusaoHeight + 3

  // Observações com caixa expandida
  const observacoesHeight = 25
  pdf.rect(margin, yPosition, pageWidth - 2*margin, observacoesHeight)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text('OBSERVAÇÕES:', margin + 2, yPosition + 5)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  const observacoesText = occurrence.observacoes || ''
  if (observacoesText.length > 0) {
    const lines = pdf.splitTextToSize(observacoesText, pageWidth - 2*margin - 6)
    pdf.text(lines, margin + 3, yPosition + 10)
  }
  yPosition += observacoesHeight + 3

  // Assinaturas na parte inferior com caixas
  const remainingSpace = pageHeight - margin - yPosition
  if (remainingSpace > 20) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.text('ASSINATURAS:', margin, yPosition)
    yPosition += 5

    const signatures = ['Solicitante(s)', 'Envolvido(s)', 'Representante(s) NADE']
    const signatureWidth = (pageWidth - 2*margin - 4) / 3
    const signatureHeight = Math.min(remainingSpace - 5, 18)
    
    signatures.forEach((signature, index) => {
      const xPos = margin + (index * (signatureWidth + 2))
      
      // Caixa para assinatura
      pdf.rect(xPos, yPosition, signatureWidth, signatureHeight)
      
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.text(`${signature}:`, xPos + 2, yPosition + 5)
      
      // Data no final de cada caixa
      pdf.setFontSize(7)
      pdf.text('Data: ___/___/______', xPos + 2, yPosition + signatureHeight - 3)
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