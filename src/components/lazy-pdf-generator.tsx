'use client'

import { lazy, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'

// Lazy load dos componentes pesados
const html2canvas = lazy(() => import('html2canvas'))
const jsPDF = lazy(() => import('jspdf'))

interface LazyPDFGeneratorProps {
  elementRef: React.RefObject<HTMLElement>
  fileName: string
  isLoading: boolean
  onLoadingChange: (loading: boolean) => void
  loadingStep?: string
  isMobile?: boolean
}

// Component de fallback para loading
function PDFLoadingFallback() {
  return (
    <Button disabled className="bg-gray-400">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      Carregando...
    </Button>
  )
}

async function generatePDFOptimized(
  element: HTMLElement,
  fileName: string,
  onStep: (step: string) => void,
  isMobile = false
): Promise<void> {
  onStep('Preparando bibliotecas...')
  
  // Import dinâmico das bibliotecas
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf')
  ])

  onStep('Preparando conteúdo...')
  await new Promise(resolve => setTimeout(resolve, 100))

  // Configurações otimizadas
  const options = {
    scale: isMobile ? 0.8 : 1.5,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 10000,
    removeContainer: true,
    foreignObjectRendering: false,
    width: element.offsetWidth,
    height: element.offsetHeight,
    scrollX: 0,
    scrollY: 0
  }

  onStep('Capturando conteúdo...')
  const canvas = await html2canvas(element, options)

  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error('Falha ao capturar conteúdo')
  }

  onStep('Gerando PDF...')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  })

  const imgData = canvas.toDataURL('image/jpeg', 0.85)
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pdfWidth - 20
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let yPosition = 10
  let remainingHeight = imgHeight

  pdf.addImage(imgData, 'JPEG', 10, yPosition, imgWidth, imgHeight)
  remainingHeight -= (pdfHeight - 20)

  while (remainingHeight > 0) {
    pdf.addPage()
    yPosition = -(imgHeight - remainingHeight) + 10
    pdf.addImage(imgData, 'JPEG', 10, yPosition, imgWidth, imgHeight)
    remainingHeight -= (pdfHeight - 20)
  }

  onStep('Salvando arquivo...')
  
  try {
    pdf.save(fileName)
  } catch (saveError) {
    // Fallback para download
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

export function LazyPDFGenerator({
  elementRef,
  fileName,
  isLoading,
  onLoadingChange,
  loadingStep = 'Processando...',
  isMobile = false
}: LazyPDFGeneratorProps) {
  
  const handleGeneratePDF = async () => {
    if (!elementRef.current || isLoading) return

    onLoadingChange(true)
    
    try {
      await generatePDFOptimized(
        elementRef.current,
        fileName,
        (step) => {
          // O step será exibido pelo componente pai
        },
        isMobile
      )
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      
      let message = 'Erro ao gerar PDF. '
      if (error instanceof Error) {
        if (error.message.includes('Canvas') || error.message.includes('capturar')) {
          message += 'Tente rolar para o topo e tente novamente.'
        } else {
          message += error.message
        }
      }
      alert(message)
    } finally {
      onLoadingChange(false)
    }
  }

  return (
    <Suspense fallback={<PDFLoadingFallback />}>
      <Button 
        onClick={handleGeneratePDF}
        disabled={isLoading}
        variant={isMobile ? "default" : "outline"}
        className={isMobile 
          ? "bg-blue-600 hover:bg-blue-700" 
          : "border-blue-600 text-blue-600 hover:bg-blue-50"
        }
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {loadingStep}
          </>
        ) : (
          <>
            {isMobile ? (
              <Download className="h-4 w-4 mr-2" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Salvar PDF
          </>
        )}
      </Button>
    </Suspense>
  )
}