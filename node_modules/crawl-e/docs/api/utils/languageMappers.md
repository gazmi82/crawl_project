# Mapper Functions for common Languages and Subtitles {docsify-ignore-all}

## `mapLanguage` 

```typescript
/**
 * Maps a parsed language string into a ISO 639 code or `original version`.
 * @param languauge 
 * @returns the ISO 639 code for the given language or `null` if not found
 */
function mapLanguage(language: string) => string | null
```

{{demo:mapLanguage}}

## `mapSubtitles`
```typescript
/**
 * Maps a parsed string of sub titles into an ISO 639 code array or `undetermined`.
 * @param subtitles 
 * @returns the ISO 639 code as array, `undetermined` or `null` if not found
 */
function mapSubtitles(subtitles: string) => string[] | string | null
```

{{demo:mapSubtitles}}

<br><br><br>

# Matching Functions for common Languages and Subtitles 


## `matchLanguage`
```typescript
/**
 * Checks a text for matching language or original version info.
 * @param test 
 * @returns the ISO 639 code for the given language, `original version` or `null` if not found
 */
function matchLanguage(text: string): string | null 
```

{{demo:matchLanguage}}


## `matchSubtitles`
```typescript
/**
   * Checks a text for matching subtiles info.
   * @param test 
   * @returns the ISO 639 code for matched subtitles, `'undetermined'` or `null` if not found
   */
function matchSubtitles(text: string): string | null
```

{{demo:matchSubtitles}}



