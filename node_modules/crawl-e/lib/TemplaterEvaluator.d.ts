import { RequestObject } from './RequestMaker';
/**
 * Class with static functions to fill placeholders in templates with actual value.
 */
export default class TemplaterEvaluator {
    /**
     * Resolves placeholders in a url template string or json object in a given context,
     * such as interation on a single cinemas.
     * @param template
     * @param context
     * @returns the template with the placeholders
     */
    static evaluate(template: string | object, context: any): any;
    /**
     * Resolves the placeholders in a template request's url and payload.
     * @param requestTemplate a request template object with placeholders
     * @param context
     */
    static evaluateRequestObject(requestTemplate: RequestObject, context: any): RequestObject;
    private static evaluateString;
    /**
     * Parses a template string with `:page(*):` placeholder and returns an array of page identifiers.
     * Only matches a single / the first placeholder.
     * @param template template string that contains  placeholder
     * @returns the list page identifiers or `null` if no valid placeholder was found
     */
    static parseStaticPages(template: string | null | undefined): string[] | null;
}
