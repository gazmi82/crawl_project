/**
 * The Logger interface allows to implement a custom Logger.
 */
interface Logger {
    /**
     * Logs debug level messages.
     * @param namespace The context or scope of the debug message
     * @param message The main message to be logged
     * @param optionalParams Addtional details to be logged
     */
    debug: (namespace: string, message?: any, ...optionalParams: any[]) => void;
    /**
     * Logs info level messages.
     * @param message The main message to be logged
     * @param optionalParams Addtional details to be logged
     */
    info: (message?: any, ...optionalParams: any[]) => void;
    /**
     * Logs warning level messages.
     * @param message The main message to be logged
     * @param optionalParams Addtional details to be logged
     */
    warn: (message?: any, ...optionalParams: any[]) => void;
    /**
     * Logs error level messages.
     * @param message The main message to be logged
     * @param optionalParams Addtional details to be logged
     */
    error: (message?: any, ...optionalParams: any[]) => void;
}
/**
 * Default Logger class. Logs as following:
 * - debug →   the [debug](https://github.com/visionmedia/debug) package. See [Debug Logs](http://crawl-e.internal.cinepass.de/#/basics/debug-logs) in the framework documentation.
 * - info →    `console.log()` in default color
 * - warning → `console.log()` in yellow color
 * - error →   `console.log()` in red color
 */
declare class DefaultLogger implements Logger {
    logStyle: {
        warn: string;
        error: string;
    };
    /**
     * Logs a message via the debug module
     * @param debugPrefix prefix for the debug module
     * @param msg
     */
    debug(debugPrefix: string | null, ...msg: any[]): void;
    info(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
}
/**
 * Placeholder Logger implemenation that actually logs nothing.
 */
declare class SilentLogger implements Logger {
    debug(debugPrefix: string | null, msg: any): void;
    info(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
}
/**
 * Object to bridges a reference to a logger, so that the underlying logger can be changed anywhere for all usages.
 */
declare class LoggerProxy implements Logger {
    logger: Logger;
    constructor(logger: Logger);
    debug(name: string, message?: any, ...optionalParams: any[]): void;
    info(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
}
export default Logger;
export { Logger, DefaultLogger, SilentLogger, LoggerProxy };
