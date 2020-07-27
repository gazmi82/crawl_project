import loadSchema from './load-schema.js'

const marked_inline = (str) => marked(str).replace(/<\/{0,1}p>/g, '')

export function renderSchemaPropertyRow (row) {
  let indentHtml = `<span class="indent"></span>`
  let indentions = _.range(row.indentionLevel).map(i => indentHtml).join('')
  let requiredTag = (row.isRequired || row.required) ? `<span class="symbol tag required">required</span>` : null
  let nullableTag = (row.isNullable || row.nullable) ? `<span class="symbol tag nullable">nullable</span>` : null
  let optionalTag = (row.isOptional || row.optional) ? `<span class="symbol tag optional">optional</span>` : null

  let nameHtml = `<code>${row.name}</code>`
  if (row.nameHref) {
    nameHtml = `<a href="${row.nameHref}">${nameHtml}</a>`
  }
  nameHtml = `<span>${nameHtml}</span>`

  let labels = _.chain(row.typeTags)
    .compact()
    .map(tag => {
      let cssClass = `symbol ${tag.cssClass}`
      return tag.href
        ? `<a class="${cssClass}" href="${tag.href}">${tag.label}</a>`
        : `<span class="${cssClass}">${tag.label}</span>`
    })
    .value()
    .join('')

  let cols = [
    `<span class="col names">${indentions}<span>${_.compact([nameHtml, requiredTag, nullableTag, optionalTag]).join('')}</span></span>`,
    `<span class="col labels">${labels}</span>`,
    `<span class="col">${row.descriptionHtml}</span>`
  ]

  return `<p class="api-reference-row"><span class="rowContent">${cols.join('')}</span></p>`
}

/**
 * Renders a the schema's propierties.
 * @param maxDepth maximum depth of rendering sub schemas. Pass -1 for unlimited. Default: unlimited.
 */
