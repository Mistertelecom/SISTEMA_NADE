import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'admin' | 'teacher' | 'coordinator'
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'admin' | 'teacher' | 'coordinator'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'admin' | 'teacher' | 'coordinator'
  }
}