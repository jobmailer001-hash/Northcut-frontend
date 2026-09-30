// The server could not be reached (offline, DNS, CORS, server down).
export class NetworkError extends Error {
  constructor(message = 'Unable to reach the server. Check your connection and try again.') {
    super(message)
    this.name = 'NetworkError'
  }
}

// The request took longer than the http instance's timeout.
export class RequestTimeoutError extends Error {
  constructor(message = 'The request took too long. Please try again.') {
    super(message)
    this.name = 'RequestTimeoutError'
  }
}

// The server answered with the `{ error: { code, message, details? } }` envelope.
export class ApiError extends Error {
  constructor({ status, code, message, details }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

// The access token expired and the refresh cookie could not renew it.
export class SessionExpiredError extends Error {
  constructor(message = 'Your session has expired. Please log in again.') {
    super(message)
    this.name = 'SessionExpiredError'
  }
}
