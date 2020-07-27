declare class ConfigError extends TypeError {
    subError?: Error;
    constructor(message?: string, subError?: Error);
}
export { ConfigError };
