import * as url from 'url'
import * as _ from 'underscore'
import Context from './Context'

namespace Mappers {

  /**
   * Turns a relative href into a full url accoring to the parsed url
   * @param href href value, e.g. grabbed from a link tag
   * @param context 
   */
  export function mapHref(href: string, context?: Context): string | null { 
    if (href && context.requestUrl) {
      href = url.resolve(context.requestUrl, href)
      let host = url.parse(href).host
      href = href.replace(new RegExp(`${host}\/${host}`), host)
    }
    return href
  }

}

export default Mappers