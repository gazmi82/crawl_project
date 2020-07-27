class ConfigError extends TypeError {
  subError?: Error
  constructor (message: string = null, subError: Error = null) {
    let errMessage = message || subError.message
    super(message) // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
    this.name = 'ConfigError'
    this.subError = subError
  }
}

export {
  ConfigError
}
