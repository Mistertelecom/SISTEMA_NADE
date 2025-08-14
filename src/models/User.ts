import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

export interface IUser {
  _id: string
  email: string
  password: string
  name: string
  role: 'admin' | 'teacher' | 'coordinator'
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  createdAt: Date
  updatedAt: Date
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
  },
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'coordinator'],
    default: 'teacher',
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
}, {
  timestamps: true,
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model('User', userSchema)