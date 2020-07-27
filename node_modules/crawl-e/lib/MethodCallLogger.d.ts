declare namespace MethodCallLogger {
    function currentMethodName(offset?: number): string;
    function logMethodCall(...optionalParams: any[]): void;
}
export default MethodCallLogger;
