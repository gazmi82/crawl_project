import Context from './Context';
declare namespace Mappers {
    /**
     * Turns a relative href into a full url accoring to the parsed url
     * @param href href value, e.g. grabbed from a link tag
     * @param context
     */
    function mapHref(href: string, context?: Context): string | null;
}
export default Mappers;
