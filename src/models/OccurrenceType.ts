import mongoose from 'mongoose'

export interface IOccurrenceType {
  _id: string
  name: string
  description?: string
  severity: 'low' | 'medium' | 'high'
  color: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const occurrenceTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do tipo de ocorrência é obrigatório'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  color: {
    type: String,
    default: '#3B82F6',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

export default mongoose.models.OccurrenceType || mongoose.model('OccurrenceType', occurrenceTypeSchema)