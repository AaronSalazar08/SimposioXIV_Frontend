import { AUTH_TOKEN_KEY } from '../constants/auth'

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function removeAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}
