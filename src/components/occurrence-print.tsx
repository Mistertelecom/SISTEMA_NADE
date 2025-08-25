'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Download, FileText } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { ErrorBoundary } from '@/components/error-boundary'

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

interface OccurrencePrintProps {
  occurrence: IOccurrence
}

export function OccurrencePrint({ occurrence }: OccurrencePrintProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')

  // Detectar se é mobile com cache
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === 'undefined') return false
      return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    
    setIsMobileDevice(checkMobile())
    
    const handleResize = () => {
      setIsMobileDevice(checkMobile())
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  const isMobile = () => isMobileDevice

  // Função otimizada para converter cores oklch/oklab para RGB
  const convertModernColorsToRGB = (element: HTMLElement) => {
    if (typeof window === 'undefined') return
    
    try {
      // Cache para conversões já feitas
      const colorCache = new Map<string, string>()
      
      // Função auxiliar para converter cor
      const convertColor = (colorValue: string): string => {
        if (colorCache.has(colorValue)) {
          return colorCache.get(colorValue)!
        }
        
        try {
          const canvas = document.createElement('canvas')
          canvas.width = 1
          canvas.height = 1
          const ctx = canvas.getContext('2d', { willReadFrequently: true })
          if (ctx) {
            ctx.fillStyle = colorValue
            const rgbColor = ctx.fillStyle
            colorCache.set(colorValue, rgbColor)
            return rgbColor
          }
        } catch (e) {
          // Fallback para cores conhecidas
          if (colorValue.includes('oklch')) {
            colorCache.set(colorValue, '#000000')
            return '#000000'
          }
        }
        
        colorCache.set(colorValue, colorValue)
        return colorValue
      }
      
      // Aplicar conversão apenas nos elementos que precisam
      const style = element.style
      const computedStyle = window.getComputedStyle(element)
      
      // Verificar apenas propriedades essenciais
      const essentialProps = ['color', 'backgroundColor', 'borderColor']
      
      essentialProps.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop)
        if (value && (value.includes('oklch') || value.includes('oklab'))) {
          const convertedColor = convertColor(value)
          style.setProperty(prop, convertedColor, 'important')
        }
      })
      
      // Para elementos filhos, usar uma abordagem mais eficiente
      const childElements = element.querySelectorAll('*')
      childElements.forEach((child) => {
        if (child instanceof HTMLElement) {
          const childStyle = window.getComputedStyle(child)
          essentialProps.forEach(prop => {
            const value = childStyle.getPropertyValue(prop)
            if (value && (value.includes('oklch') || value.includes('oklab'))) {
              const convertedColor = convertColor(value)
              child.style.setProperty(prop, convertedColor, 'important')
            }
          })
        }
      })
      
    } catch (error) {
      console.warn('Erro ao converter cores:', error)
      // Aplicar tema seguro como fallback
      element.style.setProperty('color', '#000000', 'important')
      element.style.setProperty('backgroundColor', '#ffffff', 'important')
    }
  }

  const generatePDF = async () => {
    if (!printRef.current) {
      alert('Erro: Conteúdo não encontrado para gerar PDF.')
      return
    }

    setIsGeneratingPDF(true)
    setLoadingStep('Inicializando...')
    
    try {
      const element = printRef.current
      
      // Aguardar estabilização do DOM
      await new Promise(resolve => setTimeout(resolve, 200))
      
      setLoadingStep('Preparando conteúdo...')
      
      // Converter cores apenas se necessário
      try {
        convertModernColorsToRGB(element)
      } catch (colorError) {
        console.warn('Aviso: problema na conversão de cores:', colorError)
        // Continuar sem parar o processo
      }
      
      // Configurações otimizadas para mobile e compatibilidade com cores
      const options = {
        scale: isMobile() ? 1 : 2, // Menor escala para mobile para evitar problemas de memória
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        foreignObjectRendering: false, // Desabilitar para evitar problemas com cores modernas
        ignoreElements: (element: Element) => {
          // Ignorar elementos com cores problemáticas
          try {
            const style = window.getComputedStyle(element)
            const bgColor = style.backgroundColor
            const color = style.color
            return Boolean((bgColor && (bgColor.includes('oklch') || bgColor.includes('oklab'))) ||
                   (color && (color.includes('oklch') || color.includes('oklab'))))
          } catch {
            return false
          }
        },
        width: element.offsetWidth || element.scrollWidth,
        height: element.offsetHeight || element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0
      }

      setLoadingStep('Preparando conteúdo...')
      console.log('Iniciando captura do canvas...')
      const canvas = await html2canvas(element, options)
      console.log('Canvas capturado com sucesso')
      setLoadingStep('Processando imagem...')

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas vazio ou inválido')
      }

      // Criar PDF com configurações específicas
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      })

      console.log('Convertendo canvas para imagem...')
      const imgData = canvas.toDataURL('image/jpeg', 0.8) // JPEG com qualidade 80% para reduzir tamanho
      
      if (!imgData || imgData.length < 100) {
        throw new Error('Falha ao converter canvas para imagem')
      }

      // Calcular dimensões para A4
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth - 20 // Margem de 10mm de cada lado
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      let yPosition = 10 // Margem superior
      let remainingHeight = imgHeight

      setLoadingStep('Criando PDF...')
      console.log('Adicionando imagem ao PDF...')
      
      // Primeira página
      pdf.addImage(imgData, 'JPEG', 10, yPosition, imgWidth, imgHeight)
      remainingHeight -= (pdfHeight - 20) // Descontar margens

      // Páginas adicionais se necessário
      while (remainingHeight > 0) {
        pdf.addPage()
        yPosition = -(imgHeight - remainingHeight) + 10
        pdf.addImage(imgData, 'JPEG', 10, yPosition, imgWidth, imgHeight)
        remainingHeight -= (pdfHeight - 20)
      }

      // Gerar nome do arquivo seguro
      const studentName = occurrence.student?.name?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Ocorrencia'
      const date = new Date().toISOString().split('T')[0]
      const fileName = `Relatorio_NADE_${studentName}_${date}.pdf`

      setLoadingStep('Salvando arquivo...')
      console.log('Salvando PDF:', fileName)
      
      // Tentar salvar o PDF
      try {
        pdf.save(fileName)
        console.log('PDF salvo com sucesso')
      } catch (saveError) {
        console.error('Erro ao salvar PDF:', saveError)
        // Fallback: tentar download como blob
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

    } catch (error) {
      console.error('Erro detalhado ao gerar PDF:', error)
      
      let errorMessage = 'Erro ao gerar PDF. '
      if (error instanceof Error) {
        if (error.message.includes('Canvas')) {
          errorMessage += 'Problema ao capturar o conteúdo. Tente rolar a página para cima e tente novamente.'
        } else if (error.message.includes('memory') || error.message.includes('Maximum call stack')) {
          errorMessage += 'Conteúdo muito grande. Tente reduzir o zoom da página.'
        } else {
          errorMessage += `Detalhes: ${error.message}`
        }
      } else {
        errorMessage += 'Erro desconhecido. Verifique sua conexão e tente novamente.'
      }
      
      alert(errorMessage)
    } finally {
      setIsGeneratingPDF(false)
      setLoadingStep('')
    }
  }

  const handlePrint = async () => {
    // Se for mobile, usar geração de PDF
    if (isMobile()) {
      await generatePDF()
      return
    }

    // Desktop: usar impressão tradicional
    if (!printRef.current) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = printRef.current.cloneNode(true) as HTMLElement
    
    // Estilo para impressão
    const printStyles = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          background: white;
          margin: 20px;
        }
        
        .print-container {
          width: 100%;
          max-width: 21cm;
          margin: 0 auto;
          background: white;
          border: 2px solid #000;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
        }
        
        .header h1 {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .header h2 {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .header h3 {
          font-size: 12px;
          margin-bottom: 0;
        }
        
        .form-row {
          display: flex;
          margin-bottom: 10px;
          min-height: 25px;
          border-bottom: 1px solid #000;
          align-items: flex-end;
        }
        
        .form-field {
          border-right: 1px solid #000;
          padding: 5px 8px;
          flex: 1;
        }
        
        .form-field:last-child {
          border-right: none;
        }
        
        .form-field.wide {
          flex: 2;
        }
        
        .form-field.narrow {
          flex: 0.8;
        }
        
        .field-label {
          font-weight: bold;
          font-size: 10px;
          display: block;
          margin-bottom: 2px;
        }
        
        .field-value {
          font-size: 11px;
          min-height: 15px;
        }
        
        .textarea-field {
          border-bottom: 1px solid #000;
          padding: 5px 8px;
          margin-bottom: 10px;
          min-height: 60px;
        }
        
        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 5px;
          margin-bottom: 10px;
          padding: 5px 8px;
          border-bottom: 1px solid #000;
        }
        
        .checkbox-item {
          display: flex;
          align-items: center;
          font-size: 10px;
        }
        
        .checkbox {
          width: 12px;
          height: 12px;
          border: 1px solid #000;
          margin-right: 5px;
          display: inline-block;
          text-align: center;
          line-height: 10px;
        }
        
        .checkbox.checked::after {
          content: '×';
          font-weight: bold;
        }
        
        .signatures {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #000;
        }
        
        .signature-line {
          margin-bottom: 20px;
        }
        
        .signature-title {
          font-weight: bold;
          font-size: 10px;
          margin-bottom: 5px;
        }
        
        .signature-space {
          border-bottom: 1px solid #000;
          height: 30px;
          margin-bottom: 5px;
        }
        
        @media print {
          body {
            margin: 0;
          }
          .print-container {
            border: none;
            box-shadow: none;
            margin: 0;
            padding: 0;
          }
        }
      </style>
    `

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório de Atendimento NADE</title>
          ${printStyles}
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `)

    printWindow.document.close()
    
    // Aguardar carregamento e imprimir
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const formatTime = (time: string) => {
    return time || ''
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex justify-end gap-2 flex-wrap">
          {/* Botão de Impressão (Desktop) ou PDF (Mobile) */}
          <Button 
            onClick={handlePrint} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {loadingStep || 'Processando...'}
              </>
            ) : isMobile() ? (
              <>
                <Download className="h-4 w-4 mr-2" />
                Salvar PDF
              </>
            ) : (
              <>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </>
            )}
          </Button>

          {/* Botão adicional para PDF no desktop */}
          {!isMobile() && (
            <Button 
              onClick={generatePDF} 
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  {loadingStep || 'Processando...'}
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Salvar PDF
                </>
              )}
            </Button>
          )}
        </div>

        <div 
          ref={printRef} 
          className="print-container bg-white border border-gray-300 p-6"
          style={{
            fontFamily: '"Times New Roman", serif',
            fontSize: '12px',
            lineHeight: '1.4',
            color: '#000',
            width: '100%',
            maxWidth: '21cm',
            margin: '0 auto'
          }}
        >
        {/* Cabeçalho */}
        <div className="header">
          <h1>SECRETARIA DE EDUCAÇÃO E CULTURA</h1>
          <h2>Núcleo de Apoio Disciplinar Escolar - NADE</h2>
          <h3>Relatório de atendimento</h3>
        </div>

        {/* Local, Data, Hora */}
        <div className="form-row">
          <div className="form-field wide">
            <span className="field-label">LOCAL:</span>
            <div className="field-value">{occurrence.location}</div>
          </div>
          <div className="form-field narrow">
            <span className="field-label">DATA:</span>
            <div className="field-value">{formatDate(occurrence.date)}</div>
          </div>
          <div className="form-field narrow">
            <span className="field-label">HORA:</span>
            <div className="field-value">{formatTime(occurrence.time)}</div>
          </div>
        </div>

        {/* Solicitante */}
        <div className="textarea-field">
          <span className="field-label">SOLICITANTE(S):</span>
          <div className="field-value">{occurrence.solicitante}</div>
        </div>

        {/* Envolvidos */}
        <div className="textarea-field">
          <span className="field-label">ENVOLVIDO(S):</span>
          <div className="field-value">
            {occurrence.envolvidos.filter(e => e.trim()).join(', ')}
          </div>
        </div>

        {/* Motivos */}
        <div>
          <div className="field-label" style={{padding: '5px 8px', borderBottom: '1px solid #000', marginBottom: '0'}}>
            MOTIVO(S):
          </div>
          <div className="checkbox-grid">
            {[
              'Indisciplina', 'Bullying', 'Palestra', 'Uso de fato', 'Porte de drogas',
              'Porte de objeto que causa perigo', 'Dano', 'Transporte escolar',
              'Reunião pedagógica', 'Uso da internet para discriminar ou medo/ameaças',
              'Ameaça', 'Aconselhamento', 'Treinamento', 'Lesão corporal',
              'Análise estrutural', 'Visita rotineira', 'Outro'
            ].map((motivo) => (
              <div key={motivo} className="checkbox-item">
                <span className={`checkbox ${occurrence.motivos.includes(motivo) ? 'checked' : ''}`}></span>
                <span>{motivo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ações */}
        <div>
          <div className="field-label" style={{padding: '5px 8px', borderBottom: '1px solid #000', marginBottom: '0'}}>
            AÇÃO ADOTADA:
          </div>
          <div className="checkbox-grid" style={{gridTemplateColumns: 'repeat(2, 1fr)'}}>
            {['Aconselhamento', 'Advertência', 'Suspensão', 'Transferência', 'Outro'].map((acao) => (
              <div key={acao} className="checkbox-item">
                <span className={`checkbox ${occurrence.acoes.includes(acao) ? 'checked' : ''}`}></span>
                <span>{acao}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conclusão */}
        <div className="textarea-field" style={{minHeight: '80px'}}>
          <span className="field-label">CONCLUSÃO:</span>
          <div className="field-value">{occurrence.conclusao}</div>
        </div>

        {/* Observações */}
        <div className="textarea-field" style={{minHeight: '80px'}}>
          <span className="field-label">OBSERVAÇÕES:</span>
          <div className="field-value">{occurrence.observacoes}</div>
        </div>

        {/* Assinaturas */}
        <div className="signatures">
          <div className="signature-line">
            <div className="signature-title">ASSINATURAS:</div>
            <br />
            <div className="signature-title">Solicitante(s):</div>
            <div className="signature-space"></div>
          </div>
          
          <div className="signature-line">
            <div className="signature-title">Envolvido(s):</div>
            <div className="signature-space"></div>
          </div>
          
          <div className="signature-line">
            <div className="signature-title">Representante(s) NADE:</div>
            <div className="signature-space"></div>
          </div>
        </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}