import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Loading component
function LoadingComponent() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  )
}

// Lazy load componentes pesados
export const LazyOccurrencePrint = dynamic(
  () => import('./occurrence-print').then(mod => ({ default: mod.OccurrencePrint })),
  { 
    loading: LoadingComponent,
    ssr: false // Desabilitar SSR para componentes que usam DOM APIs
  }
)

export const LazyOccurrenceForm = dynamic(
  () => import('./occurrence-form'),
  { loading: LoadingComponent }
)

export const LazyStudentForm = dynamic(
  () => import('./student-form'),
  { loading: LoadingComponent }
)

export const LazyUserFormModal = dynamic(
  () => import('./user-form-modal'),
  { loading: LoadingComponent }
)

export const LazyPasswordChangeModal = dynamic(
  () => import('./password-change-modal'),
  { loading: LoadingComponent }
)

export const LazyDeleteUserModal = dynamic(
  () => import('./delete-user-modal'),
  { loading: LoadingComponent }
)

// Loading específico para gráficos e charts
function ChartLoadingComponent() {
  return (
    <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
      <div className="text-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Carregando gráfico...</p>
      </div>
    </div>
  )
}

// Lazy load para componentes de gráficos (se houver)
export const LazyChart = dynamic(
  () => import('react-chartjs-2').then(mod => ({ default: mod.Chart })),
  { 
    loading: ChartLoadingComponent,
    ssr: false
  }
)

// Lazy load para reports pesados
export const LazyReportsTable = dynamic(
  () => import('./reports-table').catch(() => ({ default: () => <div>Componente não encontrado</div> })),
  { loading: LoadingComponent }
)