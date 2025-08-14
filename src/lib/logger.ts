type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  userId?: string
  method?: string
  url?: string
  statusCode?: number
  duration?: number
  [key: string]: unknown
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? JSON.stringify(context) : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${contextStr}`
  }

  info(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('info', message, context)
    if (this.isDevelopment) {
      console.log(formatted)
    }
    // Em produção, enviar para serviço de logging (ex: Winston, DataDog, etc.)
  }

  warn(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('warn', message, context)
    if (this.isDevelopment) {
      console.warn(formatted)
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error?.message,
      stack: error?.stack,
    }
    const formatted = this.formatMessage('error', message, errorContext)
    
    if (this.isDevelopment) {
      console.error(formatted)
    }
    
    // Em produção, enviar para serviço de monitoramento
    // Nunca expor informações sensíveis em logs de produção
    this.logToService('error', message, errorContext)
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const formatted = this.formatMessage('debug', message, context)
      console.debug(formatted)
    }
  }

  // Método para enviar logs para serviços externos em produção
  private logToService(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.isDevelopment) {
      // Aqui você pode integrar com serviços como:
      // - Winston para arquivos
      // - DataDog, New Relic, Sentry para monitoramento
      // - AWS CloudWatch, etc.
      
      // Por enquanto, armazenar apenas erros críticos sem dados sensíveis
      const sanitizedContext = this.sanitizeContext(context)
      
      // Exemplo de integração futura:
      // await sendToMonitoringService({ level, message, context: sanitizedContext })
    }
  }

  // Remove informações sensíveis dos logs
  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined
    
    const sanitized = { ...context }
    
    // Remove campos sensíveis
    delete sanitized.password
    delete sanitized.token
    delete sanitized.secret
    delete sanitized.key
    
    // Mascara email parcialmente se presente
    if (sanitized.email && typeof sanitized.email === 'string') {
      const email = sanitized.email as string
      const [username, domain] = email.split('@')
      sanitized.email = `${username.slice(0, 2)}***@${domain}`
    }
    
    return sanitized
  }
}

// Singleton instance
const logger = new Logger()

export default logger