const renderSchemaList = (schemaName, parentKeyPath, maxDepth, next) => {
  if (maxDepth.constructor === Function) {
    next = maxDepth
    maxDepth = -1
  }

  parentKeyPath = parentKeyPath || []
  loadSchema(schemaName, schema => {
    var html = []

    function resolveAllOf (schema, cb) {
      async.eachSeries(schema.allOf || [], (subSchema, cb) => {
        if (subSchema['$ref']) {
          return loadSchema(subSchema['$ref'], refedSubSchema => {
            if (refedSubSchema.allOf) {
              return resolveAllOf(refedSubSchema, () => {
                if (refedSubSchema.properties) {
                  schema.properties = Object.assign({}, schema.properties, refedSubSchema.properties)
                }
                cb()
              })
            }
            if (refedSubSchema.properties) {
              schema.properties = Object.assign({}, schema.properties, refedSubSchema.properties)
            }
            cb()
          })
        } else {
          if (subSchema.allOf) {
            return resolveAllOf(subSchema, () => {
              if (subSchema.properties) {
                schema.properties = Object.assign({}, schema.properties, subSchema.properties)
              }
              cb()
            })
          }
          if (subSchema.properties) {
            schema.properties = Object.assign({}, schema.properties, subSchema.properties)
          }
          cb()
        }
      }, cb)
    }

    function renderSchemaObjectProperties (schema, parentKeyPath, maxDepth, cb) {
      resolveAllOf(schema, () => {
        async.eachOfSeries(schema.properties, (prop, key, cb) => {
          let keyPath = parentKeyPath.concat([key])
          renderSchemaProperty(prop, keyPath)
          let subSchemaRef = prop['$ref']
          // console.log(parentKeyPath, parentKeyPath.length, 'vs.', maxDepth)
          if (prop.type === 'object' && prop.properties || prop.allOf) {
            renderSchemaObjectProperties(prop, keyPath, maxDepth, cb)
          } else if (subSchemaRef && (maxDepth === -1 || parentKeyPath.length < maxDepth)) {
            // console.log(parentKeyPath.join('.'), key)
            if (parentKeyPath.indexOf(key) !== -1 && key !== 'showtimes') {
              // console.log(`renderSchemaList: circular $ref at ${keyPath.join('.')}`)
              html.pop() // remove row with circular, e.g. movies.detes.movies, dates boxes my only have movie boxes if not being in a movie box before
              cb()
            } else {
              renderSchemaList(subSchemaRef, keyPath, maxDepth, subSchemaHtml => {
                html.push(subSchemaHtml)
                cb()
              })
            }
          } else {
            cb()
          }
        }, cb)
      })
    }

    function renderSchemaProperty (prop, keyPath) {
      if (keyPath[0] === 'showtimes' && prop.oneOf) {
        prop['$ref'] = prop.oneOf[0]['$ref']
      }

      let shouldLinkToDetailsPage = false
      let isValueGrabber = false
      let types = (prop.type instanceof Array) ? prop.type : [prop.type || prop.typeof]

      let typeTags = types.filter(type => type !== 'null').map(type => {
        var typeClass
        var typeLabel
        switch (type) {
          case 'string': typeClass = 'string'; break
          case 'function': typeClass = 'function'; break
          case 'object': typeClass = 'object'; break
          case 'integer': typeClass = 'integer'; break
          case 'number': typeClass = 'double'; break
          case 'boolean': typeClass = 'boolean'; break
          case 'array':
            if (prop.items && prop.items.type) {
              typeClass = prop.items.type
              typeLabel = `${typeClass}[]`
            } else {
              typeClass = 'array'
              typeLabel = 'unkown[]'
            }
            break
          case 'ValueGrabber':
            isValueGrabber = true
            return {
              cssClass: 'value-grabber',
              href: '#/basics/value-grabber',
              label: 'Value Grabber'
            }
          default:
            typeClass = `unknown ${type}`
            typeLabel = type
        }

        if (prop['$ref'] || _.last(keyPath) === 'cinemas') {
          typeClass = 'object'
        }

        if (typeClass === 'object' && _.last(keyPath) === 'delimiter') {
          typeClass = 'regex'
          typeLabel = '/regex/'
        }

        if (typeClass === 'object' || typeClass === 'function') {
          shouldLinkToDetailsPage = true
        }

        if (_.last(keyPath) === 'postData') {
          shouldLinkToDetailsPage = false
        }

        return {
          cssClass: typeClass,
          label: typeLabel || typeClass
        }
      })

      let href
      if (shouldLinkToDetailsPage) {
        let key = _.last(keyPath)
        if (key === 'hooks') {
          href = '#/api/hooks/'
        } else if (keyPath[0] === 'hooks' || schemaName === 'config-schema_hooks.json' && keyPath.length === 1) {
          href = `#/api/hooks/${key}`
        } else if (key === 'parser') {
          href = `#/api/hooks/${schemaName.match(/([a-z]+)-parsing/)[1]}Parser`
        } else {
          href = `#/api/${key}`
        }
      }

      let descriptionHtml = `<span class="col">${_.compact([
        prop.description ? marked_inline(prop.description) : null,
        _.has(prop, 'default') ? marked_inline(`Defaults to \`${prop.default}\`.`) : null,
        _.has(prop, 'example') ? marked_inline(`Example: \`${prop.example}\`.`) : null,
        _.has(prop, 'enum') ? 'Enum: ' + marked_inline(prop.enum.map(e => '`' + e + '`').join(', ')) : null
      ]).join('<br>')}</span>`

      if (isValueGrabber) {
        descriptionHtml = descriptionHtml.replace(`Value Grabber`, `<a href="#/basics/value-grabber">Value Grabber</a>`)
      }

      html.push(renderSchemaPropertyRow({
        name: keyPath.join('.'),
        nameHref: href,
        indentionLevel: keyPath.length - 1,
        typeTags: typeTags,
        isRequired: schema.required && schema.required.indexOf(_.last(keyPath)) >= 0,
        isNullable: (prop.type instanceof Array) && prop.type.indexOf('null') !== -1,
        descriptionHtml: descriptionHtml
      }))
    }

    renderSchemaObjectProperties(schema, parentKeyPath, maxDepth, () => {
      if (parentKeyPath.length === 0) {
        html.unshift('<div class="api-reference">')
        html.push('</div>')
      }
      next(html.join('\n'))
    })
  }, err => {
    console.error(err)
    next(`<span class="error">failed to load schema named <i>${schemaName}</i></span>`)
  })
}

export default renderSchemaList
