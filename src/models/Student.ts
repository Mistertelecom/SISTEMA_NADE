import mongoose from 'mongoose'

export interface IStudent {
  _id: string
  name: string
  class: string
  grade: string
  birthDate?: Date
  parentName?: string
  parentPhone?: string
  parentEmail?: string
  enrollmentNumber: string
  status: 'active' | 'inactive' | 'transferred'
  createdAt: Date
  updatedAt: Date
}

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do aluno é obrigatório'],
    trim: true,
  },
  class: {
    type: String,
    required: [true, 'Turma é obrigatória'],
    trim: true,
  },
  grade: {
    type: String,
    required: [true, 'Série é obrigatória'],
    trim: true,
  },
  birthDate: {
    type: Date,
  },
  parentName: {
    type: String,
    trim: true,
  },
  parentPhone: {
    type: String,
    trim: true,
  },
  parentEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  enrollmentNumber: {
    type: String,
    required: [true, 'Matrícula é obrigatória'],
    unique: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'transferred'],
    default: 'active',
  },
}, {
  timestamps: true,
})

export default mongoose.models.Student || mongoose.model('Student', studentSchema)