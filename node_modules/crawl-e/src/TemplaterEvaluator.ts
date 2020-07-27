import * as ObjectPath from 'object-path'
import * as moment from 'moment'
import * as _ from 'underscore'
import { RequestObject } from './RequestMaker'

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
  static evaluate (template: string | object, context: any) {
    if (typeof template === 'string') {
      return this.evaluateString(template, context)
    } else if (typeof template === 'object') {
      let jsonString = JSON.stringify(template)
      jsonString = this.evaluateString(jsonString, context)
      return JSON.parse(jsonString)
    } else {
      return template
    }
  }

  /**
   * Resolves the placeholders in a template request's url and payload.  
   * @param requestTemplate a request template object with placeholders  
   * @param context 
   */
  static evaluateRequestObject(requestTemplate: RequestObject, context: any): RequestObject {
    return {
      url: this.evaluate(requestTemplate.url, context),
      postData: TemplaterEvaluator.evaluate(requestTemplate.postData, context)
    }
  }

  private static evaluateString(template: string, context: any) {
    let url = template
    let placeholders = template.match(/\:[a-z\.]*(\([^)]*\)){0,1}\:/gi) || []
    placeholders.forEach((placeholder: string) => {
      let keyPath = placeholder.slice(1, -1)
      keyPath = keyPath.replace(/\([^)]*\)/, '')
      let value
      if (value = ObjectPath.get(context, keyPath)) {
        if (value instanceof moment) {
          value = (value as moment.Moment).format(context.dateFormat)
        }
        url = url.replace(placeholder, value)
      }
    })
    return url
  }

  /**
   * Parses a template string with `:page(*):` placeholder and returns an array of page identifiers. 
   * Only matches a single / the first placeholder.
   * @param template template string that contains  placeholder
   * @returns the list page identifiers or `null` if no valid placeholder was found
   */
  static parseStaticPages(template: string | null | undefined): string[] | null {
    if (!template) { return null }
    let rangeMatch = template.match(/\:page\((\d+),(\d+)\)\:/)
    if (rangeMatch) {
      return _.range(parseInt(rangeMatch[1]), parseInt(rangeMatch[2]) + 1).map(i => `${i}`)
    }
    let match = template.match(/\:page\(\[([^\]]*)\]\)\:/)
    if (!match) { return null }
    return match[1].split(',')
  }
}
