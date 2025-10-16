export interface User {
  id: string
  name: string
  email: string
  createdAt?: string
}

export interface SignUpCredentials {
  name: string
  email: string
  password: string
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface AuthError {
  message: string
  statusCode?: number
}
