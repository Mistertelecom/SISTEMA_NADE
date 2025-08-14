import mongoose from 'mongoose'

export interface IOccurrence {
  _id: string
  student?: string | mongoose.Types.ObjectId | null
  type: string
  description?: string
  date: Date
  time: string
  location: string
  reportedBy: string | mongoose.Types.ObjectId
  severity: 'low' | 'medium' | 'high'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  
  // Campos específicos do formulário NADE
  solicitante: string
  envolvidos?: string[]
  motivos?: string[]
  acoes?: string[]
  conclusao?: string
  observacoes?: string
  
  // Campos legados
  actions?: string[]
  parentNotified?: boolean
  parentNotifiedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const occurrenceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: false, // Opcional para registros NADE
  },
  type: {
    type: String,
    required: [true, 'Tipo de ocorrência é obrigatório'],
    enum: [
      'Indisciplina',
      'Bullying', 
      'Palestra',
      'Uso de fato',
      'Porte de drogas',
      'Porte de objeto que causa perigo',
      'Dano',
      'Transporte escolar',
      'Reunião pedagógica', 
      'Uso da internet para discriminar',
      'Ameaça',
      'Aconselhamento',
      'Treinamento',
      'Lesão corporal',
      'Análise estrutural',
      'Visita rotineira',
      'Outros'
    ],
  },
  description: {
    type: String,
    required: false, // Opcional para registros NADE (pode usar conclusao)
    trim: true,
    default: '',
  },
  date: {
    type: Date,
    required: [true, 'Data é obrigatória'],
    default: Date.now,
  },
  time: {
    type: String,
    required: [true, 'Horário é obrigatório'],
  },
  location: {
    type: String,
    required: [true, 'Local é obrigatório'],
    trim: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Responsável pelo registro é obrigatório'],
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  },
  // Campos específicos do formulário NADE
  solicitante: {
    type: String,
    required: [true, 'Solicitante é obrigatório'],
    trim: true,
  },
  envolvidos: [{
    type: String,
    trim: true,
  }],
  motivos: [{
    type: String,
    enum: [
      'Indisciplina', 'Bullying', 'Palestra', 'Uso de fato', 'Porte de drogas',
      'Porte de objeto que causa perigo', 'Dano', 'Transporte escolar',
      'Reunião pedagógica', 'Uso da internet para discriminar ou medo/ameaças',
      'Ameaça', 'Aconselhamento', 'Treinamento', 'Lesão corporal',
      'Análise estrutural', 'Visita rotineira', 'Outro'
    ]
  }],
  acoes: [{
    type: String,
    enum: ['Aconselhamento', 'Advertência', 'Suspensão', 'Transferência', 'Outro']
  }],
  conclusao: {
    type: String,
    trim: true,
  },
  observacoes: {
    type: String,
    trim: true,
  },
  
  // Campos legados
  actions: [{
    type: String,
    trim: true,
  }],
  parentNotified: {
    type: Boolean,
    default: false,
  },
  parentNotifiedAt: {
    type: Date,
  },
}, {
  timestamps: true,
})

export default mongoose.models.Occurrence || mongoose.model('Occurrence', occurrenceSchema)