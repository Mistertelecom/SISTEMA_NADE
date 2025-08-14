'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

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

  const handlePrint = async () => {
    if (!printRef.current) return

    // Criar nova janela para impressão
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>

      <div ref={printRef} className="print-container bg-white border border-gray-300 p-6">
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
  )
}