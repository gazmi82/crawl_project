import * as _ from 'underscore'
/** @private */
const Iso6391 = require('iso-639-1')
import Constants from './Constants'

/** @private */
export const SUBTITLES_UNDETERMINED = Constants.SUBTITLES_UNDETERMINED
/** @private */
export const ORIGINAL_VERSION = Constants.ORIGINAL_VERSION

export interface LanguageVersion {
  language: string | null
  subtitles: string[] | string | null 
}

/** @private */
let map: { [token: string]: LanguageVersion } = {}

let langugeMap = {
  [ORIGINAL_VERSION]: ['o', 'o.v', 'OV', 'Ov/', 'orig', 'orig. språk', 'original', 'originalsprache', 'originalversion', 'vo'],
  en: ['e', 'eng', 'engl', 'englisch', 'english-spoken', 'version anglaise'],
  de: ['d', 'de', 'dt', 'deu', 'deut', 'deutsch', 'german'],
  'de-ch': ['schweizerdeutsch'],
  es: ['s', 'sp', 'span', 'spanish', 'vo espagnole'], 
  it: ['i', 'it', 'ita', 'ital', 'itali', 'italian', 'italienisch', 'vo italienne'],
  fr: ['f', 'fra', 'frz', 'fran', 'franz', 'französisch', 'v.f.', 'version originale en français'],
  pl: ['polski'],
  ru: ['russian', '(russ.)'],
  tr: ['türkisch', 'türk.'],
  gu: ['gujarati'],
  hi: ['hindi'],
  ja: ['japanese', 'jpn'],
  kn: ['kannada'],
  kok: ['konkani'],
  ml: ['malayalam'],
  mr: ['marathi'],
  ko: ['kor'],
  ne: ['nepali']
}

/** @private */
function mapping(code): LanguageVersion {
  return code === ORIGINAL_VERSION
    ? { language: code, subtitles: null }
    : { language: code, subtitles: [code] }
}

Iso6391.getAllCodes()
  .filter(code => code !== 'la') // filter la as 1. la is a common article and 2. latin is not a spoken language we need to care of
  .forEach(code => {
  map[code] = mapping(code)
  map[Iso6391.getName(code).toLocaleLowerCase()] = mapping(code)
  map[Iso6391.getNativeName(code).toLocaleLowerCase()] = mapping(code)
})

_.mapObject(langugeMap, (inputs, code) => {
  inputs.map(k => k.toLocaleLowerCase()).forEach(key => {
    map[key] = mapping(code)
  })
})


map['mit untertitel'] = { language: null, subtitles: SUBTITLES_UNDETERMINED }
map['omdtu'] = { language: ORIGINAL_VERSION, subtitles: ['de'] }
map['omdu'] = { language: ORIGINAL_VERSION, subtitles: ['de'] }
map['omeu'] = { language: ORIGINAL_VERSION, subtitles: ['en'] }
map['omu'] = { language: ORIGINAL_VERSION, subtitles: SUBTITLES_UNDETERMINED }
map['subs'] = { language: null, subtitles: SUBTITLES_UNDETERMINED }

export default map